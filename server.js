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

//Routes
app.use(authRoutes);
app.use(googleAuthRoutes);
app.use(mainRoutes);

app.get("/:wrong-path", function (req, res) {
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
