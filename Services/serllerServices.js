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

}

module.exports = SellerServices;

