function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/auth');
}

module.exports = ensureAuthenticated;
