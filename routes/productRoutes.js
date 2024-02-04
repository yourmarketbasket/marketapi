const express = require('express');
const router = express.Router();
const ProductService = require('../Services/productServices')

module.exports = (io)=>{
    router.post('/addToCart', async(req, res)=>{
        const addtocart = await ProductService.addToCart(req.body, io)
        res.json(addtocart)   
    
    })
    
    router.post('/availableQttyForUser', async(req, res)=>{
        res.json(await ProductService.availableProductQuantityForUser(req.body))
    
    });
    
    router.post('/editCartProductQuantity', async (req, res) => {   
        const updatedCart = await ProductService.editCartProductQuantity(req.body, io);       
        res.status(200).json(updatedCart);       
    });
      
     
    router.get('/numOfItemsInCart/:userid', async(req, res)=>{
        items = await ProductService.numberOfItemsInCart(req.params.userid);       
        res.status(200).json(items);
        
    });
    
    router.get('/getCartItems/:id', async(req, res)=>{
        const userid = req.params.id
        response = await ProductService.getCartItems(userid);
        if(response.success){
            res.status(200).json(response);
        }else{
            res.status(400).json(response);
        }
    })
    
    router.get('/productDetails/:id', async(req, res)=>{
        const id = req.params.id;
        res.json(await ProductService.getProductDetails(id));
    })
    
    router.post('/decreaseCartItemByOne', async(req,res)=>{
        res.json(await ProductService.reduceQttyByOne(req.body, io))
    })
    router.post('/clearcart', async(req,res)=>{
        res.json(await ProductService.clearCart(req.body, io))
    })
    router.post('/addProductView', async(req,res)=>{
        res.json(await ProductService.addProductView(req.body, io))
    })
    router.post('/getProductDetails', async(req,res)=>{
        res.json(await ProductService.getProductDetails(req.body, io))
    })
    
    router.post('/getDTD', async(req, res)=>{
        const result = await ProductService.getDistanceAndTimeData(req.body.userid);
       
        res.status(200).json(result);
    })
    
    router.post('/increaseCartItemByOne', async(req,res)=>{
        res.json(await ProductService.increaseQttyByOne(req.body, io))
    })
    router.post('/removeCartItem', async(req,res)=>{
        res.json(await ProductService.removeCartItem(req.body, io))
    })
    router.post('/paystackCallback', async(req,res)=>{
        console.log(res.json(await ProductService.paystackCallBack(req.body)))
    })
    router.post('/paystackWebhook', async(req,res)=>{
        console.log(res.json(await ProductService.paystackWebhook(req.body)))
    })


    return router;
}

