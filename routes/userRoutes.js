const express = require('express');
const router = express.Router();
const AuthService = require('../Services/authService');
const UserServices = require('../Services/userServices');
const authenticator = require('../middleware/authenticator');


module.exports =(io)=>{
    // login
    router.post('/login', async (req, res) => {
        const phone = req.body.phone;
        const password = req.body.password; // Fix the typo here, change "phone" to "password"
        
        try {
        const user = await AuthService.authenticateUser(phone, password);
        res.status(user.status).json(user); // Send the response back to the client
        } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', success: false });
        }
    });
    // register
    router.post('/register', async(req, res)=>{
        try{
            const user = await AuthService.registerUser(req.body);
            res.status(200).json(user)

        }catch (error){
            res.status(500).json({message: 'Some error occured', success: false})
        }

    })
    // change user avatar
    router.post('/changeUserAvatar', authenticator, async(req,res)=>{
        try{
            const changed = await UserServices.changeUserAvatar(req.body)
            res.json(changed)
        }catch(e){
            res.json({message: e, success:false})
        }

    });
    // verifyotp
    router.post('/verifyOTP', async(req,res)=>{
        try{
            const verified = await AuthService.verifyOTP(req.body);
            res.json(verified)

        } catch(e){
            res.json({message:e, success:false})
        }
            
    });
    // get zipcode
    router.post('/getZipCode',authenticator, async(req,res)=>{
        try{
            const zipcode = await AuthService.getZipCode(req.body.mobile)
            res.json(zipcode);

        }catch(e){
            res.json({message:e, success:false})
        }
    });
    // send reset password otp
    router.post('/sendResetPasswordOTP', async(req, res)=>{
        try{
            const resdata = await AuthService.sendResetPasswordOTP(req.body);
            res.json(resdata)
        }catch(e){
            res.json({message:e, success:false})
        }
    });
    // verify reset password otp
    router.post('/verifyResetPasswordOTP', async(req, res)=>{
        try{
            const verification = await AuthService.verifyResetOtpPassword(req.body);
            res.send(verification)
        }catch(e){
            res.json({message:e, success:false});
        }

    });
    // reset user password
    router.post('/resetUserPassword', async(req, res)=>{
        try{
            const reset = await AuthService.resetPassword(req.body);
            res.json(reset)
        }catch(e){
            res.json({message:e, success:false})
        }

    });

    router.post('/sendTwilioOTP', async (req, res)=>{    
        response = await AuthService.sendVerificationCode(req.body.mobilenumber, req.body.signature)
        if(response.sid && response.serviceSid && response.to && response.status=="pending"){
            res.status(200).json({success:true, message: response.status});
        }else{
            res.status(500).json({success:false, message: "Some error occured!"});;
        }
        // res.json();
    });

    router.post('/verifyTwilioOTP', async (req, res)=>{
        response = await AuthService.verifyTwilioOTPCode(req.body.mobilenumber, req.body.otpcode);
        if(response.status=="approved" && response.valid){
            res.status(200).json({success:true, message:response.status});
        }else{
            res.status(500).json({success:false, message: "Some error orccured"})
        }
        // res.json()
    });

    router.post('/updateMyLocation',authenticator, async(req, res)=>{
        response = await UserServices.updateLocation(req.body, io);
        res.status(200).send(response)
        // response = await 
    })

    return router;

}

