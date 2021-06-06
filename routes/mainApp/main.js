let express = require("express"),
  router = express.Router();
const { isLoggedIn } = require("../../middleware/auth");
const { v4: uuidV4 } = require("uuid");

router.get("/", (req, res) => {
  res.redirect("login");
});

router.get("/dashboard", isLoggedIn, (req, res) => {
  console.log(req.user);
  res.render("dashboard");
});
router.get("/meeting/:meetingId", isLoggedIn, (req, res) => {
  res.render("room", {
    roomId: req.params.meetingId,
    // id: req.user?.id ? req.user.id : req.user._id,
    name: req.user?.displayName ? req.user.displayName : req.user?.name,
    email: req.user?.email ? req.user?.email : req.user?._json?.email,
    picture: req.user?._json?.picture,
  });
});

module.exports = router;
