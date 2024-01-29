const Product = require('../models/products');
const Cart = require('../models/cart');
const Order = require('../models/orders');
const Payments = require('./paymentService');

class ProductService {
    static async addToCart(data) {
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
                            return {success:true,available:available, message: "New Product Added to Cart"}
                        } else {
                            return {success:false,available:available, message: "Error adding product to cart"}
                        }
                    }
                    
                    
                }
            } catch (error) {
                // console.log(error)
                return {success: false, message: error};
            }
        
    }

    static async clearCart(data){
        try{

            const cart = await Cart.findOneAndDelete({buyerid: data.buyerid});
            if(cart){
                return {success:true, message:"Cart cleared successfully"};
            }else{
                return {success:false, message:"Failed to clear cart"};
            }

        }catch(e){
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

    static async editCartProductQuantity(data) {
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
                success: false
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

    static async reduceQttyByOne(data) {
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

                return { success: true, message: 'Product quantity reduced by one' };
            } 
        } catch (error) {
            return { success: false, message: 'Error reducing product quantity' };
        }
    }

    static async increaseQttyByOne(data){
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

                return { success: true, message: 'Product quantity increased by one' };
            } 
        } catch (error) {
            return { success: false, message: 'Error increasing product quantity' };
        }

    }

    static async removeCartItem(data){
        try {
            // Find the cart and the specific product
            const cart = await Cart.findOne({ buyerid:data.buyerid });
            const product = cart.products.find(item => item.productid === data.productid);
    
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
                    // delete the cart if the amount is zero
                    if((cart.amount-product.totalCost) == 0){
                        await Cart.deleteOne({buyerid:data.buyerid});
                        return { success: true, message: 'Product and Cart deleted' };
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
   
    

      

    
      
}

module.exports = ProductService