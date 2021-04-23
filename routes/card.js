const express = require('express')
const router = express.Router()

// Load DB Models
const Card = require('../models/Card')
const RemovedCard = require('../models/RemovedCard')

// Route for home page "Legacy Search"
router.get('/', function(req,res){
    res.render('pages/cardHome',{banner: "Legacy Search", message: ""})
})

//Route for search by Model Number results to be displayed
router.post('/cardSearchResult', function(req,res){
   var search = req.body
    Card.find({partNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/cardSearchResult', {banner: 'Search Results', search,response, message:''})
        }).limit(20)
})

//Route for search by serial number
router.get('/cardSearchSN', function(req,res){
	res.render('pages/cardSearchSN', {banner: 'Search By Serial Number', message:''})
})

//Route for search by Serial Number results to be displayed
router.post('/cardSearchResultSN', function(req,res){
    var search = req.body
     Card.find({serialNumber: {$regex: search.searchWord, $options: 'i'}},
         function(err,response){
             res.render('pages/cardSearchResult', {banner: 'Search Results', search,response, message:''})
         }).limit(20)
 })

//Route for cards to be added to legacy database
router.get('/cardAdd', function(req,res){
    res.render('pages/cardAdd', {banner: 'Add To Legacy',message:''})
})

router.post('/cardAdd', function(req,res){
    var today = new Date()
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
    var cardInfo = req.body
    var newCard = new Card({
        partNumber: cardInfo.partNumber,
        serialNumber: cardInfo.serialNumber,
        binNumber: cardInfo.binNumber,
        binLocation: cardInfo.binLocation,
        dateReceived: date
    })
    newCard.save(function(err,Card){
        if(err)
            res.send("error");
        else
            res.render('pages/cardAdmin', {banner: 'Legacy', message: 'Added Record to DB'})
    }) 
})

// Edit function for legacy database by serial number
router.post('/cardEdit', function(req,res){
    var search = req.body
    Card.find({_id: search._id}, 
        function(err, response){
            res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search, response, message:''}) 
    }).limit(1)
 })

// Edit function for legacy database by model number
router.post('/cardEdit/:id', function(req,res){
    var updatecard = {_id: req.params.id}
    var addedit = req.body
    Card.findOneAndUpdate(updatecard, addedit,
        function (err, docs) { 
            if (docs == null){ 
                res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', addedit, message:'Did not update record'}) 
            } else { 
                res.redirect('/cardLogin/cardAdmin') 
            } 
        }
    )
})

// Route to edit cards by model number
router.post('/cardUpdate', function(req,res){
    var search = req.body
    Card.find({'partNumber': {'$regex': search.searchWord,$options:'i'}},
    function(err,response){
        res.render('pages/cardUpdate', {banner: 'Search Results to Update Legacy Record', search,response, message:''})
    }).limit(20);
})

// Route to edit card by serial number
router.post('/cardUpdateSN', function(req,res){
    var search = req.body
    Card.find({'serialNumber': {'$regex': search.searchWord,$options:'i'}},
    function(err,response){
        if (response == null){ 
            res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search, message:'No Record Found'}) 
        } else { 
            res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search,response, message:''})
        }
    }).limit(1)
})

//Route for items to be removed from the legacy database (Admin page) and inserts into a deleted table
router.get('/del/:id/delete',function(req,res){
    test = Card.find({_id: req.params.id},
        function(err,response){
            var today = new Date()
            var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
            var adddeleted = response[0]
            var removedcard = new RemovedCard({
                partNumber: adddeleted.partNumber,
                serialNumber: adddeleted.serialNumber,
                binNumber: adddeleted.binNumber,
                binLocation: adddeleted.binLocation,
                dateRemoved: date
            })
            removedcard.save(function(err,RemovedCard){
                if(err)
                    res.send("error");
            })
        })

    Card.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err)
            else
                res.redirect('/cardLogin/cardAdmin')
        });
});

//Route for cards to be removed from the legacy database (search page) and inserts into a deleted table
router.get('/del/:id/remove',function(req,res){
    test = Card.find({_id: req.params.id},
        function(err,response){
            var today = new Date()
            var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear()
            var adddeleted = response[0]
            var removedcard = new RemovedCard({
                partNumber: adddeleted.partNumber,
                serialNumber: adddeleted.serialNumber,
                binNumber: adddeleted.binNumber,
                binLocation: adddeleted.binLocation,
                dateRemoved: date
            })
            removedcard.save(function(err,RemovedCard){
                if(err)
                    res.send("error")
            });
        });

    Card.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err)
            else
                res.redirect('/')
        })
})

module.exports = router