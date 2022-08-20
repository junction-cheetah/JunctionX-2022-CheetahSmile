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

var users = [];

io.on("connect", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("hi");

  socket.on("connect", (username) => {
    console.log(username + "connected");
    users.push(username)
    socket.broadcast.emit("connect", username);
  });

  socket.on("disconnect", (username) => {
    console.log(username + "disconnected");
    users.splice(users.indexOf(username), 1)
    socket.broadcast.emit("disconnect", username);
  });
});
server.listen(8080, "0.0.0.0", () => {
  console.log("listening on *:8080");
});