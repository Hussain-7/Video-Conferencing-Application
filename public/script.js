var socket = io.connect("/");
const videoGrid = document.getElementById("video-grid");
var peer = new Peer();
let setmyvideo = false;
let myVideoStream;

const myVideo = document.createElement("video");
const videoContainer = document.createElement("div");
const span = document.createElement("span");

myVideo.muted = true;
const peers = {};
let leaveChat = () => {};
// get media input and output access from chrome
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    console.log("=======Add video Stream 1=============");
    setmyvideo = false;
    addVideoStream(true, socket.id, span, myVideo, videoContainer, stream);
    console.log("printing(own SocketId):" + socket.id);
    peer.on("call", (call) => {
      console.log(call);
      call.answer(stream);
      const video = document.createElement("video");
      const uservideoContainer = document.createElement("div");
      const userspan = document.createElement("span");
      call.on("stream", (userVideoStream) => {
        console.log("=======Add video Stream 2=============");
        console.log("printing(peerId):" + call.peer);
        addVideoStream(
          false,
          call.peer,
          userspan,
          video,
          uservideoContainer,
          userVideoStream
        );
      });
    });
    socket.on("user-connected", (userId) => {
      console.log("Listenning for user Connected");
      connectToNewUser(userId, stream);
    });
    socket.on("createMessage", (message) => {
      outputMessage(message);
      scrollToBottom();
    });
  });
peer.on("open", (id) => {
  socket.emit("join-room", id, RoomId, Name, Email, Picture);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

socket.on("leaveChat", (id) => {
  console.log("in user left chat");
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  const videoContainer = document.createElement("div");
  const span = document.createElement("span");

  call.on("stream", (userVideoStream) => {
    console.log("=======Add video Stream 3=============");
    console.log("printing(peerId):" + userId);
    addVideoStream(false, userId, span, video, videoContainer, userVideoStream);
  });
  call.on("close", () => {
    videoContainer.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (check, id, span, video, videoContainer, stream) => {
  console.log("in add video stream!!");
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  console.log("before create video stream");
  // createVideoContainer(check, id, span, video, videoContainer);
  socket.emit("getInfo", check, id, socket.id);
  socket.once("recieveInfo", (name, profile) => {
    console.log("========Inside receive Info===========");
    console.log(name);
    span.innerHTML = name;
    span.classList.add("videofooter");
    videoContainer.append(span);
    videoContainer.classList.add("video-container");
    videoContainer.append(video);
    videoGrid.append(videoContainer);
    let totalUsers = document.getElementsByClassName("video-container").length;
    console.log(totalUsers);
    let count = totalUsers;
    if (totalUsers > 1 && totalUsers < 7) count = 3;
    // if (totalUsers > 6 && totalUsers < 9) count = 4;
    // if (totalUsers > 8 && totalUsers < 11) count = 5;
    if (totalUsers > 10) count = 6;
    for (let index = 0; index < totalUsers; index++) {
      if (totalUsers == 1) {
        document.getElementsByClassName("video-container")[0].style.width =
          "50%";
      } else {
        document.getElementsByClassName("video-container")[index].style.width =
          (100 - count * 2) / count + "%";
        console.log(100 / count);
      }
    }
  });
  console.log("after create video stream");
};

function outputMessage(message) {
  // let chatlist = $(".messages");
  // chatlist.append(
  //   `<li class="message"><b>${message.name} : </b>${message.text} - ${message.time}</li>`
  // );
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.name;
  p.innerHTML += ` <span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector(".messages").appendChild(div);
}

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
function openChat() {
  if ($(window).width() > 1500) {
    document.getElementById("chat__container").style.width = "20%";
    document.getElementById("videoChatContainer").style.width = "80%";
  } else {
    document.getElementById("chat__container").style.width = "40%";
    document.getElementById("videoChatContainer").style.width = "60%";
  }
  document.getElementById("chat__container").style.display = "flex";
  document.getElementById("closebtn").style.display = "block";
}

function closeChat() {
  document.getElementById("chat__container").style.width = "0%";
  document.getElementById("videoChatContainer").style.width = "100%";
  document.getElementById("chat__container").style.display = "none";
  document.getElementById("closebtn").style.display = "none";
}
