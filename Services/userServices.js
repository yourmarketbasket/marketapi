const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');
const dotenv = require('dotenv');
class UserService{

    // change avatar
    static async changeUserAvatar(data){
         // find a user by the id
        const user = await User.findOne({ _id: data.userid });
        if (user) {
            const filter = { _id: data.userid };
            const update = { avatar: data.avatar };
            // update the value for avatar in the user document
            const updatedUser = await User.findOneAndUpdate(filter, update);
            if (updatedUser) {
                return { message: 'Avatar changed successfully', success: true };
            } else {
                return { message: 'Error changing avatar', success: false };
            }
        } else {
            return { message: 'User not found', success: false };
        }

    }

    static async updateLocation(data){
        try{
            const user = await User.findByIdAndUpdate(
                data.userid,
                {
                    $set: {
                        location: data.location
                    }
                } 
            )
            if(user){
                return {success:true, message:"Location updated"}
            }else{
                return {success:false, message: "Could not update location"};
            }

        }catch(e){
            console.log(e)
            return {success:false, message: "Some error occured"};

        }
    }

    
}

module.exports = UserService