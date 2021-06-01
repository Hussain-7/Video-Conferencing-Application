const users = [];
//join user to chat
function userJoin(socketId, peerId, roomId, name, email, picture) {
  const user = { socketId, peerId, roomId, name, email, picture };
  users.push(user);
  console.log(users);
  return user;
}

function getCurrentUser(id, option) {
  if (option) {
    return users.find((user) => user.socketId === id);
  } else {
    return users.find((user) => user.peerId === id);
  }
}

//User Leaves Chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
