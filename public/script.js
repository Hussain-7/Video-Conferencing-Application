var socket = io("/");
const videoGrid = document.getElementById("video-grid");
const peer = new Peer();
// const peer = new Peer(undefined, {
//   path: "/peerjs",
//   host: "/",
//   port: "443",
// });
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

// get media input and output access from chrome
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
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
socket.on("createMessage", (message) => {
  let chatlist = $(".messages");
  chatlist.append(`<li class="message"><b>username : </b>${message}</li>`);
  scrollToBottom();
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

socket.on("user-left-chat", (userId) => {
  console.log("in user left chat");
  if (peers[userId]) peers[userId].close();
  window.location.replace(
    "http://localhost:3030/335a5b77-0724-4991-8889-9b37f4c899e1"
  );
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
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

const leaveChat = () => {
  socket.emit("leave-chat");
};

const scrollToBottom = () => {
  console.log("in scroll bottom");
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//Muting microphone functionality
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  console.log(myVideoStream.getAudioTracks()[0]);
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

//Changing muted and unmuted microphone
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

//Stop and playing video functionality
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Show Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
