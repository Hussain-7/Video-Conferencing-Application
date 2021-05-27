const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");

// configrations
app.use("/peerjs", peerServer);
app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes

app.get("/", (req, res) => {
  // res.redirect(`/${uuidV4()}`);
  res.render("landingPage");
});
app.get("/registerPage", (req, res)=> {
  res.render("registerPage");
})
app.get("/main", (req, res) => {
  res.render("main");
});
app.get("/meeting", (req, res) => {
  res.render("meeting");
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//Backend User
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
    socket.on("leave-chat", () => {
      io.to(roomId).emit("user-left-chat", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
