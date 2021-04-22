var express = require('express')
var app = express()
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')

// the following allows you to serve static files
app.use('/static', express.static(path.join(__dirname, 'public')))

//Mongodb connection new 10-22-20
var mongoose = require('mongoose')
// var mongoDB ='mongodb://10.83.93.60:27017/inventory'
// var mongoDB ='mongodb://localhost:27017/Inventory'
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

// Passport Config
require('./config/passport')(passport)

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

////////////////////////////////////// Routes Code //////////////////////////////////////  

app.use('/', require('./routes/card.js'))
app.use('/cardLogin', require('./routes/cardUser.js'))
app.use('/partHome', require('./routes/part.js'))
app.use('/partLogin', require('./routes/partUser.js'))
app.use('/partRequest', require('./routes/reqPart.js'))

//Port that the app sends to
app.listen(process.env.PORT || 5000)