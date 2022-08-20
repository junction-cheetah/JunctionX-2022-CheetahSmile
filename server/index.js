const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

var timeMicroSec = 0;
var timerId;
var stack = [];
var accessUsers = [];
var nowUser = "";
var sessionId = "";
var teamName = "";

var initialGameState = {
  stack: stack,
  nowUser: "",
  nowUserIndex: 0,
  timeMicroSec: 0,
  isGaming: false,
};

var gameState = initialGameState;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("hi");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("start", (msg) => {
    if (!isGaming) {
      console.log("GAME START");
      io.emit("started", msg);
      gameState.isGaming = true;
      timerId = setInterval(() => {
        io.emit("timer", timeMicroSec++ / 1000);
      }, 1);
    }
  });

  socket.on("end", (msg) => {
    if (isGaming) {
      console.log("GAME END");
      io.emit("end", msg);
      gameState.isGaming = false;
      clearInterval(timerId);
      timeMicroSec = 0;s
    }
  });

  socket.on("stack", (msg) => {
    var newStack = { ...msg, serverTime: timeMicroSec / 1000 };
    changeNowUser();
    stack.push(newStack);
    console.log(stack);
    io.emit("stacked", { newStack, nowUser });
  });
});
server.listen(8000, "0.0.0.0", () => {
  console.log("listening on *:8000");
});

function changeNowUser() {
  gameState.nowUserIndex = Math.floor((nowUserIndex + 1) / accessUsers.length);
  gameState.nowUser = accessUsers[nowUserIndex];
}
