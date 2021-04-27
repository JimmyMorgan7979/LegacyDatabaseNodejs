var express = require('express')
var app = express()
const path = require('path')
const expressLayouts = require('express-ejs-layouts')

// the following allows you to serve static files
app.use('/static', express.static(path.join(__dirname, 'public')))

//SETS THE VIEW ENGINE 
app.use(expressLayouts)
app.set('view engine','ejs');
app.set('layout', 'pages/layout');

////////////////////////////////////// Cards Route Code //////////////////////////////////////  

// Route for "LEGACY SEARCH"
app.get('/', function(req,res){
    res.render('pages/newSiteHome',{banner: "New Site", message: ""});
})

//Port that the app sends to
app.listen(process.env.PORT || 5000);
