const Product = require('../models/products');
const Cart = require('../models/cart');
const Order = require('../models/orders');
const Payments = require('./paymentService');

class ProductService {
    static async addToCart(data) {
        try {
            // Find the user's existing cart or create a new one if it doesn't exist
            const existingCart = await Cart.findOne({ buyerid: data.userid });
    
            const totalcost = data.quantity * data.price;
    
            if (!existingCart) {
                // get the product quantity
                const p = await Product.findOne({_id:data.productid});
                // If the user doesn't have an existing cart, create a new one
                let available = p.quantity - data.quantity;
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
                            totalCost: totalcost,
                            price: data.price,
                            productmodel: data.model,
                            productname: data.name,
                            avatar: data.avatar,
                            discount: data.discount,
                        },
                    ],
                });
    
                if (newCart) {
                    return {success:true,available:available, message: "New Cart Created witht the Product"}
                } else {
                    return {success:false, available:available, message: "Something went wrong while creating the cart."}
                }
            } else {
                // Check if a product exists in the given cart
                const productExist = await Cart.findOneAndUpdate(
                    {
                        buyerid: data.userid,
                        products: { $elemMatch: { productid: data.productid } },
                    },
                    {
                        $inc: { "products.$.quantity": data.quantity, "products.$.totalCost": totalcost, "products.$.available":-data.quantity },
                    },
                    { new: true }
                );
                // console.log(productExist)
                if (productExist) {
                    const targetProduct = productExist.products.find(product=>product.productid === data.productid);
                    if(targetProduct){
                        let cost = data.quantity*data.price;
                        const updateAmount = await Cart.findOneAndUpdate({ buyerid: data.userid }, {
                            $inc: { amount: cost }
                        },
                        {
                            new: true
                        });
                        if (updateAmount) {
                            return { success: true, available: targetProduct.available, message: "Cart Product Updated" };
                        } else {
                            return { success: false, available: targetProduct.available, message: "Error: Could not update cart product!" };
                        }
                    }
                    
                } else {
                    // Add a new product to the existing cart
                    const p = await Product.findOne({_id:data.productid});
                    let available = p.quantity - data.quantity;
                    const totalcost = data.quantity * data.price;
                    existingCart.products.push({
                        productid: data.productid,
                        quantity: data.quantity,
                        storeid: data.storeid,
                        available: available,
                        totalCost: totalcost,
                        price: data.price,
                        productmodel: data.model,
                        productname: data.name,
                        avatar: data.avatar,
                        discount: data.discount,
                    });

                    // Update the amount in the cart
                    existingCart.amount += totalcost;
                    existingCart.items+=1;

                    const addNewItem = await existingCart.save();

                    if (addNewItem) {
                        return {success:true,available:available, message: "New Product Added to Cart"}
                    } else {
                        return {success:false,available:available, message: "Error adding product to cart"}
                    }
                }
            }
        } catch (error) {
            return {success: false, message: "Server Error"}
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
    

    static async numberOfItemsInCart(data){
        const num = await Cart.countDocuments({buyerid:data.userid})
        if(num){
            return {
                success: true,
                count: num
            };
        }else{
            return {
                success: false
            }
        }
    }

    static async getCartItems(userid){
        const items = await Cart.find({buyerid:userid}).lean();
        if(items){
            return {items: items, success:true}
        }
    }

    static async getProductDetails(id){
        const product = await Product.find({_id:id});
        if(product){
            return {product:product, success:true}
        }
    }
    static async reduceQttyByOne(data){
        const cartitem = await Cart.findOne({productid:data.productid,buyerid:data.buyerid});
        // console.log(cartitem.quantity-1)
        if(cartitem){
            if((cartitem.quantity-1)>0){
                const updatedTotalCost = (cartitem.quantity-1)*cartitem.price;
                const newcartitem = await Cart.updateOne(
                    {
                        productid:data.productid,
                        buyerid: data.buyerid
                    },
                    {
                        $inc: {quantity: -1, available:1},
                        $set: {totalCost:updatedTotalCost}
                    }
                );
                
                if(newcartitem){
                    return {success: true}
                }else{
                    return {success: false}
                }

            }else{
                const deleteitem = await Cart.deleteOne({productid:data.productid, buyerid:data.buyerid})
                if(deleteitem){
                    return {success:true}
                }else{
                    return {success:false}
                }
            }
            
        }else{
            return {success: false}
        }

    }

    static async increaseQttyByOne(data){
        const cartitem = await Cart.findOne({productid:data.productid,buyerid:data.buyerid});
        // console.log(cartitem.quantity-1)
        if(cartitem){
            if((cartitem.available-1)>=0){
                const updatedTotalCost = (cartitem.quantity+1)*cartitem.price;
                const newcartitem = await Cart.updateOne(
                    {
                        productid:data.productid,
                        buyerid: data.buyerid
                    },
                    {
                        $inc: {quantity: 1, available:-1},
                        $set: {totalCost:updatedTotalCost}
                    }
                );
                
                if(newcartitem){
                    return {success: true}
                }else{
                    return {success: false}
                }

            }else{
                return {success:false}
            }
            
        }else{
            return {success: false}
        }

    }

    static async removeCartItem(data){
        const cartitem = await Cart.findOne({productid:data.productid, buyerid:data.buyerid});
        if(cartitem){
            const deleteitem = await Cart.deleteOne({productid:data.productid, buyerid:data.buyerid});
            if(deleteitem){
                return {success:true}
            }else{
                return {success:false}
            }
        }else{
            return {success:false}
        }
    }
    
    static async paystackCallBack(data){
        return data
    }
    static async paystackWebhook(data){
        return data
    }
    
    

      

    
      
}

module.exports = ProductService