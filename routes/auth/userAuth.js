const express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  User = require("../../models/user"),
  bcrypt = require("bcrypt"),
  LocalStrategy = require("passport-local");

const { alreadylogged } = require("../../middleware/auth");

router.get("/login", alreadylogged, function (req, res) {
  console.log(req.user);
  res.render("login");
});

//User Sign up page get request.
router.get("/register", alreadylogged, function (req, res) {
  res.render("register");
});

//User Sign up Logic for registering users.
router.post("/register", async (req, res) => {
  try {
    const alreadyExistingUser = await User.findOne({ email: req.body.email });
    if (alreadyExistingUser) return res.redirect("/register");
    console.log(alreadyExistingUser);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    delete req.body["password"];
    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    res.redirect("/dashboard");
  } catch (err) {
    res.status(404).json({
      error: err.message,
    });
  }
});

//User Login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

//User Logout logic
router.delete("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
