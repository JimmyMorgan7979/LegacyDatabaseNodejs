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
    res.redirect('/loginPart')
  },
  forwardPartAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('pages/partAdmin')     
  },
  ensureCardAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Please log in to view that resource')
    res.redirect('/loginCard')
  },
  forwardCardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('pages/cardAdmin')     
  }
}