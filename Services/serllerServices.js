const Cart = require('../models/cart');
const Store = require('../models/stores')

class SellerServices{
    
    static async updateSellerSettings(data){
        try {
            const store = await Store.findOne({_id:data.store})
            if(store){
                // update the store details
                const updatestore = await Store.updateOne(
                    {_id:data.store},
                    { 
                        $set: { currency: data.currency, location: data.location },
                    });
    
                if(updatestore){
                    return {success:true, data: `${store.storename} Updated Successfully!`}
                }else{
                    return {success:false, data: `Error occured!`}
                }
            }
        } catch (error) {
            console.log(error)
            
        }
        
    }
    static async getStoreLocations(userid) {
        try {
          const stores = [];
          const origins = [];
          const cart = await Cart.find({ buyerid: userid });
      
          // Use Promise.all to await all async operations inside the loop
          await Promise.all(cart.map(async (e) => {
            if (!stores.includes(e.storeid)) {
              stores.push(e.storeid);
              // get the store location
              const store = await Store.findOne({ _id: e.storeid });
              if (store) {
                origins.push(store.location);
              }
            }
          }));
      
          return {success:true, origins:origins};
        } catch (e) {
          console.log(e);
        }
      }
      

}

module.exports = SellerServices;

