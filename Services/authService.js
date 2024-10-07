const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('request');
const dotenv = require('dotenv');
const authenticator = require('../middleware/authenticator');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

class AuthService {
  static async testFunction(io){
    io.emit('anotherevent', 'Hello from the server!');
  }
    
    // login and authenticate
  static async authenticateUser(phone, password) {

    try {
      const user = await User.findOne({ phone });

      if (user && (await bcrypt.compare(password, user.password))) {
        const userId = user._id;
        const token = jwt.sign(
          {
            userId: user._id,
            fname: user.fname,
            lname: user.lname,
            phone: user.phone,
            admin: user.admin,
            active: user.active,
            client: user.client,
            vendor: user.vendor,
            verified: user.verified,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          }
        );
        const loginTime = new Date();

        return { message: 'Login Successful', success: true, token:token, userid:userId, timestamp: loginTime, status:200};
      } else {
        return { message: 'Invalid Details', success: false, status:404};
      }
    } catch (error) {
      throw error; // You can rethrow the error or handle it as needed
    }
  }
//   send otp
  async sendOTP(phone, zipcode){
    try{
        // send otp
        return new Promise((resolve, reject)=>{
            const data = {
                "api_key" : process.env.TERMII_API_KEY,
                "message_type" : "ALPHANUMERIC",
                "to" : zipcode.slice(1)+phone.slice(1),
                "from" : process.env.TERMII_SENDER_ID,
                "channel" : "generic",
                "pin_attempts" : 10,
                "pin_time_to_live" :  5,
                "pin_length" : 6,
                "pin_placeholder" : "< 1234 >",
                "message_text" : "Your one time password for MARKET BASKET is < 1234 >",
                "pin_type" : "NUMERIC"
              }
              const options = {
                'method': 'POST',
                'url': 'https://api.ng.termii.com/api/sms/otp/send',
                'headers': {
                  'Content-Type': ['application/json', 'application/json']
                },
                body: JSON.stringify(data)
              
              };
              request(options, async function (error, response) { 
                if (error){
                  response = "Error: " + error;
                  reject(response)
                }else{
                    try {
                        const responseData = JSON.parse(response.body);
                        if (responseData && responseData.smsStatus === 'Message Sent') {
                          const verifydatadata = { zip: zipcode, phone: phone, pinid: responseData.pinId };
                          resolve(verifydatadata);
                        } else {
                          reject('OTP not sent'); // You can reject with a specific error message
                        }
                      } catch (parseError) {
                        reject(parseError);
                      }
                } 
              });

        });
     
      
    }catch(e){
        console.log("Error sending OTP:", e)
    }
     
  }
    // register user
  static async registerUser(data){

    try{        
        const existingUser = await User.findOne({phone:data.phone, zipcode:data.zipcode })
        if(existingUser){          
            return {message: 'User already exists', success:false};
        }else{
          const hashedPassword = await bcrypt.hash(data.password, 10);
          const user = new User({
              fname: data.fname,
              lname: data.lname,
              phone: data.phone,
              avatar: 'https://firebasestorage.googleapis.com/v0/b/market-e62c9.appspot.com/o/avatar%2F360_F_542361185_VFRJWpR2FH5OiAEVveWO7oZnfSccZfD3.jpg?alt=media&token=cbfadc56-5aa3-4f74-8cbe-ab682f7b4b8d',
              email: '',
              dob: data.dob,
              zipcode: data.zipcode,
              gender: data.gender,
              password: hashedPassword, // use the hashed password
              city: data.city,
              address: data.address,
              verified: data.verified,
              verificationAttempts: 0,
              location: '',
          });
          await user.save();
                  
          return { message: `Registration  successfull`, success: true};
                      
        }

    }catch(error){
        return {success: false, message: error};
    }
   
  }
  // verify reset password otp
  static async verifyResetOtpPassword(verification){
    try{
      return new Promise((resolve,reject)=>{
        // termii integration
        var data = {
          "api_key": process.env.TERMII_API_KEY,
          "pin_id": verification.codeid,
          "pin": verification.otp
        };
        var options = {
          'method': 'POST',
          'url': 'https://api.ng.termii.com/api/sms/otp/verify',
          'headers': {
          'Content-Type': ['application/json', 'application/json']
          },
          body: JSON.stringify(data)

        };
        request(options, async function (error, response) { 
        if (error) throw new Error(error);
          const responseData = JSON.parse(response.body);
          if(responseData && responseData.verified){
            resolve({ message: `Verification successful`, success: true});
          }else if(responseData.verified === "Expired"){
            resolve({message: 'OTP Expired', success: false})
          }else{
            resolve({ message: 'Invalid code', success: false });
          }
        });
      })

    }catch(e){
      return e;
    }

  }
  // verify otp
  static async verifyOTP(verificationData){
    const phone = verificationData.phone
    try{
      return new Promise((resolve,reject)=>{
        // termii integration
        var data = {
          "api_key": process.env.TERMII_API_KEY,
          "pin_id": verificationData.codeid,
          "pin": verificationData.otp
        };
        var options = {
          'method': 'POST',
          'url': 'https://api.ng.termii.com/api/sms/otp/verify',
          'headers': {
          'Content-Type': ['application/json', 'application/json']
          },
          body: JSON.stringify(data)

        };
        request(options, async function (error, response) { 
        if (error) throw new Error(error);
          const responseData = JSON.parse(response.body);
          if(responseData && responseData.verified){
            resolve({ message: `Verification successful`, success: true});
            // upldate verified status
            User.findOneAndUpdate({ phone: phone }, { $set: { verified: true } })
                .then(() => {
                })
                .catch((err) => {
                });
          }else if(responseData.verified === "Expired"){
            resolve({message: 'OTP Expired', success: false})
          }else{
            resolve({ message: 'Invalid code', success: false });
          }
        });
      })

    }catch(e){
      return e;
    }

  }
  // get zip code
  static async getZipCode(mobile){
    const user = await User.findOne({phone: mobile})
    if(user){
      return {message:user.zipcode, success:true} 
    }else{
      return {message:"Not found", success:false} 
    }
  }
  // verify password
  static async resetPassword(info){
    try{
        const phone = info.phone
        const hashedPassword =  await bcrypt.hash(info.password, 10);
        const user =  User.findOne({phone:phone});
        if(user){
          const filter = {phone:phone};
          const update = {password:hashedPassword};
          const updatePwd =  await user.findOneAndUpdate(filter, update);
          if(updatePwd){
            return {message: "Password updated!", success:true};
          }else{
            return {message: "Password reset failed!", success:false};
          }

        }else{
          return {message:"User not found", success:false}
        }
     
    }catch(e){

    }
    
  }
  // send resetPassword OTP
  static async sendResetPasswordOTP(info){
    return new Promise((resolve, reject)=>{
      const data = {
        "api_key" : process.env.TERMII_API_KEY,
        "message_type" : "ALPHANUMERIC",
        "to" : info.zip.slice(1)+info.phone.slice(1),
        "from" : process.env.TERMII_SENDER_ID,
        "channel" : "generic",
        "pin_attempts" : 10,
        "pin_time_to_live" :  5,
        "pin_length" : 6,
        "pin_placeholder" : "< 1234 >",
        "message_text" : "Your one time password for MARKET BASKET is < 1234 >",
        "pin_type" : "NUMERIC"
      }
      const options = {
        'method': 'POST',
        'url': 'https://api.ng.termii.com/api/sms/otp/send',
        'headers': {
          'Content-Type': ['application/json', 'application/json']
        },
        body: JSON.stringify(data)
      
      };
      request(options, async function (error, response) { 
        if (error){
          response = "Error: " + error;
        }else{
          const responseData = JSON.parse(response.body);
          if(responseData && responseData.smsStatus === 'Message Sent'){
            const verifydatadata = {zip: info.zip, phone: info.phone, pinid: responseData.pinId }
            resolve({ message: `OTP sent`, success: true, data: verifydatadata});            
          }else{
            resolve({ message: "Error occured", success:true, data:verifydatadata});
          }
        } 
      });

    })    
  }

  static async sendVerificationCode(mobilenumber, signature, timeoutMillis = 5000, maxRetries = 3) {
    let retries = 0;
  
    while (retries < maxRetries) {
      try {
        const verificationPromise = client.verify.v2
          .services(verifySid)
          .verifications.create({ to: mobilenumber, channel: "sms", appHash: signature });
  
        // Use Promise.race to set a timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), timeoutMillis)
        );
  
        // Race the verification promise against the timeout promise
        const result = await Promise.race([verificationPromise, timeoutPromise]);
  
        return result;
      } catch (error) {
        // Handle specific error types
        if (error.code === 'ENOTFOUND') {
          console.error('DNS resolution failed. Retrying...');
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a short time before retrying
        } else {
          // Handle other errors
          console.error(error);
          throw error; // Rethrow the error if necessary
        }
      }
    }
  
    throw new Error('Max retries reached. Unable to complete the request.');
  }
  

  static async verifyTwilioOTPCode(mobilenumber, otpcode, timeoutMillis = 5000, maxRetries = 3) {
    let retries = 0;
  
    while (retries < maxRetries) {
      try {
        const verificationCheckPromise = client.verify.v2
          .services(verifySid)
          .verificationChecks.create({ to: mobilenumber, code: otpcode });
  
        // Use Promise.race to set a timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), timeoutMillis)
        );
       
  
        // Race the verification check promise against the timeout promise
        const result = await Promise.race([verificationCheckPromise, timeoutPromise]);
  
        return result;
      } catch (error) {
        // Handle specific error types
        if (error.status === 404 && error.code === 20404) {
          console.error('Twilio verification resource not found. Check mobilenumber and otpcode.');
          return { success: false, message: 'Resource not found' };
        } else if (error.code === 'ENOTFOUND') {
          console.error('DNS resolution failed. Retrying...');
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a short time before retrying
        } else {
          // Handle other errors
          console.error(error);
          throw error; // Rethrow the error if necessary
        }
      }
    }
  
    throw new Error('Max retries reached. Unable to complete the request.');
  }
  



  



}

module.exports = AuthService;
