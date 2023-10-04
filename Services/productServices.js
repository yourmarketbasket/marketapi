const Product = require('../models/products');
const Cart = require('../models/cart');

class ProductService {
    static async addToCart(data) {
        try {
          let updatedCartItem;
          let success;
        
          let available;
          const product = await Product.findOne({_id:data.productid});
          if(product){
            available = product.quantity;
            success = true;
                // Try to find the cart item by product ID
            const existingCartItem = await Cart.findOne({ productid: data.productid, buyerid:data.userid });           
            if (existingCartItem && existingCartItem.available>0) {
                // update available quantity
                available = existingCartItem.available-data.quantity
                // If the product is found, increment the quantity
                updatedCartItem = await Cart.findByIdAndUpdate(
                existingCartItem._id,
                { 
                    $set: {available: available},
                    $inc: { quantity: data.quantity, totalCost: data.totalcost }
                },
                { new: true }
                );
                success = true
            } else if(!existingCartItem) {
                available = available-data.quantity;
                // If the product is not found, create a new cart item
                updatedCartItem = await Cart.create({
                    productid: data.productid,
                    quantity: data.quantity,
                    buyerid: data.userid,
                    available: available,
                    totalCost: data.totalcost,
                    price: data.price,
                    productmodel: data.model,
                    productname:data.name
                });
                success = true
            }else if(existingCartItem.available<data.quantity){
                success = false;
                available = existingCartItem.available
    

            }else{
                success = false;
                available = 0;
            }

                       
        
            
          }
     
          return {
              message: updatedCartItem,
              available: available,
              success:success
          } 
        } catch (error) {
          console.error(error);
          throw new Error('Server error'); // Throw an error instead of returning a response
        }
      }

    static async availableProductQuantityForUser(data){
        // check amount from cart
        let product = await Cart.findOne({productid:data.productid, buyerid:data.userid})
        if(product){
            return {quantity: product.available, success: true}
        }else{
            product = await Product.findOne({_id:data.productid})
            return {quantity: product.quantity, success: true}
        }

    }

    static async numberOfItemsInCart(data){
        const num = await Cart.countDocuments({buyerid:data.userid})
        if(num){
            return {
                success: true,
                count: num
            };
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

      

    
      
}

module.exports = ProductService