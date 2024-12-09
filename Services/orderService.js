const datetime = require('node-datetime')
const https = require('https');
const axios = require('axios');
const User = require('../models/user');
const Cart = require('../models/cart')
const Payment = require('../models/payment');
const ProductService = require('./productServices');
const Order = require('../models/orders');
const Store = require('../models/stores');
const NotificationService = require('./notificationService');

const Product = require('../models/products');

class OrderService{
    // get store locations
    // getStoreIDsForOrderProducts
    static async getStoreIDsForOrderProducts(orderId) {
        try {
            // Step 1: Fetch the order and extract 'products' and 'destination'
            const order = await Order.findById(orderId).select("products destination");
    
            if (!order) {
                throw new Error("Order not found");
            }
    
            if (!order.products || !Array.isArray(order.products)) {
                throw new Error("'products' is missing or not an array");
            }
    
            if (!order.destination || !order.destination.latitude || !order.destination.longitude) {
                throw new Error("Order destination is invalid or missing latitude/longitude");
            }
    
            const destination = order.destination;
    
            // Step 2: Extract unique store IDs
            const storeIds = order.products.map(product => {
                if (!product.storeid) {
                    throw new Error(`Product ${product.productid} is missing a 'storeid'`);
                }
                return product.storeid;
            });
    
            // Ensure storeIds are unique
            const uniqueStoreIds = [...new Set(storeIds)];
            console.log("Unique Store IDs:", uniqueStoreIds);
    
            // Step 3: Fetch store locations using the store IDs
            const stores = await Store.find({ _id: { $in: uniqueStoreIds } }).select("location storename");
            console.log("Fetched Stores:", stores);
    
            if (!stores || stores.length === 0) {
                throw new Error("No stores found for the given IDs");
            }
    
            // Step 4: Calculate the distance to each store and find the closest one
            let closestStore = null;
            let minDistance = Infinity;
    
            for (const store of stores) {
                if (!store.location || typeof store.location.latitude !== 'number' || typeof store.location.longitude !== 'number') {
                    console.error(`Store ${store._id} (${store.storename}) is missing valid latitude/longitude`);
                    continue;
                }
    
                const storeLocation = store.location;
    
                // Make sure to await the distance calculation if it's a promise
                const distance = this.calculateDistance(destination, storeLocation);
                console.log(`Distance to store ${store.storename}: ${distance} km`);
    
                if (distance < minDistance) {
                    minDistance = distance;
                    closestStore = {
                        storeId: store._id,
                        storename: store.storename,
                        location: store.location,
                        distance: minDistance
                    };
                }
            }
    
            if (!closestStore) {
                throw new Error("Could not determine the closest store");
            }
    
            return closestStore;
        } catch (error) {
            console.error(`Error fetching the closest store: ${error.message}`);
            throw error; // Rethrow error to handle upstream
        }
    }

    // Function to find the closest product based on distance
    static async getClosestProductForOrder(orderId) {
    try {
        // Step 1: Fetch the order to get products and destination
        const order = await Order.findById(orderId).select("products destination");

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        if (!order.products || !Array.isArray(order.products)) {
            return { success: false, error: "'products' is missing or not an array" };
        }

        if (!order.destination || !order.destination.latitude || !order.destination.longitude) {
            return { success: false, error: "Order destination is invalid or missing latitude/longitude" };
        }

        const destination = order.destination;

        // Step 2: Initialize an array to store results for all products in the order
        const allProductResults = [];

        // Step 3: Iterate over each product in the order
        for (const product of order.products) {

            // Step 4: Fetch the full details of the current product
            const currentProduct = await Product.findById(product.productid);
            if (!currentProduct) {
                continue; // Skip if product not found
            }

            // Extract details for finding similar products
            const { model, category, subcategory, brand, name: productName } = currentProduct;

            // Step 5: Search for similar products using relevant criteria
            let similarProducts = [];
            try {
                similarProducts = await Product.find({
                    model,      // Matching the model
                    category,   // Matching category
                    subcategory,// Matching subcategory
                    brand,      // Matching brand
                    rejected: false, // Optional: exclude rejected products
                });
            } catch (err) {
                continue; // Skip if error fetching similar products
            }

            // If no similar products are found, fallback to the original product
            if (!similarProducts || similarProducts.length === 0) {
                similarProducts = [currentProduct];
            }

            // Step 6: Initialize a list to hold similar products for this specific product
            const similarProductsWithDistance = [];

            // Step 7: For each similar product, calculate the distance to the customer
            for (const similarProduct of similarProducts) {

                // Check if the similar product is the same as the current product
                if (similarProduct._id.toString() === currentProduct._id.toString()) {
                    continue;  // Skip if the product is the same as the current product
                }

                if (!similarProduct.storeid) {
                    continue; // Skip if store ID is missing
                }

                // Fetch store details for the product's store
                const store = await Store.findById(similarProduct.storeid).select("location storename");

                if (!store || !store.location || typeof store.location.latitude !== 'number' || typeof store.location.longitude !== 'number') {
                    continue; // Skip if store location is invalid
                }

                // Calculate the distance from the store to the customer
                const storeLocation = store.location;
                const distance = this.calculateDistance(destination, storeLocation);

                // Step 8: Store the similar product and its details with the distance
                similarProductsWithDistance.push({
                    similarProductId: similarProduct._id,
                    similarProductName: similarProduct.name,
                    similarCategory: similarProduct.category,
                    similarBrand: similarProduct.brand,
                    storeId: store._id,
                    storename: store.storename,
                    location: store.location,
                    distance: distance // Distance from the store to the customer
                });
            }

            // Add the results for the current product
            if (similarProductsWithDistance.length > 0) {
                allProductResults.push({
                    currentProductId: currentProduct._id,
                    currentProductName: currentProduct.name,
                    currentCategory: currentProduct.category,
                    currentBrand: currentProduct.brand,
                    similarProducts: similarProductsWithDistance
                });
            }
        }

        // Step 9: Return results
        if (allProductResults.length === 0) {
            return { success: false, error: "No similar products found for the order." };
        }

        return { 
            success: true, 
            data: allProductResults
        };

    } catch (error) {
        return { success: false, error: error.message };
    }
    }
    // mark order status
    static async markOrderStatus(data, io) {
        const { status, orderId, productid } = data;
    
        try {
            // Convert status to lowercase and validate
            const normalizedStatus = status.toLowerCase();
            const validStatuses = ['processing', 'confirm', 'pack', 'dispatch', 'deliver', 'complete'];
            if (!validStatuses.includes(normalizedStatus)) {
                throw new Error('Invalid status provided.');
            }
    
            // Find the order by order ID
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error('Order not found.');
            }
    
            // Update or add the product status in the orderStatus array
            const productIndex = order.orderStatus.findIndex(item => item.productid === productid);
            if (productIndex > -1) {
                // Update existing product status
                order.orderStatus[productIndex].status = normalizedStatus;
            } else {
                // Add new product status
                order.orderStatus.push({ productid, status: normalizedStatus });
            }
    
            // Recalculate the overall status
            order.calculateOverallStatus();
    
            // Save the updated order
            await order.save();

            NotificationService.addNotification({userId:order.buyerid, message: `Order ID: ${orderId}. Your Order of TID(${order.transactionID}) status has been updated to ${normalizedStatus}`, type: "success", link: null}, io)
    
            return { success: true, message: 'Order status updated successfully.', order };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    
    
    // calculate distance
    static calculateDistance(point1, point2) {
        const toRadians = (deg) => (deg * Math.PI) / 180;
    
        const R = 6371; // Earth's radius in kilometers
        const lat1 = toRadians(point1.latitude);
        const lon1 = toRadians(point1.longitude);
        const lat2 = toRadians(point2.latitude);
        const lon2 = toRadians(point2.longitude);
    
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
    
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        return R * c; // Distance in kilometers
    }




}

module.exports = OrderService