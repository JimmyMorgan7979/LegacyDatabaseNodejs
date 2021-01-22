var express = require('express');
var app = express();
var bodyParser = require('body-parser');


// the following allows you to serve static files
app.use('/static', express.static('public'))

//Mongodb connection new 10-22-20
var mongoose = require('mongoose');
//var mongoDB='mongodb://localhost:27017/Inventory';
var mongoDB = 'mongodb+srv://admin:Pergatory_1979@cluster0.3duu7.mongodb.net/local_library?retryWrites=true&w=majority'
mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console,'MongoDB connection error:'));

//to parse url encoded data
app.use(bodyParser.urlencoded({ extended: true }));

//to parse json data
app.use(bodyParser.json());

//SETS THE VIEW ENGINE 
//app.set('view engine', 'pug');
app.set('view engine','ejs');
//app.set('views', './views');

//Database Model for our Cards
var boardSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    binNumber: String,
    binLocation: String,
    remanPrice: String,
    exchangePrice: String,
    dateReceived: String
});
var Card = mongoose.model("Card", boardSchema);

//DATABASE MODEL FOR REMOVED CARDS
var removedboardSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    binNumber: String,
    binLocation: String,
    remanPrice: String,
    exchangePrice: String,
    dateRemoved: String
});
var RemovedCard = mongoose.model("RemovedCard",removedboardSchema);

//DATABASE MODEL FOR REMOVED PARTS
var removedPartSchema = mongoose.Schema({
    stockedAS: String,
    description1: String,
    sapNumber: String,
    manufacturer: String,
    description2: String,
    location1: String,
    location2: String,
    location3: String,
    drawer: String,
    cross1: String,
    cross2: String,
    cross3: String,
    price: String,
    dateRemoved: String
});
var RemovedPart = mongoose.model("RemovedPart",removedPartSchema);


//Database Model for Quote requests
var requestQuoteSchema = mongoose.Schema({
    partNumber: String,
    serialNumber: String,
    remanPrice: String,
    exchangePrice: String,
    stockedAS: String,
    description1: String,
    sapNumber: String,
    price: String,
    name: String,
    company: String,
    email: String,
    phone: String,
    message: String,
    dateRequest: String,
    quantity: String
});
var RequestQuote = mongoose.model("RequestQuote",requestQuoteSchema);

//Database Model for our parts
var partSchema = mongoose.Schema({
    stockedAS: String,
    description1: String,
    sapNumber: String,
    manufacturer: String,
    description2: String,
    location1: String,
    location2: String,
    location3: String,
    drawer: String,
    cross1: String,
    cross2: String,
    cross3: String,
    price: String
});
var Part = mongoose.model("Part", partSchema);

//Database Model for parts RESTOCK
var restockPartSchema = mongoose.Schema({
    stockedAS: String,
    description1: String,
    sapNumber: String,
    quantity: String,
    requestor: String,
    daterequested: String
});
var RestockPart = mongoose.model("RestockPart", restockPartSchema);

// Route for "LEGACY SEARCH"
app.get('/', function(req,res){
    res.render('pages/home',{banner: "Legacy Search", message: ""});
})
//Route for search by Model Number results to be displayed
app.post('/searchresult', function(req,res){
   var search = req.body;
    Card.find({partNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/searchResult', {banner: 'Search Results', search,response, message:''});
        }).limit(20);
});
//THIS SECTION IS FOR "SEARCH BY SERIAL NUMBER"
app.get('/serialSearch', function(req,res){
	res.render('pages/serialSearch', {banner: 'Search By Serial Number', message:''});
});
app.post('/serialSearch', function(req,res){
    var search = req.body;
     Card.find({serialNumber: {$regex: search.searchWord, $options: 'i'}},
         function(err,response){
             res.render('pages/serialSearchResult', {banner: 'Search Results', search,response, message:''});
         }).limit(20);
 });

//Route for items to be removed from the legacy database AND ALSO INSERTS INTO THE DELETED TABLE
app.get('/del/:id/delete',function(req,res){
    test = Card.find({_id: req.params.id},
        function(err,response){
            var today = new Date();
            var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
            var adddeleted = response[0];
            var removedcard = new RemovedCard({
                partNumber: adddeleted.partNumber,
                serialNumber: adddeleted.serialNumber,
                binNumber: adddeleted.binNumber,
                binLocation: adddeleted.binLocation,
                dateRemoved: date
            });
            removedcard.save(function(err,RemovedCard){
                if(err)
                    res.send("error");
            });
        });

    Card.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/')
        });
});

//Route for items to be added to legacy database
app.get('/addCard', function(req,res){
    res.render('pages/addCard', {banner: 'Add To Legacy',message:''});
})
app.post('/addCard', function(req,res){
    var today = new Date();
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
    var cardInfo = req.body;
    var newCard = new Card({
        partNumber: cardInfo.partNumber,
        serialNumber: cardInfo.serialNumber,
        binNumber: cardInfo.binNumber,
        binLocation: cardInfo.binLocation,
        dateReceived: date
    });
    newCard.save(function(err,Card){
        if(err)
            res.send("error");
        else
            res.render('pages/home', {banner: 'Legacy', message: 'Added Record to DB'});
    }) ;
});
// Edit function for legacy database
app.get('/edit', function(req,res)
{
    res.render('pages/editCard', {banner: 'Edit Entry', message:''});
});


//This begins the section for parts search
app.get('/parts', function(req,res){
    res.render('pages/partSearchhome', {banner: 'Parts Search', message:''});
});

//display parts search results
app.post('/partSearchResult', function(req,res){
    var search = req.body;
    Part.find({stockedAS: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/partSearchResult', {banner: 'Search Results', search,response, message:''});
        }).limit(20);
});

//THIS BEGINS THE SECTION FOR SEARCH PARTS BY LV NUMBER
app.get('/lvSearch', function(req,res){
	res.render('pages/partSearchLVHome', {banner: 'Search By "LV" Number', message:''});
});
app.post('/lvSearch', function(req,res){
    var search = req.body;
    Part.find({sapNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/partSearchResult', {banner: 'Search Results', search,response, message:''});
        }).limit(20);
});

//Route to add parts
app.get ('/addPart', function(req,res){
    res.render('pages/addPart', {banner: 'Add Part to DB', message: ''})
})
app.post('/addPart', function(req,res){
    var partInfo = req.body;
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
            res.send("error");
        else
            res.render('pages/partAdmin', {banner: 'Parts Search', message: 'Added Part to DB'});
    });
});

// Routes to edit parts
app.post('/updatePart', function(req,res){
    var search = req.body;
        Part.find({'stockedAS': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/editPart', {banner: 'Search Results to Update Parts Record', search,response, message:''});
        }).limit(1);
 });

 app.post('/updateLVPart', function(req,res){
    var search = req.body;
        Part.find({'sapNumber': {'$regex': search.searchWord,$options:'i:}'}},
        function(err,response){
            res.render('pages/editPart', {banner: 'Search Results to Update Parts Record', search,response, message:''});
        }).limit(1);
 });

// Edit function for parts database
app.post('/editpart/:id', function(req,res){
    var updatepart = {_id: req.params.id}
    var addedit = req.body
    Part.findOneAndUpdate(updatepart, addedit,
        function (err, docs) { 
            if (err){ 
                console.log(err) 
            } 
            else{ 
                res.redirect('/partAdmin') 
            } 
    })
})


        

//Route for parts to be deleted and inserted into the parts delete table
app.get('/delpart/:id/delete',function(req,res){
    test = Part.find({_id: req.params.id},
        function(err,response){
            var today = new Date();
            var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
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
                    res.send("error");
            });
        });
    Part.deleteOne({_id: req.params.id},
        function(err){
            if(err) 
                res.json(err);
            else
                res.redirect('/partAdmin')
        });
});

//Route to send Email to request quote for new parts
app.get ('/requestNewPart', function(req,res){
    res.render('pages/requestNewPart', {banner: 'New Parts Quote Request', message:''})
})

app.post('/requestNewPart', function(req,res){
    var today = new Date();
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
    var requestInfo = req.body;
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
    });
    newRequest.save(function(err,RequestQuote){
        if(err)
            res.send("error");
        else
            res.render('pages/sentRequest', {banner: 'New Parts Quote Request', message: 'Request Sent'});
    });
});

//Route to send Email to request quote for parts
app.post ('/getRequest', function(req,res){
    var requestStockedAS=req.body.stockedAS
    var requestedDescription=req.body.description1
    var requestedSapNumber=req.body.sapNumber
    var requestedPrice=req.body.price
    res.render('pages/requestPart', {banner: 'Parts Quote Request', message:'', requestStockedAS, requestedDescription, requestedSapNumber, requestedPrice})
    
})
app.post('/requestPart', function(req,res){
    var today = new Date();
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
    var requestInfo = req.body;
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
    });
    newRequest.save(function(err,RequestQuote){
        if(err)
            res.send("error");
        else
            res.render('pages/sentRequest', {banner: 'Parts Quote Request', message: 'Request Sent'});
    });
  });


app.get('/requestedquotes',function(req,res){
    RequestQuote.find(
        function(err,response){
            res.render('pages/requestSearchResults', {banner: 'Requests',message:'',response});
        });
});

//route to delete part requests from the table
app.get('/deleterequest/:id/delete',function(req,res){
    RequestQuote.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/requestedquotes')
        });
    });

//Route to Admin page to search by Stocked As part number
app.get ('/partAdmin', function(req,res){
    res.render('pages/partAdmin', {banner: 'Admin',message:''})
})


//Route to Admin page to search by SAP part number
app.get ('/partAdminLV', function(req,res){
    res.render('pages/partAdminLV', {banner: 'Admin',message:''})
})

//ROUTE TO PRINT LABELS FROM ADMIN PAGE
app.post('/printlabel', function(req,res){
    var printinfo = req.body;
    res.render('pages/printlabel', {banner: '', message:'', printinfo})
});

//Begins the section to delete quote requests from the table
app.get('/delete/:id/delete',function(req,res){
    RequestQuote.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/partAdmin')
        });
    });
//route to display all part reorders

app.get('/restock',function(req,res){
    RestockPart.find(function(err,response){
        res.render('pages/restockSearchResults', {banner:'Part Restocks',message:'',response});
    });
});

//route to delete part requests/restock from the table
app.get('/deleterestock/:id/delete',function(req,res){
    RestockPart.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/restock')

        });
    });
    
    
app.post('/restockPart', function(req,res){
    var restockAS = req.body.stockedAS
    var restockdescription1 = req.body.description1
    var restocksapNumber = req.body.sapNumber
    res.render('pages/restockPart', {banner: 'Restock Order',message:'',restockAS,restockdescription1,restocksapNumber});
})
app.post('/restockOrder', function(req,res){
    var today = new Date();
    var date = today.getMonth()+1+'-'+(today.getDate())+'-'+today.getFullYear();
    var restockInfo = req.body; //needs to match form
    var restockPart = new RestockPart({
        stockedAS: restockInfo.stockedAS,
        description1: restockInfo.description1,
        sapNumber: restockInfo.sapNumber,
        quantity: restockInfo.quantity,
        requestor: restockInfo.requestor,
        daterequested: date
    });
    restockPart.save(function(err,RestockPart){
        if(err)
            res.send("error");
        else
            res.render('pages/partSearchhome', {banner: 'Restock Order', message: 'Part Ordered'});
    }) ;
});
//BEGINS THE SECTION FOR CREATING QUOTES TO SEND TO THE CUSTOMER
app.get('/createquote',function(req,res){
    res.render('pages/createquote', {banner:"Create Quote", message:''});
})

//BEGINS THE SECTION FOR PRINTING LABELS
app.get ('/printlabel', function(req,res){
    res.render('pages/printlabel', {banner: 'Print Label', message: ''})
})


 
//Port that the app sends to
//app.listen(3000);
app.listen(process.env.PORT || 5000);
//console.log("Running on port 5000")
