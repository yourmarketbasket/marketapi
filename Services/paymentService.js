const datetime = require('node-datetime')
const https = require('https');
const axios = require('axios')


class Payments{
    
    
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
            QueueTimeOutURL: 'https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout',
            ResultURL: 'https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl',
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
            "QueueTimeOutURL": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl"
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
            "QueueTimeOutURL": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl"
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
            "url": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/pesaPallIPNResponse",
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
    static async pesapalSubmitOrderRequest(){
    const pesapaltoken = await Payments.pesapalAuthtoken();
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
            "id": "AA1122-3344ZZ",
            "currency": "KES",
            "amount": 4.00,
            "description": "Payment description goes here",
            "callback_url": "https://cc56-196-250-208-122.ngrok-free.app/api/darajaUrls/callbackUrl",
            "redirect_mode": "",
            "notification_id": "cd5f317f-3f28-4c50-891d-de116d0e6fe5",
            "branch": "Store Name - HQ",
            "billing_address": {
            "email_address": "john.doe@example.com",
            "phone_number": "0701650736",
            "country_code": "KE",
            "first_name": "John",
            "middle_name": "",
            "last_name": "Doe",
            "line_1": "Pesapal Limited",
            "line_2": "",
            "city": "",
            "state": "",
            "postal_code": "",
            "zip_code": ""
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
        
    



}



module.exports = Payments