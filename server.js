const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
var server = require("http").Server(app);
var io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");

// configrations
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
// Routes
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Backend User
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("RoomId : " + roomId + "\nUserId : " + userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
