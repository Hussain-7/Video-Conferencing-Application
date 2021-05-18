var socket = io.connect("http://localhost:3030/");
const videoGrid = document.getElementById("video-grid");

var peer = new Peer();

let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

// get media input and output access from chrome
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log("Answering Call");
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

//Frontend User

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);

  socket.on("createMessage", (message) => {
    let chatlist = $(".messages");
    chatlist.append(`<li class="message"><b>username : </b>${message}</li>`);
    scrollToBottom();
  });
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    console.log(text.val());
    text.val("");
  }
});

const scrollToBottom = () => {
  console.log("in scroll bottom");
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};
