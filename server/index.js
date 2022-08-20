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
var prevTimeMicroSec = 0;
var timerId;
var lastState;
var accessUsers = [];
var nowUser = "";
var sessionId = "";
var teamName = "";

var initialGameState = {
  stack: [
    {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      width: 0,
      depth: 0,
    },
  ],
  nowUser: "",
  nowUserIndex: 0,
  timeMicroSec: 0,
  isGaming: false,
  topLayer: {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    width: 0,
    depth: 0,
    direction: 0,
    speed: 0.007,
    turn: 1,
  },
  cameraHeight: 4,
};

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

var gameState = deepCopy(initialGameState);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("hi");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("end", (msg) => {
    if (gameState.isGaming) {
      console.log("GAME END");
      io.emit("end", msg);
      gameState.isGaming = false;
      clearInterval(timerId);
      timeMicroSec = 0;
      lastState = deepCopy(gameState);
      gameState = deepCopy(initialGameState);
    }
  });

  socket.on("stack", (msg) => {
    var newStack = { ...msg, serverTime: timeMicroSec / 1000 };
    changeNowUser();
    gameState.stack.push(newStack);
    console.log(gameState.stack);
    io.emit("stacked", { newStack, nowUser, stack: gameState.stack });
  });
  socket.on("topLayer", (topLayer) => {
    gameState.topLayer = topLayer;
    io.emit("topLayerReceive", topLayer);
  });

  socket.on("cameraHeight", (cameraHeight) => {
    gameState.cameraHeight = cameraHeight;
    io.emit("cameraHeightReceive", cameraHeight);
  });

  // All in Server

  socket.on("dispatchEventPropagation", (data) => {
    io.emit("receiveEventPropagation", data);
  });

  socket.on("start", (data) => {
    makeGameStart(data);
  });

  // start game and continue propagate game state for all
  const makeGameStart = (msg) => {
    if (!gameState.isGaming) {
      console.log("GAME START");
      io.emit("started", msg);
      gameState.isGaming = true;
      timerId = setInterval(() => {
        io.emit("timer", timeMicroSec / 1000);
        tick();
        io.emit("gameState", gameState);
      }, 1);
    }
  };

  socket.on("setGameState", (newGameState) => {
    gameState = { ...gameState, ...newGameState };
  });

  function tick() {
    clock()
    setTurn();
    animation()
  }

  function clock(){
    prevTimeMicroSec = timeMicroSec++
  }

  function setTurn() {
    if (topLayer.position[topLayer.direction] > 10) topLayer.turn *= -1;
  }

  function animation(){

        const timeScale = 1
        topLayer = stack[stack.length - 1];

        const previousLayer = stack[stack.length - 2];

        // The top level box should move if the game has not ended AND
        // it's either NOT in autopilot or it is in autopilot and the box did not yet reach the robot position
        const boxShouldMove =
          !gameEnded &&
          (!autopilot ||
            (autopilot &&
              topLayer.threejs.position[topLayer.direction] <
                previousLayer.threejs.position[topLayer.direction] +
                  robotPrecision));

        if (boxShouldMove) {
          if (isMyTurn || autopilot) {
            // Keep the position visible on UI and the position in the model in sync
            topLayer.threejs.position[topLayer.direction] +=
              speed * timeScale * turn;
            topLayer.cannonjs.position[topLayer.direction] +=
              speed * timeScale * turn;
            if (isMyTurn && !autopilot) {
              dispatchToplayer({
                position: topLayer.threejs.position,
                width: topLayer.threejs.width,
                depth: topLayer.threejs.depth,
              });
              // dispatchToplayer({
              //   poistion: topLayer.threejs.position,
              //   width: topLayer.width,
              //   height: topLayer.depth,
              // });
            }
            // console.log(topLayer.threejs.position);
          } else {
            fetchTopLayer(topLayer);
            // topLayer.threejs.position = fetchedTopLayerPosition;
            // topLayer.cannonjs.position = fetchedTopLayerPosition;
          }
        } else {
          // If it shouldn't move then is it because the autopilot reached the correct position?
          // Because if so then next level is coming
          if (autopilot) {
            splitBlockAndAddNextOneIfOverlaps();
            setRobotPrecision();
          }
        }

        // 4 is the initial camera height
        if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
          if (isMyTurn || autopilot) {
            camera.position.y += speed * timeScale;
            dispatchCameraPosition(camera.position.y);
          } else {
            camera.position.y = fecthedCameraPosition;
          }
          skyObjects.position.y += speed * timeScale;
        }
        updatePhysics(timeScale);
        renderer.render(scene, camera);
      
  }
});

server.listen(8000, "0.0.0.0", () => {
  console.log("listening on *:8000");
});

function changeNowUser() {
  gameState.nowUserIndex = Math.floor(
    (gameState.nowUserIndex + 1) / accessUsers.length
  );
  gameState.nowUser = accessUsers[gameState.nowUserIndex];
}
