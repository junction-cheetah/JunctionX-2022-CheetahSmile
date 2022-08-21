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
var notReady = true;
var accessUserNumber = 0;

const boxHeight = 1; // 각 박스의 높이
const originalBoxSize = 3; // 처음 박스의 시작 크기

var initialGameState = {
  stack: [],
  nowUser: "",
  nowUserIndex: 0,
  timeMicroSec: 0,
  isGaming: false,
  topLayer: {
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    width: 0,
    depth: 0,
    turn: 1,
    direction: "x",
  },
  speed: 0.006,
  cameraHeight: 4,
};

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

var gameState = deepCopy(initialGameState);

function setGameState(updateObject) {
  gameState = { ...gameState, updateObject };
}

function setTopLayer(updateObject) {
  gameState.topLayer = { ...gameState.topLayer, ...updateObject };
  console.log("TOPLAYER");
}

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.broadcast.emit("hi");
  accessUserNumber++;

  socket.on("disconnect", () => {
    console.log("user disconnected");
    accessUserNumber--;
    if (accessUserNumber == 0) {
      init(true);
    }
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
    console.log("STACK");
    // changeNowUser();
    makeStack();
  });

  // All in Server

  socket.on("dispatchEventPropagation", (data) => {
    console.log("Event");
    io.emit("receiveEventPropagation", data);
  });

  socket.on("init", (forced = false) => {
    console.log("INIT");
    init(forced);
  });

  function init(forced) {
    if (forced || notReady) {
      gameState = deepCopy(initialGameState);
      addLayer(0, 0, originalBoxSize, originalBoxSize);
      setTopLayer(addLayer(-10, 0, originalBoxSize, originalBoxSize, "x"));
    }
  }
  socket.on("start", (data) => {
    console.log("START");
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
    console.log("Set GAME STATE");
    gameState = { ...gameState, ...newGameState };
  });

  function tick() {
    try {
      gameState.isGaming = true;
      clock();
      setTurn();
      animation();
    } catch (e) {
      console.log(e);
      init(true);
    }
  }

  function clock() {
    prevTimeMicroSec = timeMicroSec++;
  }

  function setTurn() {
    const topLayer = gameState.topLayer;
    if (Math.abs(topLayer.position[topLayer.direction]) > 10)
      gameState.topLayer.turn *= -1;
  }

  function animation() {
    const timeScale = 1;

    topLayerObject = gameState.topLayer;
    const stack = gameState.stack;
    const speed = gameState.speed;

    const turn = gameState.topLayer.turn;
    // console.log("TURN : "+turn )
    if (gameState.isGaming) {
      // console.log(speed * timeScale * turn);
      gameState.topLayer.position[topLayerObject.direction] +=
        speed * timeScale * turn;
    }

    if (gameState.cameraHeight < boxHeight * (stack.length - 2) + 4) {
      gameState.cameraHeight += speed * timeScale;
    }
  }

  //오토파일럿 로직 자동 계산
  function makeStack() {
    if (!gameState.isGaming) return;

    const stack = gameState.stack;
    const topLayer = gameState.topLayer;

    const previousLayer = stack[stack.length - 2];

    const direction = topLayer.direction;

    const size = direction == "x" ? topLayer.width : topLayer.depth;

    if (!previousLayer) return;
    const delta =
      topLayer.position[direction] - previousLayer.position[direction];
    const overhangSize = Math.abs(delta);
    const overlap = size - overhangSize;

    if (overlap > 0) {
      cutBox(topLayer, overlap, size, delta);

      const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
      const overhangX =
        direction == "x"
          ? topLayer.position.x + overhangShift
          : topLayer.position.x;
      const overhangZ =
        direction == "z"
          ? topLayer.position.z + overhangShift
          : topLayer.position.z;
      const overhangWidth = direction == "x" ? overhangSize : topLayer.width;
      const overhangDepth = direction == "z" ? overhangSize : topLayer.depth;

      addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

      // Next layer
      const nextX = direction == "x" ? topLayer.position.x : -10;
      const nextZ = direction == "z" ? topLayer.position.z : -10;
      const newWidth = topLayer.width; // New layer has the same size as the cut top layer
      const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
      const nextDirection = direction == "x" ? "z" : "x";

      addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    } else {
      endGame();
    }
  }

  function addLayer(nextX, nextZ, newWidth, newDepth, nextDirection = "z") {
    console.log("ADD LAYER");
    const y = boxHeight * gameState.stack.length; // 박스 높이 * 스택 갯수

    const layer = {
      position: { x: nextX, y: y, z: nextZ },
      scale: { x: 1, y: 1, z: 1 },
      width: newWidth,
      depth: newDepth,
      direction: nextDirection,
    }; //현재 레이어에 넣는 새로운 박스 만들기
    gameState.stack.push(layer);
    setTopLayer(layer);
    io.emit("addLayer", {
      x: nextX,
      y: y,
      z: nextZ,
      scale: { x: 1, y: 1, z: 1 },
      width: newWidth,
      depth: newDepth,
      direction: nextDirection,
    });
    return layer;
  }

  function cutBox(topLayer, overlap, size, delta) {
    const direction = topLayer.direction;
    const newWidth = direction == "x" ? overlap : topLayer.width;
    const newDepth = direction == "z" ? overlap : topLayer.depth;

    // Update metadata


    // setTopLayer({
    //   width: newWidth,
    //   depth : newDepth,
    //   position: {

    //   };
    // })
    gameState.topLayer.width = newWidth;
    gameState.topLayer.depth = newDepth;
    gameState.topLayer.position[direction] -= delta / 2;

    gameState.topLayer.scale[direction] = overlap / size;

    console.log(overlap / size)

    topLayer = gameState.topLayer;
    setTopLayer(topLayer)
    gameState.topLayer = deepCopy(topLayer);
    gameState.stack[gameState.stack.length-1]  = deepCopy(topLayer)

    io.emit("cutBox", { topLayer, overlap, size, delta });
  }

  function addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth) {
    const y = boxHeight * (gameState.stack.length - 1); // 박스 높이 * 스택 갯수

    io.emit("addOverhang", {
      overhangX,
      y,
      overhangZ,
      overhangWidth,
      overhangDepth,
    });
  }

  function endGame() {
    clearInterval(timerId);
    timeMicroSec = 0;
    gameState.stack.pop();
    gameState.isGaming = false;
    io.emit("end");
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
