module.exports = {
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('pages/home')     
  },
  ensurePartAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Please log in to view that resource')
    res.redirect('/partLogin')
  },
  forwardPartAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('/partAdmin')     
  },
  ensureCardAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Please log in to view that resource')
    res.redirect('/cardLogin')
  },
  forwardCardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('/cardAdmin')     
  }
}