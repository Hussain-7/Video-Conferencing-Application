let express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io")(server),
  { ExpressPeerServer } = require("peer"),
  peerServer = ExpressPeerServer(server, {
    debug: true,
  });
(cors = require("cors")),
  (bodyParser = require("body-parser")),
  (passport = require("passport")),
  (session = require("express-session"));
(googleAuthRoutes = require("./routes/auth/userGoogleAuth")),
  (authRoutes = require("./routes/auth/userAuth")),
  (mainRoutes = require("./routes/mainApp/main")),
  (LocalStrategy = require("passport-local")),
  (User = require("./models/user")),
  (flash = require("express-flash")),
  ((methodOverride = require("method-override")),
  (mongoose = require("mongoose")));
formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
require("dotenv").config();
let mongoURI = process.env.MONGODBURI;
mongoose.connect(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true });

const initializePassport = require("./middleware/passport-config");
initializePassport(passport);

// configrations
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//This passes the req.user to every route no need to manually write currentUser:req.user in each route
app.use(function (req, res, next) {
  res.locals.Name = req.user?.displayName
    ? req.user.displayName
    : req.user?.name;
  res.locals.Email = req.user?.email ? req.user?.email : req.user?._json?.email;
  res.locals.Picture = req.user?._json?.picture;
  next();
});

//Routes
app.use(authRoutes);
app.use(googleAuthRoutes);
app.use(mainRoutes);

app.get("/:wrong-path", function (req, res) {
  res.redirect("/");
});

// Backend User
io.on("connection", (socket) => {
  socket.on("join-room", (peerId, RoomId, Name, Email, Picture) => {
    const user = userJoin(socket.id, peerId, RoomId, Name, Email, Picture);
    socket.join(user.roomId);
    socket.to(user.roomId).emit("user-connected", user.peerId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      const user = getCurrentUser(socket.id, true);
      io.to(user.roomId).emit(
        "createMessage",
        formatMessage(user.name, message)
      );
    });

    socket.on("getInfo", (check, Id, socketid) => {
      console.log("===============Getting Info=========");
      let user = {};
      if (!check) {
        user = getCurrentUser(Id, check);
      } else {
        user = getCurrentUser(socket.id, true);
      }
      console.log(user);
      console.log(check);
      console.log(socket.id);
      console.log(socketid);
      console.log("===============End Getting Info=========");
      io.to(socketid).emit("recieveInfo", user.name, user.profile);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(user.roomId).emit("user-disconnected", user.peerId);
    });
  });
});

server.listen(process.env.PORT || 3030);
