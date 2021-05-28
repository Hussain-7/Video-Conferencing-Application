const express = require("express");
const app = express();

var server = require("http").Server(app);
var io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { isLoggedIn } = require("./auth/middleware");
require("./auth/passportSetup");

const { v4: uuidV4 } = require("uuid");

// configrations
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.json());
app.use(
  cookieSession({
    name: "zoom-session",
    keys: ["key1", "key2"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

//Google Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", (req, res) => {
  res.redirect(`/meeting/${uuidV4()}`);
});
app.get("/meeting/:meetingId", isLoggedIn, (req, res) => {
  console.log(req.user);
  res.render("room", {
    roomId: req.params.meetingId,
    name: req.user.displayName,
  });
});
app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});
// Backend User
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
