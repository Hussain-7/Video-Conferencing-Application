const isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // req.flash("error", "You need to be Logged In First!!");
  res.redirect("/login");
};
const alreadylogged = function (req, res, next) {
  if (req.user) {
    // req.flash("error", "Logout first to do that!!");
    res.redirect("/dashboard");
  } else {
    return next();
  }
};

module.exports = { alreadylogged, isLoggedIn };
