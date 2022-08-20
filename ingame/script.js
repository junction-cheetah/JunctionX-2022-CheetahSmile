const socket = io("ws://15.164.221.178:8000/");

var timer = 0;
var myEmail = "dodo4114@naver.com";

var globalGameState = {};
var isMyTurn = globalGameState.nowUser == myEmail;

var fetchedTopLayerData = globalGameState.topLayer;
var fecthedCameraPosition = globalGameState.cameraHeight;
var stack = globalGameState.stack;
var topLayer;

socket.on("stacked", function (msg) {
  console.log("stacked");
  eventHandler(false);
});

const timerElement = document.getElementById("timer");
socket.on("timer", function (time) {
  timer = time;
  if (timerElement) timerElement.innerText = timer;
});

socket.on("started", function () {
  startGame(false);
});

socket.on("topLayerReceive", function (topLayerData) {
  fetchedTopLayerData = topLayerData;
});
socket.on("cameraHeightReceive", function (cameraHeight) {
  fecthedCameraPosition = cameraHeight;
});

function onStack() {
  socket.emit("stack", {
    clientTime: timer,
  });
}

function onStart() {
  console.log("START");
  socket.emit("start", "");
}

function onEnd() {
  console.log("END");
  socket.emit("end", "");
}

function dispatchNewLayer(newLayerData) {
  socket.emit("newLayer", newLayerData);
}

function dispatchToplayer(topLayerData) {
  socket.emit("topLayer", topLayerData);
}

function dispatchCameraPosition(height) {
  socket.emit("cameraHeight", height);
}

function dispatchCameraPosition(eventName, eventBody) {
  socket.emit("dispatchEventPropagation", {
    name: eventName,
    body: eventBody,
  });
}

socket.on("receiveEventPropagation", function (data) {
  var eventName = data.name;
  var eventBody = data.body;
  if (eventName == "exampleEvent") {
    // do something
  }
});

socket.on("gameState", function (gameState) {
  globalGameState = gameState;
  if (topLayer) fetchTopLayer(topLayer, gameState.topLayer);
});

function setGameState(updateObject) {
  socket.emit("setGameState", updateObject);
}


function fetchTopLayer(topLayerObject, topLayerData) {
  topLayerObject.threejs.position = topLayerData.position;
  topLayerObject.threejs.width = topLayerData.width;
  topLayerObject.threejs.depth = topLayerData.depth;

  topLayerObject.cannonjs.position.x = topLayerData.position.x;
  topLayerObject.cannonjs.position.y = topLayerData.position.y;
  topLayerObject.cannonjs.position.z = topLayerData.position.z;
  topLayerObject.cannonjs.width = topLayerData.width;
  topLayerObject.cannonjs.depth = topLayerData.depth;

  topLayerObject.direction = topLayerData.direction;
}

window.focus(); // Capture keys right away (by default focus is on editor)

let camera, scene, renderer; // ThreeJS globals
let world; // CannonJs world
let lastTime; // Last timestamp of animation
let stack; // Parts that stay solid on top of each other
let overhangs; // Overhanging parts that fall down
const boxHeight = 1; // Height of each layer
const originalBoxSize = 3; // Original width and height of a box
let autopilot;
let gameEnded;
let robotPrecision; // Determines how precise the game is on autopilot
let skyObjects;
let star = [];
let star1, star2, star3;
let skyW = 6.99;
let skyD = 12.9;
let starR = 0.7;
let mspeedX = 0.02;
let mspeedY = 0.02;
let speed = globalGameState.topLayer.speed;
let turn = globalGameState.topLayer.turn;
let turnRange = 10;
let boxStep;

const scoreElement = document.getElementById("score");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");

init();

// Determines how precise the game is on autopilot
function setRobotPrecision() {
  robotPrecision = Math.random() * 1 - 0.5;
}

function init() {
  autopilot = true;
  gameEnded = false;
  lastTime = 0;
  stack = [];
  overhangs = [];
  setRobotPrecision();

  // Initialize CannonJS
  world = new CANNON.World();
  world.gravity.set(0, -20, 0); // Gravity pulls things down
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;

  // Initialize ThreeJs
  const aspect = window.innerWidth / window.innerHeight;
  const width = 5;
  const height = width / aspect;

  camera = new THREE.OrthographicCamera(
    width / -2, // left
    width / 2, // right
    height / 2, // top
    height / -2, // bottom
    0, // near plane
    100 // far plane
  );

  // // If you want to use perspective camera instead, uncomment these lines
  // camera = new THREE.PerspectiveCamera(
  //   45, // field of view
  //   aspect, // aspect ratio
  //   1, // near plane
  //   100 // far plane
  // );

  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  // Foundation
  addLayer(0, 0, originalBoxSize, originalBoxSize);

  // First layer
  addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");

  // Set up lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 0);
  scene.add(dirLight);

  //Sky object
  skyObjects = new THREE.Group();

  //Texture
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load("/textures/star.png");

  for (let i = 1; i < 4; i++) {
    star[i] = new THREE.Mesh(
      new THREE.PlaneGeometry(starR, starR),
      new THREE.MeshStandardMaterial({
        map: starTexture,
        side: THREE.DoubleSide,
        transparent: true,
      })
    );
    star[i].position.set(0, i - 2, i - 2);
    skyObjects.add(star[i]);
  }
  // const plane = new THREE.Mesh(
  //   new THREE.PlaneGeometry(skyW, skyD),
  //   new THREE.MeshBasicMaterial({
  //     wireframe: true,
  //     side: THREE.DoubleSide,
  //   })
  // );
  // // plane.rotation.x = Math.PI / 2;
  // skyObjects.add(plane);
  scene.add(skyObjects);

  // Set up renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  document.body.appendChild(renderer.domElement);
}

//처음시작하는 스테이지 - 게임 스타트 함수
function startGame(isOriginal = true) {
  if (isOriginal) {
    onStart();
  }

  autopilot = false;
  gameEnded = false;
  lastTime = 0;
  stack = [];
  overhangs = [];

  if (instructionsElement) instructionsElement.style.display = "none";
  if (resultsElement) resultsElement.style.display = "none";
  if (scoreElement) scoreElement.innerText = 0;

  if (world) {
    // Remove every object from world
    while (world.bodies.length > 0) {
      world.remove(world.bodies[0]);
    }
  }

  //씬에서 기존 게임에 있던 메쉬들 초기화
  if (scene) {
    // Remove every Mesh from the scene
    while (scene.children.find((c) => c.type == "Mesh")) {
      const mesh = scene.children.find((c) => c.type == "Mesh");
      scene.remove(mesh);
    }

    // Foundation
    addLayer(0, 0, originalBoxSize, originalBoxSize);

    // First layer
    addLayer(-10.1, 0, originalBoxSize, originalBoxSize, "x");
  }

  //카메라도 제일 밑에서 다시 시작
  if (camera) {
    // Reset camera positions
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    skyObjects.position.y = 0;
  }
}

//레이어 추가하는 함수
function addLayer(x, z, width, depth, direction) {
  const y = boxHeight * stack.length; // Add the new box one layer higher
  const layer = generateBox(x, y, z, width, depth, false);
  layer.direction = direction;
  stack.push(layer);
  dispatchNewLayer({
    position: {
      x: x,
      z: z,
    },
    width: width,
    depth: depth,
  });
}

function addOverhang(x, z, width, depth) {
  const y = boxHeight * (stack.length - 1); // Add the new box one the same layer
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang);
}

//박스 만들어내는 함수
function generateBox(x, y, z, width, depth, falls) {
  // ThreeJS
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  // const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshStandardMaterial({
    color: "#cdcdcd",
  });
  material.wireframeLinewidth = 10.0;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // CannonJS
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
  );
  let mass = falls ? 5 : 0; // If it shouldn't fall then setting the mass to zero will keep it stationary
  mass *= width / originalBoxSize; // Reduce mass proportionately by size
  mass *= depth / originalBoxSize; // Reduce mass proportionately by size
  const body = new CANNON.Body({
    mass,
    shape,
  });
  body.position.set(x, y, z);
  world.addBody(body);

  return {
    threejs: mesh,
    cannonjs: body,
    width,
    depth,
  };
}

//박스 자르는 함수
function cutBox(topLayer, overlap, size, delta) {
  const direction = topLayer.direction;
  const newWidth = direction == "x" ? overlap : topLayer.width;
  const newDepth = direction == "z" ? overlap : topLayer.depth;

  // Update metadata
  topLayer.width = newWidth;
  topLayer.depth = newDepth;

  // Update ThreeJS model
  topLayer.threejs.scale[direction] = overlap / size;
  topLayer.threejs.position[direction] -= delta / 2;

  // Update CannonJS model
  topLayer.cannonjs.position[direction] -= delta / 2;

  // Replace shape to a smaller one (in CannonJS you can't simply just scale a shape)
  const shape = new CANNON.Box(
    new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
  );
  topLayer.cannonjs.shapes = [];
  topLayer.cannonjs.addShape(shape);
}

//게임 리트라이
function retry() {
  startGame();
  return;
}

window.addEventListener("mousedown", eventHandler);
window.addEventListener("touchstart", eventHandler);
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    eventHandler();
    return;
  }
  if (event.key == "R" || event.key == "r") {
    event.preventDefault();
    retry();
  }
});

function eventHandler(isOrigin = true) {
  if (autopilot) startGame();
  else splitBlockAndAddNextOneIfOverlaps(isOrigin);
}


function splitBlockAndAddNextOneIfOverlaps(isOrigin = true) {
  if (gameEnded) return;

  if (isOrigin) {
    onStack();
  }

  if (isMyTurn && !isOrigin) {
    return;
  }
  console.log("NEXT-splited");

  topLayer = stack[stack.length - 1];

  const previousLayer = stack[stack.length - 2];

  const direction = topLayer.direction;

  const size = direction == "x" ? topLayer.width : topLayer.depth;

  if (!isMyTurn) {
    fetchTopLayer(topLayer);
  }
  const delta =
    topLayer.threejs.position[direction] -
    previousLayer.threejs.position[direction];
  const overhangSize = Math.abs(delta);
  const overlap = size - overhangSize;
  console.log(overlap);
  if (overlap > 0 || !isOrigin) {
    cutBox(topLayer, overlap, size, delta);

    // Overhang
    const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
    const overhangX =
      direction == "x"
        ? topLayer.threejs.position.x + overhangShift
        : topLayer.threejs.position.x;
    const overhangZ =
      direction == "z"
        ? topLayer.threejs.position.z + overhangShift
        : topLayer.threejs.position.z;
    const overhangWidth = direction == "x" ? overhangSize : topLayer.width;
    const overhangDepth = direction == "z" ? overhangSize : topLayer.depth;

    addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

    // Next layer
    const nextX = direction == "x" ? topLayer.threejs.position.x : -10;
    const nextZ = direction == "z" ? topLayer.threejs.position.z : -10;
    const newWidth = topLayer.width; // New layer has the same size as the cut top layer
    const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
    const nextDirection = direction == "x" ? "z" : "x";

    if (scoreElement) scoreElement.innerText = stack.length - 1;
    addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    boxStep = newWidth;
  } else {
    missedTheSpot(isOrigin);
  }
}

//쌓지 못하는 경우 - 게임 탈락 함수
function missedTheSpot(isOrigin = true) {
  if (isOrigin) {
    onEnd();
  }

  topLayer = stack[stack.length - 1];
  // Turn to top layer into an overhang and let it fall down
  addOverhang(
    topLayer.threejs.position.x,
    topLayer.threejs.position.z,
    topLayer.width,
    topLayer.depth
  );
  world.remove(topLayer.cannonjs);
  scene.remove(topLayer.threejs);

  gameEnded = true;
  if (resultsElement && !autopilot) resultsElement.style.display = "flex";
}
const clock = new THREE.Clock();

function animation(time) {
  delta = clock.getDelta();

  if (lastTime) {
    const timePassed = time - lastTime;
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
          speed * timePassed * turn;
        topLayer.cannonjs.position[topLayer.direction] +=
          speed * timePassed * turn;
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
        camera.position.y += speed * timePassed;
        dispatchCameraPosition(camera.position.y);
      } else {
        camera.position.y = fecthedCameraPosition;
      }
      skyObjects.position.y += speed * timePassed;
    }
    updatePhysics(timePassed);
    renderer.render(scene, camera);
  }
  for (let i = 1; i < 4; i++) {
    if (i == 1) {
      star[i].position.x += mspeedX;
      star[i].position.y += mspeedX;
    }
    if (i == 2) {
      star[i].position.x += mspeedX;
      star[i].position.y += -mspeedX;
    }
    if (i == 3) {
      star[i].position.x += -mspeedX;
      star[i].position.y += -mspeedX;
    }
    star[i].rotation.z += 0.01;

    if (
      star[i].position.x > skyW / 2 - starR ||
      star[i].position.x < -skyW / 2 + starR
    ) {
      mspeedX *= -1;
    }
    if (
      star[i].position.y < -skyD / 2 + starR ||
      star[i].position.y > skyD / 2 - starR
    ) {
      mspeedY *= -1;
    }
  }
  skyObjects.rotation.y = Math.PI * 1.25;
  lastTime = time;
}

function updatePhysics(timePassed) {
  world.step(timePassed / 1000); // Step the physics world

  // Copy coordinates from Cannon.js to Three.js
  overhangs.forEach((element) => {
    element.threejs.position.copy(element.cannonjs.position);
    element.threejs.quaternion.copy(element.cannonjs.quaternion);
  });
}

window.addEventListener("resize", () => {
  // Adjust camera
  console.log("resize", window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;
  const width = 10;
  const height = width / aspect;

  camera.top = height / 2;
  camera.bottom = height / -2;

  // Reset renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
