const express = require('express')
const router = express.Router()

// Load DB Models
const Part = require('../models/Part')
const RequestQuote = require('../models/RequestQuote')
const RestockPart = require('../models/RestockPart')

//Route to request quote for parts
router.post ('/', function(req,res){
    var requestStockedAS=req.body.stockedAS
    var requestedDescription=req.body.description1
    var requestedSapNumber=req.body.sapNumber
    var requestedPrice=req.body.price
    res.render('pages/partRequest', {banner: 'Parts Quote Request', message:'', requestStockedAS, requestedDescription, requestedSapNumber, requestedPrice})
    
})

//Route to request quote for new parts
router.get ('/requestNewPart', function(req,res){
    res.render('pages/requestNewPart', {banner: 'New Parts Quote Request', message:''})
})

router.post('/requestNewPart', function(req,res){
    var today = new Date()
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
    var requestInfo = req.body
    var newRequest = new RequestQuote({
        stockedAS: requestInfo.stockedAS,
        description1: requestInfo.description1,
        sapNumber: requestInfo.sapNumber,
        price: requestInfo.price,
        name: requestInfo.name,
        company: requestInfo.company,
        email: requestInfo.email,
        phone: requestInfo.phone,
        message: requestInfo.message,
        dateRequest: date
    })
    newRequest.save(function(err,RequestQuote){
        if(err)
            res.send("error")
        else
            res.render('pages/requestSent', {banner: 'New Parts Quote Request', message: 'Request Sent'})
    })
})

router.post('/quoteRequest', function(req,res){
    var today = new Date()
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
    var requestInfo = req.body
    var newRequest = new RequestQuote({
        stockedAS: requestInfo.stockedAS,
        description1: requestInfo.description1,
        sapNumber: requestInfo.sapNumber,
        price: requestInfo.price,
        name: requestInfo.name,
        company: requestInfo.company,
        email: requestInfo.email,
        phone: requestInfo.phone,
        message: requestInfo.message,
        dateRequest: date,
        quantity: requestInfo.quantity
    })
    newRequest.save(function(err,RequestQuote){
        if(err)
            res.send("error")
        else
            res.render('pages/requestSent', {banner: 'Parts Quote Request', message: 'Request Sent'})
    })
})

router.post('/partRestock', function(req,res){
    var restockAS = req.body.stockedAS
    var restockdescription1 = req.body.description1
    var restocksapNumber = req.body.sapNumber
    res.render('pages/partRestock', {banner: 'Restock Order',message:'',restockAS,restockdescription1,restocksapNumber});
})

router.post('/restockOrder', function(req,res){
    var today = new Date()
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
    var restockInfo = req.body   //needs to match form
    var restockPart = new RestockPart({
        stockedAS: restockInfo.stockedAS,
        description1: restockInfo.description1,
        sapNumber: restockInfo.sapNumber,
        quantity: restockInfo.quantity,
        requestor: restockInfo.requestor,
        daterequested: date
    })
    restockPart.save(function(err,RestockPart){
        if(err)
            res.send("error")
        else
            res.redirect('/partHome')
    }) 
})

//route to display all part reorders
router.get('/restockRequests',function(req,res){
    RestockPart.find(function(err,response){
        res.render('pages/restockSearchResults', {banner:'Part Restocks',message:'',response})
    })
})

//route to display all requested quotes
router.get('/quoteRequests',function(req,res){
    RequestQuote.find(
        function(err,response){
            res.render('pages/requestSearchResults', {banner: 'Requests',message:'',response})
        })
})

//route to delete part requests/restock from the table
router.get('/restockDelete/:id/delete',function(req,res){
    RestockPart.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err)
            else
                res.redirect('/partRequest/restockRequests')
        }
    )
})

//route to delete part requests from the table
router.get('/requestDelete/:id/delete',function(req,res){
    RequestQuote.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err)
            else
                res.redirect('/partRequest/quoteRequests')
        }
    )
})

module.exports = router