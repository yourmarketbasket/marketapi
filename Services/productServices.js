const Product = require('../models/products');
const Cart = require('../models/cart');
const Order = require('../models/orders');
const Store = require('../models/stores');
const User = require('../models/user');
const axios = require('axios');
const https = require('https');




const Payments = require('./paymentService');
const EventEmitService = require('./eventService');

class ProductService {  

    static async addToCart(data, io) {
            try {
                // Find the user's existing cart or create a new one if it doesn't exist
                const existingCart = await Cart.findOne({ buyerid: data.userid });
        
                const totalcost = data.quantity * data.price*(1-(data.discount/100));
                const p = await Product.findOne({_id:data.productid});
        
                if (!existingCart) {
                    // get the product quantity
                    // If the user doesn't have an existing cart, create a new one
                    let available = p.quantity - data.quantity;
                    if(available>=0){
                        const newCart = await Cart.create({
                            amount: totalcost,
                            buyerid: data.userid,
                            items: 1,
                            products: [
                                {
                                    productid: data.productid,
                                    quantity: data.quantity,
                                    storeid: data.storeid,
                                    available: available,
                                    totalCost: parseFloat(totalcost.toFixed(2)),
                                    price: parseFloat((data.price*(1-(data.discount/100))).toFixed(2)),
                                    productmodel: data.model,
                                    productname: data.name,
                                    avatar: data.avatar,
                                    discount: data.discount,
                                },
                            ],
                        });
            
                        if (newCart) {
                            EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.userid, message:"New Cart Created with the Product" })        
                            return {success:true,available:available, message: "New Cart Created with the Product"}
                        } else {
                            return {success:false, available:available, message: "Something went wrong while creating the cart."}
                        }

                    }else{
                        return {success:false,available:available, message: "Inadequate Product Quantity"}
                    }
                    
                } else {
                    const thiscart = await Cart.findOne(
                        {
                            buyerid: data.userid,
                            products: { $elemMatch: { productid: data.productid } },
                        })
                    if(thiscart){
                        const existingProduct = thiscart.products.find(product=>product.productid === data.productid);                    
                        if((existingProduct.available-data.quantity)>=0){
                            const totalCost = data.quantity*data.price*(1-(data.discount/100))
                            const updateProduct = await Cart.findOneAndUpdate(
                                {
                                    buyerid: data.userid,
                                    products: { $elemMatch: { productid: data.productid } },
                                },
                                {
                                    $inc: { 
                                        "products.$.quantity": data.quantity, 
                                        "products.$.totalCost": parseFloat(totalcost.toFixed(2)), 
                                        "products.$.available":-data.quantity, 
                                        amount: totalCost.toFixed(2)
                                    }
                                }
                            );
                            if (updateProduct) {
                                const targetProduct = updateProduct.products.find(product=>product.productid === data.productid);
                                if(targetProduct){  
                                    EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.userid, message:"Cart Product Updated" })          
                                    return { success: true, available: targetProduct.available-data.quantity, message: "Cart Product Updated" };
                                } else {
                                    return { success: false, available: targetProduct.available, message: "Error: Could not update cart product!" };
                                }
                                
                                
                            } else {
                                return { success: false,  message: "Error: Could not update cart product!" };
                                
                            }
                        }else{
                            return {success:false, message: "Sorry...we're running low on this product"}
                        }

                    }else{
                        // Add a new product to the existing cart
                        const p = await Product.findOne({_id:data.productid});
                        let available = p.quantity - data.quantity;
                        const totalcost = data.quantity * data.price*(1-(data.discount/100));
                        existingCart.products.push({
                            productid: data.productid,
                            quantity: data.quantity,
                            storeid: data.storeid,
                            available: available,
                            totalCost: parseFloat(totalcost.toFixed(2)),
                            price: parseFloat((data.price*(1-(data.discount/100))).toFixed(2)),
                            productmodel: data.model,
                            productname: data.name,
                            avatar: data.avatar,
                            discount: data.discount,
                        });
    
                        // Update the amount in the cart
                        existingCart.amount += parseFloat(totalcost.toFixed(2));
                        existingCart.items+=1;
    
                        const addNewItem = await existingCart.save();
    
                        if (addNewItem) {
                            EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.userid, message:"New Product Added to Cart" })   
                            return {success:true,available:available, message: "New Product Added to Cart"}
                        } else {
                            return {success:false,available:available, message: "Error adding product to cart"}
                        }
                    }
                    
                    
                }
            } catch (error) {
                console.log(error)
                return {success: false, message: error};
            }
        
    }

    static async clearCart(data, io){
        try{

            const cart = await Cart.findOneAndDelete({buyerid: data.buyerid});
            if(cart){
                EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:"Cart cleared successfully" })   
                
               
                return {success:true, message:"Cart cleared successfully"};
            }else{
                io.emit('cartoperationsevent', {
                    userid: data.buyerid,
                })
                return {success:false, message:"Failed to clear cart"};
            }

        }catch(e){
            EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:e })   

            return {success:false, message:e};
            

        }
        
    }
    
    
    static async availableProductQuantityForUser(data) {
        try {
            // Check if the product is in the user's cart
            const productInCart = await Cart.findOne(
                {
                    buyerid: data.userid,
                    products: { $elemMatch: { productid: data.productid } },
                },
                { 'products.$': 1 }
            );
    
            if (productInCart && productInCart.products.length > 0) {
                // If the product is in the cart, return the available quantity from the cart
                const availableQuantity = productInCart.products[0].available;
                return { quantity: availableQuantity, success: true };
            } else {
                // If the product is not in the cart, look it up in the product collection
                const product = await Product.findOne({ _id: data.productid });
    
                if (product) {
                    return { quantity: product.quantity, success: true };
                } else {
                    // Handle the case when the product is not found in the product collection
                    return { quantity: 0, success: false };
                }
            }
        } catch (error) {
            console.error(error);
            return { quantity: 0, success: false };
        }
    }

    static async editCartProductQuantity(data, io) {
        try{
            const cart = await Cart.findOne({buyerid: data.buyerid});
            const product = await cart.products.find(item=>item.productid === data.productid);
            if(product){
                // console.log(product)
                const totalProductAmount = product.available+product.quantity;
                if(data.quantity<=totalProductAmount){
                    const newavailable = totalProductAmount-data.quantity;
                    const thiscost  = product.price*data.quantity;
                    const newcartamount = (cart.amount - product.totalCost)+thiscost

                    // // Update the specific product in the cart
                    const reduce = await Cart.findOneAndUpdate(
                        { 
                            buyerid: data.buyerid,
                            products: { $elemMatch: { productid: data.productid } },
                        },
                        {
                            $set: {
                                'products.$.quantity': data.quantity, 
                                'products.$.available': newavailable, 
                                'products.$.totalCost': thiscost, 
                                amount: newcartamount
                            }
                        }
                    );
                    EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:'Product quantity updated' })      
                    return { success: true, message: 'Product quantity updated' };

                }else{
                    return { success: false, message: 'Inadequate quantity' }; 
                }
                
            }else{

                return { success: false, message: 'Product not found in the cart' };

            }
            

        }catch(e){
            return { success: false, message: e };
        }
    }
    

    static async numberOfItemsInCart(userid){
        const num = await Cart.findOne({buyerid:userid});
        
        if(num){
            // console.log(num[0].items)
            return {
                success: true,
                count: num.items
            };
        }else{
            return {
                success: false,
                count:0
            }
        }
    }

    static async getCartItems(userid){
        const items = await Cart.find({buyerid:userid});
        if(items){
            return {items: items, success:true}
        }else{
            return {items:[], success:false}
        }
    }

    static async getProductDetails(id){
        const product = await Product.find({_id:id});
        if(product){
            return {product:product, success:true}
        }
    }// Update the path accordingly

    static async reduceQttyByOne(data, io) {
        try {
            // Find the cart and the specific product
            const cart = await Cart.findOne({ buyerid:data.buyerid });
            const product = await cart.products.find(item => item.productid === data.productid);
            // console.log(product.quantity)

            if (!product) {
                return { success: false, message: 'Product not found in the cart' };
            }
            
            // Check if the quantity is greater than 1 before reducing
            if (product.quantity > 1) {
                // console.log(product)
                const thiscost =product.price;


                // Update the specific product in the cart
                const reduce = await Cart.findOneAndUpdate(
                    { 
                        buyerid: data.buyerid,
                        products: { $elemMatch: { productid: data.productid } },
                    },
                    {
                        $inc: { 'products.$.quantity': -1, 'products.$.available': 1, 'products.$.totalCost': -thiscost, amount: -thiscost  },
                    }
                );
                EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:'Product quantity reduced by one' })      

                return { success: true, message: 'Product quantity reduced by one' };
            } 
        } catch (error) {
            return { success: false, message: 'Error reducing product quantity' };
        }
    }

    static async increaseQttyByOne(data, io){
        // console.log(data)
        try {
            // Find the cart and the specific product
            const cart = await Cart.findOne({ buyerid:data.buyerid });
            const product = await cart.products.find(item => item.productid === data.productid);
            // console.log(product.quantity)

            if (!product) {
                return { success: false, message: 'Product not found in the cart' };
            }
            
            // Check if the quantity is greater than 1 before reducing
            if (data.available > 0) {
                // console.log(product)
                const thiscost =product.price;


                // Update the specific product in the cart
                const reduce = await Cart.findOneAndUpdate(
                    { 
                        buyerid: data.buyerid,
                        products: { $elemMatch: { productid: data.productid } },
                    },
                    {
                        $inc: { 'products.$.quantity': 1, 'products.$.available': -1, 'products.$.totalCost': thiscost, amount: thiscost  },
                    }
                );
                EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:'Product quantity increased by one' })     
                  
              

                return { success: true, message: 'Product quantity increased by one' };
            } 
        } catch (error) {
            return { success: false, message: 'Error increasing product quantity' };
        }

    }

    static async removeCartItem(data, io){
        try {
            // Find the cart and the specific product
            const cart = await Cart.findOne({ buyerid:data.buyerid });
            const product = await cart.products.find(item => item.productid === data.productid);
    
            if (!product) {
                return { success: false, message: 'Product not found in the cart!' };
            }else{
                // Remove the specific product from the cart
                const remove = await Cart.updateOne(
                    { 
                        buyerid:data.buyerid,
                    },
                    {
                        $pull: {products: {productid: data.productid}},
                        $inc: {amount: -product.totalCost, items: -1}
                    }
                );
                if(remove){
                    EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:'Product deleted' })  
                  

                    // delete the cart if the amount is zero
                    if((cart.amount-product.totalCost) == 0){
                        EventEmitService.emitEventMethod(io, 'cartoperationsevent', {userid:data.buyerid, message:'Cart Cleared' })  
                        await Cart.deleteOne({buyerid:data.buyerid});
                        return { success: true, message: 'Cart Cleared' };
                    }
                    return { success: true, message: 'Product deleted from Cart' };           

                }

            }
    
        } catch (error) {
            console.log(error)
            return { success: false, message: 'Error deleting product from the cart' };
        }
    }
    
    static async paystackCallBack(data){
        return data
    }
    static async paystackWebhook(data){
        return data
    }
    static async getDistanceAndTimeData(userid) {
        try {
            const origins = [];
            const user = await User.findOne({ _id: userid });
            const cart = await Cart.findOne({ buyerid: userid });

            if (cart && cart.products && cart.products.length > 0) {
                const productIds = cart.products.map(item => item.productid);

                for (const productId of productIds) {
                    const product = await Product.findOne({ _id: productId });

                    if (product) {
                        const store = await Store.findOne({ _id: product.storeid });

                        if (store && store.location) {
                            const storeLocationObject = {
                                lat: store.location.latitude,
                                lng: store.location.longitude,
                            };
                            origins.push(storeLocationObject);
                        }
                    }
                }

                const uniqueOrigins = Array.from(new Set(origins.map(JSON.stringify))).map(JSON.parse);
                const destination = {
                    lat: user.location.latitude,
                    lng: user.location.longitude,
                };

                const apiKey = 'AIzaSyDdvqTHmz_HwPar6XeBj8AiMxwzmFdqC1w'; // Replace with your actual API key
                const originsQueryString = uniqueOrigins.map(location => `${location.lat},${location.lng}`).join('|');
                const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination.lat},${destination.lng}&origins=${originsQueryString}&units=imperial&key=${apiKey}`;

                // Use synchronous https.get instead of promisified version
                const response = await new Promise((resolve, reject) => {
                    https.get(url, (res) => {
                        let data = '';

                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', () => {
                            resolve(data);
                        });

                        res.on('error', (error) => {
                            reject(error);
                        });
                    });
                });

                try {
                    const distanceMatrixData = JSON.parse(response);

                    let totalDistance = 0;
                    let totalTime = 0;

                    distanceMatrixData.rows.forEach(element => {
                        totalDistance += element.elements[0].distance.value;
                        totalTime += element.elements[0].duration.value;
                    });

                    return {
                        success: true,
                        data: {
                            duration: ProductService.convertValue(parseInt(totalTime), 'duration'),
                            distance: ProductService.convertValue(parseInt(totalDistance), 'distance')
                        }
                    };
                } catch (parseError) {
                    return { success: false, message: 'Error parsing distance matrix data' };
                }
            } else {
                return { success: false, message: "Error Occurred" };
            }
        } catch (error) {
            return { success: false, message: error };
        }
    }


    static convertValue(value, identifier){
    if (typeof value !== 'number' || (identifier !== 'duration' && identifier !== 'distance')) {
        return { error: 'Invalid input' };
    }
    
    const result = {};
    
    if (identifier === 'distance') {
        if (value >= 1000) {
        const kilometers = value / 1000;
        result.value = kilometers.toFixed(2) + ' km';
        result.logisticsFee = 1 * kilometers;
        } else {
        result.value = value.toFixed(2) + ' meters';
        result.logisticsFee = 0; // No fee for distances less than 1000 meters
        }
    } else if (identifier === 'duration') {
        if (value >= 3600) {
        const hours = Math.floor(value / 3600);
        const remainingMinutes = Math.floor((value % 3600) / 60);
        result.value = `${hours} hours ${remainingMinutes} minutes`;
        } else if (value >= 60) {
        const minutes = Math.floor(value / 60);
        const remainingSeconds = value % 60;
        result.value = `${minutes} minutes ${remainingSeconds} seconds`;
        } else {
        result.value = value + ' seconds';
        }
    }
    
    return result;
    }

    static async emitEventMethod(io, eventname, userid){
        io.emit(eventname, {
            userid: userid,
        })

    }

    static async getProductDetails(data, io){
        const product = await Product.find({_id:data.pid});
        if(product){
            const recordView = await ProductService.addProductView(data,io);
            if(recordView.success){
                return {productDetails: product, success:true};
            }else{
                return {message: "Error recording view",productDetails: product, success:true};
            }
        }else{
            return {success: false};
        }

    }

    static async addProductView(data, io) {
        try {
            const product = await Product.findOne({ _id: data.pid });
    
            if (product) {
                // Check if views exist
                if (!product.views || product.views.length === 0) {
                    // Create a new view object
                    const newView = {
                        totalViews: 1,
                        users: [
                            {
                                userid: data.uid,
                                views: 1
                            }
                        ]
                    };
    
                    // Update the product details
                    await Product.updateOne(
                        { _id: data.pid },
                        { $set: { views: [newView] } }
                    );
    
                    return { success: true, message: "Product Views Updated." };
                } else {
                    // Check if the user already exists in views
                    const existingUserView = product.views.find(view => view.users.some(user => user.userid === data.uid));
    
                    if (existingUserView) {
                        // User exists, increment the view count
                        await Product.updateOne(
                            { _id: data.pid, "views.users.userid": data.uid },
                            {
                                $inc: {
                                    "views.$[outer].users.$[inner].views": 1,
                                    "views.$[outer].totalViews": 1
                                }
                            },
                            {
                                arrayFilters: [
                                    { "outer.users.userid": data.uid },
                                    { "inner.userid": data.uid }
                                ]
                            }
                        );
                    } else {
                        // User does not exist in views, add a new user entry within the original object
                        await Product.updateOne(
                            { _id: data.pid },
                            {
                                $push: {
                                    "views.0.users": {
                                        userid: data.uid,
                                        views: 1
                                    }
                                },
                                $inc: {
                                    "views.0.totalViews": 1
                                }
                            }
                        );
                    }
    
                    return { success: true, message: "Product Views Updated." };
                }
            } else {
                return { success: false, message: "Product not found." };
            }
        } catch (e) {
            console.error(e);
            return { success: false, message: e.message || "An error occurred." };
        }
    }

    static async addProduct(data, io){
    // add the data to mongodb
        const product = new Product({
            name: data.name,
            brand: data.brand,
            category: data.category,
            subcategory: data.subcategory,
            description: data.description,
            features: data.features,
            quantity: data.quantity,
            model: data.model,
            bp: data.bp,
            sp: data.sp,
            avatar: data.images,
            storeid: data.storeid,
            discount:0
        });
        try{
            const newProduct = await product.save();
            return { message: 'Product added successfully', success: true, data: newProduct };
        }catch(error){
            return { message: 'Product not Created.', success: false };
        }

    }
    static async categoriesSubcatBrand(io){
        try {
            const productsMap = new Map();
            const brandsSet = new Set();
            const categoriesSet = new Set(); // Adjusted to store categories
            const subcategoriesSet = new Set();
        
            const products = await Product.find({ approved: true, verified: true });
        
            products.forEach(product => {
                const { _id, brand, category, subcategory, name, sp, avatar, discount } = product;
        
                // Trim and ensure non-empty strings
                const cleanBrand = brand.trim();
                const cleanCategory = category.trim();
                const cleanSubcategory = subcategory.trim();
        
                // Check if category is not "n/a" or any variation
                const isNA = cleanCategory.toLowerCase().includes('n/a');
                const isSubCatNA = cleanSubcategory.toLowerCase().includes('n/a');
        
                if (cleanBrand && cleanCategory && cleanSubcategory && !isNA && !isSubCatNA) {
                    // Initialize brand if not already added
                    if (!productsMap.has(cleanBrand)) {
                        productsMap.set(cleanBrand, []);
                        brandsSet.add(cleanBrand); // Add to brands set
                    }
        
                    // Add subcategory under category
                    categoriesSet.add(cleanCategory); // Add to categories set
                    subcategoriesSet.add(cleanSubcategory); // Add to subcategories set
        
                    // Add product to productsMap
                    productsMap.get(cleanBrand).push({ _id, name, sp, avatar, discount, category: cleanCategory }); // Include category
                }
            });
        
            // Convert sets to arrays
            const brandsArray = Array.from(brandsSet);
            const categoriesArray = Array.from(categoriesSet); // Added categoriesArray
            const subcategoriesArray = Array.from(subcategoriesSet);
        
            // Gather all categories
            const categories = Array.from(categoriesSet);
        
            // For each category, randomly select one product
            const categoriesListing = [];
            categories.forEach(category => {
                const eligibleProducts = [];
                productsMap.forEach((brandProducts, brand) => {
                    const productsInCategory = brandProducts.filter(product => product.category === category);
                    if (productsInCategory.length > 0) {
                        eligibleProducts.push(...productsInCategory);
                    }
                });
                if (eligibleProducts.length > 0) {
                    const randomProductIndex = Math.floor(Math.random() * eligibleProducts.length);
                    const randomProduct = eligibleProducts[randomProductIndex];
                    categoriesListing.push({ category, _id: randomProduct._id, name: randomProduct.name, sp: randomProduct.sp, avatar: randomProduct.avatar });
                }
            });
        
            // Shuffle brands
            const shuffledBrands = Array.from(brandsArray);
            for (let i = shuffledBrands.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledBrands[i], shuffledBrands[j]] = [shuffledBrands[j], shuffledBrands[i]];
            }
        
            // Extract 4 products from random brands
            const productsDetails = {};
            for (let i = 0; i < Math.min(4, shuffledBrands.length); i++) {
                const brand = shuffledBrands[i];
                const brandProducts = productsMap.get(brand);
                const shuffledProducts = [...brandProducts].sort(() => Math.random() - 0.5); // Shuffle products
                productsDetails[brand] = shuffledProducts.slice(0, Math.min(4, shuffledProducts.length));
            }
        
            return { success: true, products: productsDetails, brands: brandsArray, categoriesListing, categories, subcategories: subcategoriesArray };
        } catch (e) {
            return { success: false, message: e };
        }
        
    }

    static async reviewListedItem(data, io){
        try {
            const product = await Product.findOne({_id:data.id});
            if(product){
                const verified = product.verified;
                if(verified){
                return {message:"Product already verified, Action not completed!", success:false}
                }else{
                const filter = {_id: data.id};
                const update = { approved: data.action=="approve",rejected:data.action=="reject", verified: true, rejectionReason:data.reason};
                const updateproduct = await Product.findOneAndUpdate(filter, update);
                
                if(updateproduct){
                    const updatedProduct = await Product.findOne({_id:data.id});

                    EventEmitService.emitEventMethod(io, 'addproductevent', {product: updatedProduct});
                    return {message: `${data.action.toUpperCase()} Action completed successfully`, success: true};
                }else{
                    return {message: "Action Failed", success: false}
                }
                }
                
            }

        }catch(e){
            return {success:false, message:e}
        }
    }
    
    
    



   
    

      

    
      
}

module.exports = ProductService