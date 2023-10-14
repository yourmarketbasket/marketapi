const datetime = require('node-datetime')
const https = require('https');
const axios = require('axios')


class Daraja{
    // access token
    static async generateAccessToken(){
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
    // mpesa express
    static async mpesaExpress(data) {  
        const timestamp = datetime.create().format('YmdHMS');
        const shortCode = 174379;
        const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        const pword = Buffer.from(shortCode + passKey + timestamp).toString('base64');

        return new Promise(async (resolve, reject) => {
            try {
                const token = await Daraja.generateAccessToken();
                const requestData = {
                    BusinessShortCode: 174379,
                    Password: pword,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: data.amount,
                    PartyA: data.phone,
                    PartyB: 174379,
                    PhoneNumber: data.phone,
                    CallBackURL: "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/callbackUrl",
                    AccountReference: data.reference,
                    TransactionDesc: data.description,
                };

                const req = https.request({
                    method: 'POST',
                    hostname: 'sandbox.safaricom.co.ke',
                    path: '/mpesa/stkpush/v1/processrequest',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token.access_token,
                    },
                }, (res) => {
                    let responseData = '';

                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        const response = JSON.parse(responseData);
                        resolve(response);
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                req.write(JSON.stringify(requestData));
                req.end();
            } catch (error) {
                reject(error);
            }
        });
    }
    // B2C
    static async B2C(data){
        const token = await Daraja.generateAccessToken();
        const requestData = {
            OriginatorConversationID: '707402f3-ebf5-4e60-9ed7-2cec3583b5b2',
            InitiatorName: 'testapi',
            SecurityCredential: 'l9woNTJSiglbnjHWGnAgX22i5WEELfunguJD6KSR65ublRlBfIqMCFDOSfo7TVnj5HaAeNKydn7CrPxQjW67YlEE06CG653/HwMO6x51TwliMYB72F3g3EyMSaYSkYR/gUD6uxYQpWPhFX4pnEQoxXqZ8ptJ5uNW6a1MFy8mmAviU2S/6soQBavh1Ql55fRWFAg4CtqqVD8I8sY8/lVTJVr+gjMvcUINwuaywl6hoImT36buY0ZhLdbLqoXaPWAoi0fzhW/cX43nTIjgXligIsApyY0ON3t9+spbjakHlzehmZqsF46T4sc5cPRceQTQ47eOGSkzTBm8yfpXhe5GmQ==',
            CommandID: 'BusinessPayment',
            Amount: data.amount,
            PartyA: 600997,
            PartyB: 254708374149,
            Remarks: data.remarks,
            QueueTimeOutURL: 'https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout',
            ResultURL: 'https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl',
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
    // reversal
    static async Reversal(data){
        const token = await Daraja.generateAccessToken();
        const requestData = {
            "Initiator": "testapi",
            "SecurityCredential": "i1cK1mb7g7m90OhBfr+xv05Onwbw0uRAp0VsQU6aDAW8pCC4GJ0l11jYccDLpa1PEzL0jAwaf8PMHon6FtTbTGWpFRHpvAnzjAfWGtZSeN0JWpS4qXYy0eYzsX/nwBh8ZIe+FnaOUVJvu8w+zrPebStbpcWpOrNyzZ1XGiute6nt5gJq/Ybg4jhLoOBZTf6jufDyb+WoEcz7Vob9vhSHTNlNWBzDJbKt4scnehW3ELfo4+zFjDhnM4TNsQi+/VueyW2huzESH7ySywzqGXQ1usMe3tOl1gSZt7nJ8d1ImPMEt5svg+9JthgZNFGGcU0rh2/u6IpEa6c3Jyj4kwgT+g==",
            "CommandID": "TransactionReversal",
            "TransactionID": data.transactionID,
            "amount": data.amount,
            "ReceiverParty": "600986",
            "RecieverIdentifierType": "11",
            "ResultURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl",
            "QueueTimeOutURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "remarks": data.remarks,
            "occassion": data.occassion
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+token.access_token
            }
        };

        axios.post('https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request', requestData, config)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error(error);
            });


    }
    // transaction status
    static async transactionStatus(data){
        const token = await Daraja.generateAccessToken();
        const requestData = {
            "Initiator": "testapi",
            "SecurityCredential": "Df2fBVrqEjj+rH2jZNhFYlkS1wOhV2YvCICEXVtsSEo+CdxT1eEcli7fghRSpiwSV2M+LoqagoYtK+cUXiHUKdLliS2J4NdOTYpbdsGWSqyV206Ew/egPfThCfxeRBzGlWtxjS+Uk6U1hbHy62x1AY/fb6hq04kXeHbXzrQt/ktJLWvcKqQPJ+oYf/TbVBh7/NXpREjrTH6BFrg9sT77eg5KzHLYraPSDOnn/FFK6GwcIlMAMmRf+ikZD3LQI+y/agNDvfbjcy0SZ6oQI89mRtJAkDFBKUaWADDeASXkkxvSdeadzUkHmu8iZxX6grZNNioSXlnCDUdmXUvSAvAt9Q==",
            "CommandID": "TransactionStatusQuery",
            "TransactionID": data.transactionID,
            "PartyA": 600977,
            "IdentifierType": "4",
            "ResultURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl",
            "QueueTimeOutURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "Remarks": data.remarks,
            "Occassion": data.occassion
        };

        return new Promise((resolve, reject) => {
            const req = https.request({
                method: 'POST',
                hostname: 'sandbox.safaricom.co.ke',
                path: '/mpesa/transactionstatus/v1/query',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.access_token,
                },
            }, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    const response = JSON.parse(responseData);
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
        const token = await Daraja.generateAccessToken();
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
            "QueueTimeOutURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl"
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
        const token =  await Daraja.generateAccessToken();
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
            "QueueTimeOutURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/timeout",
            "ResultURL": "https://0b59-196-250-208-122.ngrok-free.app/api/darajaUrls/resultUrl"
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



}



module.exports = Daraja