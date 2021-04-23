const express = require('express')
const router = express.Router()

// Load DB Models
const Part = require('../models/Part')
const RemovedPart = require('../models/RemovedPart')

//Route for parts search home page 
router.get('/', function(req,res){
    res.render('pages/partHome', {banner: 'Parts Search', message:''})
})

//Route for search by Part Number results to be displayed
router.post('/partSearchResult', function(req,res){
    var search = req.body
    Part.find({stockedAS: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/partSearchResult', {banner: 'Search Results', search,response, message:''})
        }).limit(20)
})

//Route for parts search by LV number
router.get('/partHomeLV', function(req,res){
	res.render('pages/partHomeLV', {banner: 'Search By "LV" Number', message:''})
})

//Route for search by LV Number results to be displayed
router.post('/partSearchResultLV', function(req,res){
    var search = req.body
    Part.find({sapNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/partSearchResult', {banner: 'Search Results', search,response, message:''})
        }).limit(20)
})

//Route to add parts
router.get ('/partAdd', function(req,res){
    res.render('pages/partAdd', {banner: 'Add Part to DB', message: ''})
})

router.post('/partAdd', function(req,res){
    var partInfo = req.body
    var newPart = new Part({
        stockedAS: partInfo.stockedAS,
        description1: partInfo.description1,
        sapNumber: partInfo.sapNumber,
        manufacturer: partInfo.manufacturer,
        description2: partInfo.description2,
        location1: partInfo.location1,
        location2: partInfo.location2,
        location3: partInfo.location3,
        drawer: partInfo.drawer,
        cross1: partInfo.cross1,
        cross2: partInfo.cross2,
        cross3: partInfo.cross3,
        price: partInfo.price
    });
    newPart.save(function(err,Part){
        if(err)
            res.send("error")
        else
            res.redirect('/partLogin/partAdmin')
    })
})

// Routes to edit parts
router.post('/partUpdate', function(req,res){
    var search = req.body
        Part.find({'stockedAS': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', search,response, message:''})
        }).limit(1)
 })
// 
 router.post('/partUpdateLV', function(req,res){
    var search = req.body
        Part.find({'sapNumber': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', search,response, message:''})
        }).limit(1)
 })


// Edit function for parts database
router.post('/partEdit/:id', function(req,res){
    var updatepart = {_id: req.params.id}
    var addedit = req.body
    Part.findOneAndUpdate(updatepart, addedit,
        function (err, docs) { 
            if (docs == null){ 
                res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', addedit, message:'Did not update record'}) 
            } else { 
                res.redirect('/partLogin/partAdmin') 
            } 
    })
})

//Route for parts to be deleted and inserted into the parts delete table
router.get('/delpart/:id/delete',function(req,res){
    test = Part.find({_id: req.params.id},
        function(err,response){
            var today = new Date()
            var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
            var adddeleted = response[0];
            var removedpart = new RemovedPart({
                stockedAS: adddeleted.stockedAS,
                description1: adddeleted.description1,
                sapNumber: adddeleted.sapNumber,
                manufacturer: adddeleted.manufacturer,
                description2: adddeleted.description2,
                location1: adddeleted.location1,
                location2: adddeleted.location2,
                location3: adddeleted.location3,
                drawer: adddeleted.drawer,
                cross1: adddeleted.cross1,
                cross2: adddeleted.cross2,
                cross3: adddeleted.cross3,
                price: adddeleted.price,
                dateRemoved: date
            });
            removedpart.save(function(err,RemovedPart){
                if(err)
                    res.send("error")
            })
        })
    Part.deleteOne({_id: req.params.id},
        function(err){
            if(err) 
                res.json(err)
            else
                res.redirect('/partLogin/partAdmin')
        })
})

// //BEGINS THE SECTION FOR PRINTING LABELS
// router.get ('/printlabel', function(req,res){
//     res.render('pages/printlabel', {banner: 'Print Label', message: ''})
// })

// //ROUTE TO PRINT LABELS FROM ADMIN PAGE
// router.post('/printlabel', function(req,res){
//     var printinfo = req.body;
//     res.render('pages/printlabel', {banner: '', message:'', printinfo})
// })

module.exports = router