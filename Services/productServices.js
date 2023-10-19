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
                    storeid:data.storeid,
                    buyerid: data.userid,
                    available: available,
                    totalCost: data.totalcost,
                    price: data.price,
                    productmodel: data.model,
                    productname:data.name,
                    avatar:data.avatar,
                    discount:data.discount
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