const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const { forwardAuthenticated, ensureCardAuthenticated, forwardCardAuthenticated } = require('../config/auth')

// Load User model
const User = require('../models/User')

// Login Legacy Page
router.get('/', forwardCardAuthenticated, (req, res) => 
    res.render('pages/cardLogin', {banner: 'Parts Admin Login', message: ''})
)

// Route to Admin page for Legacy to search by board number
router.get ('/cardAdmin', ensureCardAuthenticated, (req,res) =>
    res.render('pages/cardAdmin', {banner: 'Legacy Admin', message:''})
)

// Route to Admin page for Legacy to search by serial number
router.get ('/cardAdminSN', ensureCardAuthenticated, (req,res) =>
    res.render('pages/cardAdminSN', {banner: 'Legacy Admin', message:''})
)

// Register Page
router.get('/userRegister', forwardAuthenticated, (req, res) => res.render('pages/userRegister', { banner: 'New User', message:''}))

// Register
router.post('/userRegister', (req, res) => {
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
                            res.redirect('/cardLogin')
                        })
                        .catch(err => console.log(err))
                    })
                })
            }
        })
    }
})

// Login Legacy
router.post('/cardLogin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/cardLogin/cardAdmin',
        failureRedirect: '/cardLogin',
        failureFlash: true
    })(req, res, next)
})
  
// Logout Legacy
router.get('/cardLogout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/cardLogin')
})

//Route to update password in user database
router.get('/userEdit', forwardAuthenticated, (req, res) => 
    res.render('pages/userEdit', {banner: 'User Admin', message: ''})
)

//Route to save New Password
router.post('/userUpdate', function(req,res){
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
                    res.redirect('userEdit')
                })
                .catch(err => console.log(err))
            })
        })
    }
})

module.exports = router