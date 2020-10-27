var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// the following allows you to serve static files
app.use('/static', express.static('public'))

//Mongodb connection new 10-22-20
var mongoose = require('mongoose');

mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console,'MongoDB connection error:'));

//to parse url encoded data
app.use(bodyParser.urlencoded({ extended: true }));

//to parse json data
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', './views');

//Database Model for our boards
var boardSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    binNumber: String,
    binLocation: String
});
var Card = mongoose.model("Card", boardSchema);

// Route for home page
app.get('/', function(req,res){
	res.render('home', {banner: 'Legacy Search', message:''});
});
//Route for search results to be displayed
app.post('/searchresult', function(req,res){
    var search = req.body; 
    Card.find({partNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            //console.log(response);
            res.render('searchResult', {banner: 'Search Results', search,response, message:''});
        });
});
//Route for items to be removed from the database
app.get('/test/:id/delete',function(req,res){
    Card.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/')
        });
});
//Route for items to be added to database
app.get('/addCard', function(req,res){
    res.render('addCard', {banner: 'Add To Legacy',message:''});
})
app.post('/addCard', function(req,res){
    var cardInfo = req.body;
    var newCard = new Card({
        partNumber: cardInfo.partNumber,
        serialNumber: cardInfo.serialNumber,
        binNumber: cardInfo.binNumber,
        binLocation: cardInfo.binLocation
    });
    newCard.save(function(err,Card){
        if(err)
            res.send("error");
        else
            res.render('home', {banner: 'Legacy', message: 'Added Record to DB'});
    }) ;
});

//Port that the app sends to
app.listen(3002);
