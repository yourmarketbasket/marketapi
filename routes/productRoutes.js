const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ProductService = require('../Services/productServices')
const authenticator = require('../middleware/authenticator');


module.exports = (io)=>{
    router.post('/addToCart', authenticator, async(req, res)=>{
        const addtocart = await ProductService.addToCart(req.body, io)
        res.json(addtocart)   
    
    })
    
    router.post('/availableQttyForUser',authenticator, async(req, res)=>{
        res.json(await ProductService.availableProductQuantityForUser(req.body))
    
    });
    
    router.post('/editCartProductQuantity',authenticator, async (req, res) => {   
        const updatedCart = await ProductService.editCartProductQuantity(req.body, io);       
        res.status(200).json(updatedCart);       
    });
      
     
    router.get('/numOfItemsInCart/:userid',authenticator, async(req, res)=>{
        items = await ProductService.numberOfItemsInCart(req.params.userid);       
        res.status(200).json(items);
        
    });
    
    router.get('/getCartItems/:id',authenticator, async(req, res)=>{
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
        res.json(await ProductService.getProductDetailsbyID(id));
    })
    // get grouped orders
    router.get('/groupAllStoreOrders/:storeid',authenticator, async(req,res)=>{
        res.json(await ProductService.groupAllStoreOrders(req.params.storeid, io));
    });
    
    router.post('/decreaseCartItemByOne',authenticator, async(req,res)=>{
        res.json(await ProductService.reduceQttyByOne(req.body, io))
    })
    router.post('/clearcart',authenticator, async(req,res)=>{
        res.json(await ProductService.clearCart(req.body, io))
    })
    router.post('/addProductView',authenticator, async(req,res)=>{
        res.json(await ProductService.addProductView(req.body, io))
    })
    router.post('/getProductDetails', async(req,res)=>{
        res.json(await ProductService.getProductDetails(req.body, io))
    })

    router.post('/getPaginatedProducts', async(req, res)=>{
        res.json(await ProductService.getPaginatedProducts(req.body, io))
    })

    router.post('/addProduct',authenticator, async(req,res)=>{
        res.json(await ProductService.addProduct(req.body, io))
    })
    router.post('/editStoreProductDetails',authenticator, async(req,res)=>{
        res.json(await ProductService.editStoreProductDetails(req.body, io))
    })
    router.post('/reviewlisteditem',authenticator, async(req,res)=>{
        res.json(await ProductService.reviewListedItem(req.body, io))
    })
    router.get('/getcategoriesSubcatBrand', async(req,res)=>{
        res.json(await ProductService.categoriesSubcatBrand(io))
    })
    
    router.post('/getDTD',authenticator, async(req, res)=>{
        const result = await ProductService.getDistanceAndTimeData(req.body.userid);
       
        res.status(200).json(result);
    })
    router.get('/getCategoryProducts/:category', async (req, res)=>{
        res.json(await ProductService.getCategoryProducts(req, io))
    })
    router.get('/getProductsByStore/:id',authenticator, async (req, res)=>{
        res.json(await ProductService.getStoreProducts(req.params.id, io))
    })
    router.get('/getStoreOrders/:id',authenticator, async (req, res)=>{
        res.json(await ProductService.getStoreOrders(req.params.id, io))
    })
    router.get('/getStoresAndProductsByOwnerId/:ownerid',authenticator, async (req, res)=>{
        res.json(await ProductService.getStoreAndProductsByOwnerID(req.params.ownerid, io));
    })

    router.get('/getUserOrders/:userid',authenticator, async (req, res)=>{
        res.json(await ProductService.getUserOrders(req.params.userid, io))
    })
    
    router.post('/increaseCartItemByOne',authenticator, async(req,res)=>{
        res.json(await ProductService.increaseQttyByOne(req.body, io))
    })
    router.post('/removeCartItem',authenticator, async(req,res)=>{
        res.json(await ProductService.removeCartItem(req.body, io))
    })
    router.post('/paystackCallback',authenticator, async(req,res)=>{
        console.log(res.json(await ProductService.paystackCallBack(req.body)))
    })
    router.post('/paystackWebhook',authenticator, async(req,res)=>{
        console.log(res.json(await ProductService.paystackWebhook(req.body)))
    })


    return router;
}

