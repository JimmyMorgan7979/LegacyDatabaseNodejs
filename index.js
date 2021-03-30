var express = require('express')
var app = express()
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')
const bcrypt = require('bcryptjs')
const expressLayouts = require('express-ejs-layouts')
const { forwardAuthenticated, ensurePartAuthenticated, forwardPartAuthenticated, ensureCardAuthenticated, forwardCardAuthenticated } = require('./config/auth')
const LocalStrategy = require('passport-local').Strategy

// the following allows you to serve static files
app.use('/static', express.static(path.join(__dirname, 'public')))

//Mongodb connection new 10-22-20
var mongoose = require('mongoose')
//var mongoDB ='mongodb://10.83.93.60:27017/inventory'
//var mongoDB ='mongodb://localhost:27017/Inventory'
var mongoDB = 'mongodb+srv://admin:Pergatory_1979@cluster0.3duu7.mongodb.net/local_library?retryWrites=true&w=majority'
mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console,'MongoDB connection error:'));

//DeprecationWarning disable
mongoose.set('useFindAndModify', false)

//to parse url encoded data
app.use(express.urlencoded({ extended: true }));

//to parse json data
app.use(express.json());

//SETS THE VIEW ENGINE 
app.use(expressLayouts)
app.set('view engine','ejs');
app.set('layout', 'pages/layout');

// Express session
app.use(
    session({
        secret: 'its a secert for legacy and parts',
        resave: true,
        saveUninitialized: true
        //cookie: { maxAge: 900000 }  //  60000 = 1 minute
    })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

////////////////////////////////////// MongoDB Schema Routes //////////////////////////////////////

// Load DB Models
const User = require('./models/User')
const Card = require('./models/Card')
const RemovedCard = require('./models/RemovedCard')
const RemovedPart = require('./models/RemovedPart')
const RequestQuote = require('./models/RequestQuote')
const Part = require('./models/Part')
const RestockPart = require('./models/RestockPart')

////////////////////////////////////// Cards Route Code //////////////////////////////////////  

// Route for "LEGACY SEARCH"
app.get('/', function(req,res){
    res.render('pages/cardHome',{banner: "Legacy Search", message: ""});
})

//Route for search by Model Number results to be displayed
app.post('/cardSearchResult', function(req,res){
   var search = req.body;
    Card.find({partNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/cardSearchResult', {banner: 'Search Results', search,response, message:''});
        }).limit(20);
});

//THIS SECTION IS FOR "SEARCH BY SERIAL NUMBER"
app.get('/cardSearchSN', function(req,res){
	res.render('pages/cardSearchSN', {banner: 'Search By Serial Number', message:''});
});

app.post('/cardSearchResultSN', function(req,res){
    var search = req.body;
     Card.find({serialNumber: {$regex: search.searchWord, $options: 'i'}},
         function(err,response){
             res.render('pages/cardSearchResultSN', {banner: 'Search Results', search,response, message:''});
         }).limit(20);
 });

//Route for items to be added to legacy database
app.get('/cardAdd', function(req,res){
    res.render('pages/cardAdd', {banner: 'Add To Legacy',message:''});
})

app.post('/cardAdd', function(req,res){
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
            res.render('pages/cardAdmin', {banner: 'Legacy', message: 'Added Record to DB'});
    }) ;
});

// Edit function for legacy database
app.post('/cardEdit', function(req,res){
    var search = req.body;
    Card.find({_id: search._id}, 
        function(err, response){
            res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search, response, message:''}) 
    }).limit(1)
 });

// Edit function for legacy database
app.post('/cardEdit/:id', function(req,res){
    var updatecard = {_id: req.params.id}
    var addedit = req.body
    Card.findOneAndUpdate(updatecard, addedit,
        function (err, docs) { 
            if (docs == null){ 
                res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', addedit, message:'Did not update record'}) 
            } else { 
                res.redirect('/cardAdmin') 
            } 
        }
    )
})

 // Routes to edit cards
 app.post('/cardUpdate', function(req,res){
    var search = req.body;
        Card.find({'partNumber': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/cardUpdate', {banner: 'Search Results to Update Legacy Record', search,response, message:''});
        }).limit(20);
 });

 app.post('/cardUpdateSN', function(req,res){
    var search = req.body;
        Card.find({'serialNumber': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            if (response == null){ 
                res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search, message:'No Record Found'}) 
            } else { 
                res.render('pages/cardEdit', {banner: 'Search Results to Update Legacy Record', search,response, message:''}) 
            }
        }).limit(1);
 });
 
//Route for items to be removed from the legacy database AND ALSO INSERTS INTO THE DELETED TABLE
app.get('/del/:id/delete',function(req,res){
    page = req.body.page
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
                res.redirect(page)
        });
});

////////////////////////////////////// Parts Route Code ////////////////////////////////////// 

//This begins the section for parts search
app.get('/partHome', function(req,res){
    res.render('pages/partHome', {banner: 'Parts Search', message:''});
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
app.get('/partHomeLV', function(req,res){
	res.render('pages/partHomeLV', {banner: 'Search By "LV" Number', message:''});
});

app.post('/partSearchResultLV', function(req,res){
    var search = req.body;
    Part.find({sapNumber: {$regex: search.searchWord, $options: 'i'}},
        function(err,response){
            res.render('pages/partSearchResult', {banner: 'Search Results', search,response, message:''});
        }).limit(20);
});

//Route to add parts
app.get ('/partAdd', function(req,res){
    res.render('pages/partAdd', {banner: 'Add Part to DB', message: ''})
})

app.post('/partAdd', function(req,res){
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
app.post('/partUpdate', ensurePartAuthenticated, function(req,res){
    var search = req.body;
        Part.find({'stockedAS': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', search,response, message:''});
        }).limit(1);
 });

 app.post('/partUpdateLV', function(req,res){
    var search = req.body;
        Part.find({'sapNumber': {'$regex': search.searchWord,$options:'i'}},
        function(err,response){
            res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', search,response, message:''});
        }).limit(1);
 });


// Edit function for parts database
app.post('/partEdit/:id', function(req,res){
    var updatepart = {_id: req.params.id}
    var addedit = req.body
    Part.findOneAndUpdate(updatepart, addedit,
        function (err, docs) { 
            if (docs == null){ 
                res.render('pages/partEdit', {banner: 'Search Results to Update Parts Record', addedit, message:'Did not update record'}) 
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

////////////////////////////////////// Request, Restock, Quotes, and Print Route Code //////////////////////////////////////

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
app.post ('/partRequest', function(req,res){
    var requestStockedAS=req.body.stockedAS
    var requestedDescription=req.body.description1
    var requestedSapNumber=req.body.sapNumber
    var requestedPrice=req.body.price
    res.render('pages/partRequest', {banner: 'Parts Quote Request', message:'', requestStockedAS, requestedDescription, requestedSapNumber, requestedPrice})
    
})
app.post('/quoteRequest', function(req,res){
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
            res.render('pages/requestSent', {banner: 'Parts Quote Request', message: 'Request Sent'});
    });
  });

//route to delete part requests from the table
app.get('/deleteRequest/:id/delete',function(req,res){
    RequestQuote.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/quoteRequests')
        });
    });

//Begins the section to delete quote requests from the table
app.get('/quoteDelete/:id/delete',function(req,res){
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

//route to display all requested quotes
app.get('/quoteRequests',function(req,res){
    RequestQuote.find(
        function(err,response){
            res.render('pages/requestSearchResults', {banner: 'Requests',message:'',response});
        });
});

//route to delete part requests/restock from the table
app.get('/restockDelete/:id/delete',function(req,res){
    RestockPart.deleteOne({_id: req.params.id},
        function(err){
            if(err) res.json(err);
            else
                res.redirect('/restock')

        });
    });
    
app.post('/partRestock', function(req,res){
    var restockAS = req.body.stockedAS
    var restockdescription1 = req.body.description1
    var restocksapNumber = req.body.sapNumber
    res.render('pages/partRestock', {banner: 'Restock Order',message:'',restockAS,restockdescription1,restocksapNumber});
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
            res.render('pages/partHome', {banner: 'Restock Order', message: 'Part Ordered'});
    }) ;
});

//BEGINS THE SECTION FOR CREATING QUOTES TO SEND TO THE CUSTOMER
app.get('/createquote',function(req,res){
    res.render('pages/createquote', {banner:"Create Quote", message:''});
})

//BEGINS THE SECTION FOR PRINTING LABELS
// app.get ('/printlabel', function(req,res){
//     res.render('pages/printlabel', {banner: 'Print Label', message: ''})
// })

//ROUTE TO PRINT LABELS FROM ADMIN PAGE
app.post('/printLabel', function(req,res){
    var sapNumber = req.body.sapNumber
    var stockedAS = req.body.stockedAS
    var description1 = req.body.description1
    var location1 = req.body.location1
    var drawer = req.body.drawer
})

////////////////////////////////////// Password Code //////////////////////////////////////
passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match user / token
        User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'That email is not registered' })
            } 
            else if (user.token !== "Yes") {
                return done(null, false, { message: 'You do not have approval to access this resource' })
            }
        
            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Password incorrect' })
                }
            })
        })
    })
)


passport.serializeUser(function(user, done) {
    done(null, user.id);
})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})


// Login Parts Page
app.get('/partLogin', forwardPartAuthenticated, (req, res) => 
    res.render('pages/partLogin', {banner: 'Parts Admin Login', message: ''})
)

//Route to Admin page for parts to search by Stocked As part number
app.get ('/partAdmin', ensurePartAuthenticated, (req, res) =>
    res.render('pages/partAdmin', {banner: 'Parts Admin', message:''})
)

//Route to Admin page to search by SAP part number
app.get ('/partAdminLV', ensurePartAuthenticated, (req, res) =>
    res.render('pages/partAdminLV', {banner: 'Parts Admin', message:''})
)

// Login Parts
app.post('/partLogin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/partAdmin',
        failureRedirect: '/partLogin',
        failureFlash: true
    })(req, res, next)
})
  
// Logout Parts
app.get('/partLogout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/partLogin')
})

// Login Legacy Page
app.get('/cardLogin', forwardCardAuthenticated, (req, res) => {
    req.logout()
    res.render('pages/cardLogin', {banner: 'Legacy Admin Login', message: ''})
})

//Route to Admin page for Legacy to search by board number
app.get ('/cardAdmin', ensureCardAuthenticated, (req,res) =>
    res.render('pages/cardAdmin', {banner: 'Legacy Admin', message:''})
)

//Route to Admin page for Legacy to search by serial number
app.get ('/cardAdminSN', ensureCardAuthenticated, (req,res) =>
    res.render('pages/cardAdminSN', {banner: 'Legacy Admin', message:''})
)

// Login Legacy
app.post('/cardLogin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/cardAdmin',
        failureRedirect: '/cardLogin',
        failureFlash: true
    })(req, res, next)
})
  
// Logout Legacy
app.get('/cardLogout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/cardLogin')
})

//Register for Admin Pages
app.get('/userRegister', forwardAuthenticated, (req, res) => res.render('pages/userRegister', { banner: 'New User', message:''}))

// Register
app.post('/userRegister', (req, res) => {
    const { nameFirst, nameLast, email, password, password2 } = req.body
    let errors = []
  
    if (!nameFirst || !nameLast || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' })
    }
  
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' })
    }
  
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' })
    }
  
    if (errors.length > 0) {
        res.render('pages/userRegister', {
            banner:'',
            message:'',
            errors,
            nameFirst,
            nameLast,
            email,
            password,
            password2
        })
    } else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                errors.push({ msg: 'Email already exists' })
                res.render('pages/userRegister', {
                    banner:'',
                    message:'',
                    errors,
                    nameFirst,
                    nameLast,
                    email,
                    password,
                    password2
                })
            } else {
                var token = "No"  
                const newUser = new User({
                    nameFirst,
                    nameLast,
                    email,
                    password,
                    token
                })
    
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        newUser.password = hash
                        newUser.save()
                        .then(user => {
                            req.flash(
                                'success_msg',
                                'You have registered. Please wait for approval'
                            )
                            res.redirect('/partLogin')
                        })
                        .catch(err => console.log(err))
                    })
                })
            }
        })
    }
})

//Route to update password in user database
app.get('/userEdit', forwardAuthenticated, (req, res) => 
    res.render('pages/userEdit', {banner: 'User Admin', message: ''})
)

//Route to save New Password
app.post('/userUpdate', function(req,res){
    const { email, password, password2, password3 } = req.body
    let errors = []
  
    if (!email || !password || !password2 || !password3) {
        errors.push({ msg: 'Please enter all fields' })
    }

    if (password == password2) {
        errors.push({ msg: 'New password can not be the same as old' })
    }
  
    if (password2 != password3) {
        errors.push({ msg: 'Passwords do not match' })
    }
  
    if (password2.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' })
    }
  
    if (errors.length > 0) {
        res.render('pages/userEdit', {
            banner:'',
            message:'',
            errors,
            email,
            password,
            password2,
            password3
        })
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password2, salt, (err, hash) => {
            if (err) throw err
            passwordh = hash 
                
            User.findOneAndUpdate({ email: email }, { password: passwordh }, { new: true}, 
                function (err, docs) {
                    if (docs == null){ 
                        res.render('pages/userEdit', {banner: '', addedit, message:'Did not update password'}) 
                    }
                }).then(user => {
                    req.flash(
                        'success_msg',
                        'You have updated your password'
                    )
                    res.redirect('/userEdit')
                })
                .catch(err => console.log(err))
            })
        })
    }
})

//Port that the app sends to
app.listen(process.env.PORT || 5000);
