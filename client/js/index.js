const socket = io();
const game = document.getElementById("game");
const result = document.getElementById("result");
const waiting_room = document.getElementById("waiting-room");
const game_room = document.getElementById("room");
const game_id = document.getElementById("game-id");
let room_;

document.getElementById("createRoom").addEventListener("click", () => {
  room_ = Math.random().toString(36).substring(7).toUpperCase();
  socket.emit("createRoom", room_);
});

document.getElementById("joinRoom").addEventListener("click", () => {
  room_ = document.getElementById("roomInput").value;
  socket.emit("joinRoom", room_);
});

document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    socket.emit("choice", room_, button.id);
    game.style.display = "none";
    document.getElementById("waiting-choice").style = "display:block";
  });
});

socket.on("roomCreated", (room) => {
  alert(`Room ${room} created. Share this code with your friend.`);
  waiting_room.style.display = "none";
  game_room.style.display = "block";
  game_id.innerText = "Room ID: " + room;
});

socket.on("roomJoined", (room) => {
  if (room == room_) {
    console.log(`Joined room ${room}.`);
    waiting_room.style.display = "none";
    game_room.style.display = "block";
    game_id.innerText = "Room ID: " + room;
  }
});

socket.on("gameStart", (room) => {
  if (room == room_) {
    console.log(`Room ${room} started.`);
    alert(`Game in room ${room} started.`);
    game.style.display = "block";
    document.getElementById("waiting-game").style = "display:none";
  }
});

socket.on("result", (message) => {
  document.getElementById("waiting-choice").style = "display:none";
  result.innerText = message;
});

socket.on("error", (message) => {
  alert(message);
});
