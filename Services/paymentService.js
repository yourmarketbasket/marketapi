const datetime = require('node-datetime')
const https = require('https');
const axios = require('axios');
const User = require('../models/user');
const Cart = require('../models/cart')
const Payment = require('../models/payment');
const ProductService = require('./productServices');
const Order = require('../models/orders');
const Product = require('../models/products');


class Payments{

   // jenga api integration
   static async authenticateMerchant(){
      const apiUrl = 'https://uat.finserve.africa/authentication/api/v3/authenticate/merchant';
      const apiKey = 'vO0LiLemnEsK4L1OHfw1asd3e+CRTdXCWin6HLspXv5GcUM6czmqpz3XwzaF1MeIF/vLsKPGVwFeoY9Is1NdSA==';
    
      const requestData = {
        merchantCode: '6670492257',
        consumerSecret: '0EzPUvQKr9y8PZWa7lRz4a08oR29w4',
      };
    
      try {
        const response = await axios.post(apiUrl, requestData, {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
          },
        });
    
        return response.data;
      } catch (error) {
        console.error('Error making Jenga API request:', error.response ? error.response.data : error.message);
        throw new Error('Jenga API request failed');
      }
    };

    
    
    // access token
    static async generateMpesaAccessToken(){
        return new Promise((resolve, reject) => {
            this._cK = "Xl6oI5qPsLCWN9k7BclANhXDBq8KELjH";
            this._cS = "95rIqPpyaXDzJmGc";
            this._auth = "Basic " + Buffer.from(this._cK + ":" + this._cS).toString("base64");
        
            const options = {
              method: 'GET',
              hostname: 'sandbox.safaricom.co.ke',
              path: '/oauth/v1/generate?grant_type=client_credentials',
              headers: {
                'Authorization': this._auth,
              },
            };
        
            const req = https.request(options, (res) => {
              let data = '';
        
              res.on('data', (chunk) => {
                data += chunk;
              });
        
              res.on('end', () => {
                const response = JSON.parse(data);
                // console.log(response);
                resolve(response);
              });
            });
        
            req.on('error', (error) => {
              console.error(error);
              reject(error);
            });
        
            req.end();
          });

    }
    // B2C
    static async B2C(data){
        const token = await Payments.generateMpesaAccessToken();
        const requestData = {
            OriginatorConversationID: '707402f3-ebf5-4e60-9ed7-2cec3583b5b2',
            InitiatorName: 'testapi',
            SecurityCredential: 'l9woNTJSiglbnjHWGnAgX22i5WEELfunguJD6KSR65ublRlBfIqMCFDOSfo7TVnj5HaAeNKydn7CrPxQjW67YlEE06CG653/HwMO6x51TwliMYB72F3g3EyMSaYSkYR/gUD6uxYQpWPhFX4pnEQoxXqZ8ptJ5uNW6a1MFy8mmAviU2S/6soQBavh1Ql55fRWFAg4CtqqVD8I8sY8/lVTJVr+gjMvcUINwuaywl6hoImT36buY0ZhLdbLqoXaPWAoi0fzhW/cX43nTIjgXligIsApyY0ON3t9+spbjakHlzehmZqsF46T4sc5cPRceQTQ47eOGSkzTBm8yfpXhe5GmQ==',
            CommandID: 'BusinessPayment',
            Amount: data.amount,
            PartyA: 600997,
            PartyB: 254708374149,
            Remarks: data.remarks,
            QueueTimeOutURL: 'https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/timeout',
            ResultURL: 'https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/resultUrl',
            Occasion: data.occassion,
        };

        return new Promise((resolve, reject) => {
            const req = https.request({
                method: 'POST',
                hostname: 'sandbox.safaricom.co.ke',
                path: '/mpesa/b2c/v3/paymentrequest',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.access_token,
                },
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const response = JSON.parse(data);
                    resolve(response);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(JSON.stringify(requestData));
            req.end();
        });
    }   
    // toBusinessPaybill
    static async toBusinessPayBill(){
        const token = await Payments.generateMpesaAccessToken();
        const requestData = {
            "Initiator": "testapi",
            "SecurityCredential": "pZb7NXiyVW/Su470BRZ9sIEUbpZqmSYgMuGNBP0wqBROmfuRwK5Ub8e8ZpB0nccW1UxI9rHGk7ESIxWDNcsqt3BUoOTla7jC6p3DWYeazX7DCI02Wv9HfNr+2JOSB1UHMlYz8QK0wMKK39d9KO2gVjeekNTDyNdPf9DqInk1RL9OXhSRnYhbSQVrCIMu+5lUUDmnJi97O6nSP/hXzLnT7cJ3FUPXGa1OdCaoOXhzMTCc/bOQg+zwD9B9cjT8T6fND0U7XsX1Va1tdgbZVRcpSPlwgrG7MZJPWHKGmQyWCm6thR1ZH4O01de9XuIBDRmpbDvJBfqMgIThaqJ/eJfDDQ==",
            "CommandID": "BusinessPayBill",
            "SenderIdentifierType": "4",
            "RecieverIdentifierType": 4,
            "Amount": 239,
            "PartyA": 600995,
            "PartyB": "000000",
            "AccountReference": "353353",
            "Requester": "254700000000",
            "Remarks": "ok",
            "QueueTimeOutURL": "https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/resultUrl"
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token.access_token
            }
        };

        axios.post('https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest', requestData, config)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error(error);
            });


    }
    // to business till number
    static async toBusinessTillNumber(data){
        const token =  await Payments.generateMpesaAccessToken();
        const requestData = {
            "Initiator": "testapi",
            "SecurityCredential": "Eo8jMD7h3fzBi11GY4kBZt2XMBvIlgvU3wZ7baez0b/Ey4hR78HRz5UYBQarkAFY9rC5CBT2s+IrXbk4qnlkxhn0OST7bz0L/bM4ykK+kV1s8ZQsfHBTEuI+Z+Hzn1EbaRnz7+v/IVUDO1+9947+nW3hgJ6dKTilAh95X/E+wKIP3hRYweCjskzYBJuqq+d5PGMAfD1Ov5dFH9WeENRSHBUCvmBP+sLZZJP+ydA9OnrmVrphNu9aV0/LQO9hVV8ZWyKARpwuGwwbwMUfRawivguu8RimzGfNpj4rrNAKPrlkyJwiLB9szclw1ZO+FhQ4ICUms0tIDxZk2scghXkVng==",
            "CommandID": "BusinessBuyGoods",
            "SenderIdentifierType": "4",
            "RecieverIdentifierType": 4,
            "Amount": data.amount,
            "PartyA": 600986,
            "PartyB": data.partyB,
            "AccountReference": data.reference,
            "Requester": "254700000000",
            "Remarks": data.remarks,
            "QueueTimeOutURL": "https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://bd61-102-217-167-34.ngrok-free.app/api/darajaUrls/resultUrl"
        };

        return new Promise((resolve, reject) => {
            const req = https.request({
                method: 'POST',
                hostname: 'sandbox.safaricom.co.ke',
                path: '/mpesa/b2b/v1/paymentrequest',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.access_token,
                },
            }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const response = JSON.parse(data);
                    resolve(response);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(JSON.stringify(requestData));
            req.end();
        });


    }
    // pesapal auth token
    static async pesapalAuthtoken(){
        return new Promise((resolve, reject) => {
            const requestData = {
            method: 'POST',
            hostname: 'pay.pesapal.com',
            path: '/v3/api/Auth/RequestToken',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            };
    
            const request = https.request(requestData, (response) => {
            let data = '';
    
            response.on('data', (chunk) => {
                data += chunk;
            });
    
            response.on('end', () => {
                try {
                const responseData = JSON.parse(data);
                resolve(responseData);
                } catch (error) {
                reject(error);
                }
            });
            });
    
            request.on('error', (error) => {
            reject(error);
            });
    
            const postData = JSON.stringify({
            "consumer_key": "aG/Z2S0dn0Qezmou2gBSIYIpHHHVd7bm",
            "consumer_secret": "50fc6n/n5vs03+DdKTTQ7rPRB9E="
            });
    
            request.write(postData);
            request.end();
        });
    }
    // pesapal register IPN
    static async pesapalRegisterIPN(){
        const pesapaltoken = await Payments.pesapalAuthtoken();
        const requestData = {
            method: 'POST',
            hostname: 'pay.pesapal.com',
            path: '/v3/api/URLSetup/RegisterIPN',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pesapaltoken.token}`,
            },
          };
          const postData = JSON.stringify({
            "url": "https://3b14-105-163-0-17.ngrok-free.app/api/darajaUrls/pesaPallIPNResponse",
            "ipn_notification_type": "POST"
          });
        return new Promise((resolve, reject) => {           
        
            const request = https.request(requestData, (response) => {
              let data = '';
        
              response.on('data', (chunk) => {
                data += chunk;
              });
        
              response.on('end', () => {
                try {
                  const responseData = JSON.parse(data);
                  resolve(responseData);
                } catch (error) {
                  reject(error);
                }
              });
            });
        
            request.on('error', (error) => {
              reject(error);
            });
        
            request.write(postData);
            request.end();
          });

    }
    // get the lists of ipns
    static async listPesapalIPNS(){
        const pesapaltoken = await Payments.pesapalAuthtoken();
        return new Promise((resolve, reject) => {
            const requestData = {
              method: 'GET',
              hostname: 'pay.pesapal.com',
              path: '/v3/api/URLSetup/GetIpnList',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${pesapaltoken.token}`
              },
            };
        
            const request = https.request(requestData, (response) => {
              let data = '';
        
              response.on('data', (chunk) => {
                data += chunk;
              });
        
              response.on('end', () => {
                try {
                  const responseData = JSON.parse(data);
                  resolve(responseData);
                } catch (error) {
                  reject(error);
                }
              });
            });
        
            request.on('error', (error) => {
              reject(error);
            });
        
            request.end();
          });

    }
    // GET PAYEE DATA
    static async getUserData(userid){
      try{
        const user = await User.findOne({_id:userid});
        if(user){
          return user
        }
      }catch(e){
        console.log(user)
      }
    }
    static async updateOrderStatus(reference, status){
      try{
        // check if order is already marked as completed
        const completed = await Order.findOne({transactionID: reference, paymentStatus: 'Completed'});
        if(!completed && status=="Completed"){
          const updateorder = await Order.findOneAndUpdate({transactionID: reference}, 
            {
              $set: {paymentStatus: status}
            });
            if(updateorder){
              // update listing
              return Payments.updateProductListingOnOrderComplete(updateorder.products, updateorder.buyerid);
            }else{
              return false;
            }

        }else{
          return true;
        }

      }catch(e){
        console.log(e)
        return false;
      }

    }
    // remove the products from the store once an order is marked as complete
    static async updateProductListingOnOrderComplete(data, buyerid) {
      try {
        for (const product of data) {
          // remove the product from the products
          await Product.findOneAndUpdate(
            {
              _id: product.productid,
              storeid: product.storeid,
            },
            {
              $inc: { quantity: -product.quantity },
            }
          );
          
        }

        // remove the cart that bears the userid
        await Cart.findOneAndDelete({buyerid: buyerid})
    
        return true; // Assuming you want to return true if the update is successful
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    
    static async updatePaymentStatus(trackingid, data){
      try{
        const payment = await Payment.findOneAndUpdate({trackingid:trackingid},{
          amount: data.amount,
          method: data.payment_method,
          date: data.created_date,
          confirmationCode: data.confirmation_code,
          paymentStatus: data.payment_status_description,
          message: data.message,
          paymentAccount: data.payment_account,
          currency: data.currency,
          description: data.description
        })
        if(payment){
          // update the order status
          return Payments.updateOrderStatus(payment.reference, data.payment_status_description)
        }else{
          return false;
        }

      }catch(e){
        console.log(e)
      }
      
    }
    static async pesapalSubmitOrderRequest(request){
      const pesapaltoken = await Payments.pesapalAuthtoken();
      const info = request;
      // create an order
      const createorder = await Payments.createNewCartOrder(request)
      if(createorder.success && createorder.status == 100){
        // pesapal submit order 
        return new Promise((resolve, reject) => {
            const requestData = {
                method: 'POST',
                hostname: 'pay.pesapal.com',
                path: '/v3/api/Transactions/SubmitOrderRequest',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${pesapaltoken.token}`
                },
            };
        
            const postData = JSON.stringify({
                "id": info.transactionID,
                "currency": "KES",
                "amount":1, //info.amount,
                "description": info.description,
                "callback_url": 'http://localhost:4200/market_place/success',
                "redirect_mode": "",
                "notification_id": "d721ad7d-26f3-4103-a20b-ddae2c6cf7c4",
                "branch": "NISOKO TECHNOLOGIES",
                "billing_address": {
                  "email_address": info.phone,
                  "phone_number": info.phone,
                  "country_code": info.countryCode,
                  "first_name": info.fname,
                  "middle_name": "",
                  "last_name": info.lname,
                  "line_1": "",
                  "line_2": "",
                  "city": "",
                  "state": "",
                  "postal_code": "",
                  "zip_code": info.zipcode
                }
            });
        
            const request = https.request(requestData, (response) => {
                let data = '';
        
                response.on('data', (chunk) => {
                data += chunk;
                });
        
                response.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    resolve(responseData);
                } catch (error) {
                    reject(error);
                }
                });
            });
        
            request.on('error', (error) => {
                reject(error);
            });
        
            request.write(postData);
            request.end();
            });

      }else{
        return {status: 402, success: false, message: createorder.message}
      }
    }

    static async getPesapalTransactionStatus(ordertrackingid){
      const pesapaltoken = await Payments.pesapalAuthtoken();
      return new Promise((resolve, reject) => {
          const url = `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${ordertrackingid}`;
      
          const requestData = {
              method: 'GET',
              headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pesapaltoken.token}`
              },
          };
      
          const request = https.request(url, requestData, (response) => {
              let data = '';
      
              response.on('data', (chunk) => {
              data += chunk;
              });
      
              response.on('end', () => {
              try {
                  const responseData = JSON.parse(data);
                  resolve(responseData);
              } catch (error) {
                  reject(error);
              }
              });
          });
      
          request.on('error', (error) => {
              reject(error);
          });
      
          request.end();
          });
    }

    static async pesapalRefund(confirmationcode){
        const pesapaltoken = await Payments.pesapalAuthtoken();
        return new Promise((resolve, reject) => {
            const url = 'https://pay.pesapal.com/v3/api/Transactions/RefundRequest';
        
            const requestData = {
              method: 'POST',
              hostname: 'pay.pesapal.com',
              path: '/v3/api/Transactions/RefundRequest',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${pesapaltoken.token}`
              },
            };
        
            const postData = JSON.stringify({
              "confirmation_code": confirmationcode,
              "amount": "4.00",
              "username": "John Doe",
              "remarks": "Service not offered"
            });
        
            const request = https.request(requestData, (response) => {
              let data = '';
        
              response.on('data', (chunk) => {
                data += chunk;
              });
        
              response.on('end', () => {
                try {
                  const responseData = JSON.parse(data);
                  resolve(responseData);
                } catch (error) {
                  reject(error);
                }
              });
            });
        
            request.on('error', (error) => {
              reject(error);
            });
        
            request.write(postData);
            request.end();
          });
    }
    static async validateCartCheckoutAmount(amount, userid, deliveryfee){
      // get all products by a given buyer
      const products = await Cart.find({buyerid:userid});
      // console.log(products[0].amount)
      if(products){
        // check the total amount
        let total = deliveryfee+products[0].amount;
       
        if(total==amount){
          return {success:true, data:products};
        }else{
          return {success:false, message:"Cart Changed"};
        }

      }else {
        return {success:false, message:"Cart not found!"};
      }

    }
    // mark orders as paid
    static async createNewCartOrder(data){
      // validate the payment
      const validated = await Payments.validateCartCheckoutAmount(data.amount, data.userid, data.deliveryfee);
      if(validated.success){    
        // console.log()    
              try{
                  const neworder = await new Order({
                      transactionID: data.transactionID,
                      buyerid: validated.data[0].buyerid,
                      amount: data.amount,
                      countryCode: data.countryCode,   
                      destination: data.destination,
                      origin: data.origin,
                      zipCode: data.zipcode,
                      deliveryfee: data.deliveryfee,   
                      items: validated.data[0].items,
                      products: validated.data[0].products,
                      buyername: `${data.fname.trim()} ${data.lname.trim()}`,
                      paymentStatus: "Pending"      
                  });
                // check if the order already exists
                const exists = await Order.findOne({products:validated.data})
                if(!exists){
                  const save = await neworder.save();
                  if(save){
                      return {status: 100, success:true, message: "Order Created Successfully."};
                  }else{
                    return {success:false, message: "Error Creating the order!", status: 402};                     
                  }

                }else{
                   // update the order
                   const update = await Order.findOneAndUpdate({products:validated.data}, 
                    {$set: {products:validated.data, amount: data.amount, items: validated.data.length, deliveryfee: data.deliveryfee,destination: data.destination, origin:data.origin}}
                  )
                  if(update){
                    const updateamount = exists.amount;
                    console.log(updateamount-data.amount)
                    return {success:false, message: "Order Updated.", status: 101};
                  }else{
                    return {success:false, message: "Error Updating Order.", status: 402};
                  }
                }
                  
              }catch(e){
                  console.log(e)
              }
          
      }else{
        return {success:false, message: "Cart Changed"};
      }
      


  }
        
    



}



module.exports = Payments