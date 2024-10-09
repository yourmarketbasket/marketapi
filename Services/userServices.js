const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');
const dotenv = require('dotenv');
const EventEmitService = require('./eventService');
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

    // Function to generate a new token
    static async generateToken (userId, token){
        // console.log("userid is", userId);
        try {
            const user = await User.findOne({_id: userId});
    
        if (user) {
            const payload = {
            userdata: user,
            token: token,
            };
    
            // Sign and generate token, expires in 60 seconds
            const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60s' });
            return authToken;
        } else {
            return null;
        }
        } catch (error) {
            console.error('Error generating token:', error.message);
            return null;
        }
    };

    static async updateLocation(data, io){
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
                EventEmitService.emitEventMethod(io, "locationevent", {userid:data.userid, message: "Location Updated Successfully"});
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