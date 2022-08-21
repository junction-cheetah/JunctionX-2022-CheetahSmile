const socket = io("ws://15.164.221.178:8000/");

var timer = 0;
var myEmail = "dodo4114@naver.com";

var globalGameState = {};
var isMyTurn = globalGameState.nowUser == myEmail;

// var stack = globalGameState.stack;

var stack = [];
var topLayerObject;

var autopilot = true; //오토파일럿 처음부터 시작

socket.on("stacked", function (msg) {
  console.log("stacked");
  eventHandler();
});

const timerElement = document.getElementById("timer");
socket.on("timer", function (time) {
  timer = time;
  if (timerElement) timerElement.innerText = timer;
});

socket.on("started", function () {
  autopilot = false;
});
socket.on("end", function () {
  fireEndProcess();
});

function fireStack() {
  socket.emit("stack", {
    clientTime: timer,
  });
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

var fetchedTopLayerData;
socket.on("gameState", function (gameState) {
  globalGameState = gameState;
  fetchedTopLayerData = gameState.topLayer;
});

socket.on("cutBox", ({ topLayer, overlap, size, delta }) => {
  cutBox(topLayerObject, overlap, size, delta);
});
socket.on(
  "addOverhang",
  ({ overhangX, y, overhangZ, overhangWidth, overhangDepth }) => {
    console.log("ADD OVER HANG");
    addOverhang(overhangX, y, overhangZ, overhangWidth, overhangDepth);
  }
);
socket.on("addLayer", ({ x, y, z, width, depth, direction }) => {
  // console.log({ x, y, z, width, depth, direction });
  addLayer(x, y, z, width, depth, direction);
});

function setGameState(updateObject) {
  socket.emit("setGameState", updateObject);
}

function serverInit(forced = false) {
  socket.emit("init", forced);
}

window.focus(); // Capture keys right away (by default focus is on editor)

let camera, scene, renderer; // ThreeJS globals
let world; // CannonJs world
let lastTime; // 에니메이션의 마지막 끝난 시간
let overhangs; // 떨어질 박스들
let gameEnded = !globalGameState.isGaming; //게임끝
let robotPrecision; // 오토파일럿의 정확도
const boxHeight = 1; // 각 박스의 높이
const originalBoxSize = 3; // 처음 박스의 시작 크기
let speed = globalGameState.speed;
console.log(globalGameState);
let turn;

// 배경 비주얼관련 변수
let skyObjects;
let star = [];
let star1, star2, star3;
let skyW = 6.99;
let skyD = 12.9;
let starR = 0.7;
let mspeedX = 0.02;
let mspeedY = 0.02;
let turnRange = 10;
let boxStep;

// HTML에 보내는 스코어
const scoreElement = document.getElementById("score");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");

// 오토파일럿의 정확도를 파악하는 함수
function setRobotPrecision() {
  robotPrecision = Math.random() * 1 - 0.5;
}

//초기화 코드 셋업
init();

function init() {
  lastTime = 0; //게임 시간
  stack = []; // 스택 배열 만들기
  overhangs = []; // 떨어진 것들 배열 만들기

  setRobotPrecision(); // 오토파일럿의 정확도를 파악하는 함수

  if (world) {
    // CannonJS 초기화 전 게임에 있던 캐논 바디들 삭제
    while (world.bodies.length > 0) {
      world.remove(world.bodies[0]);
    }
  }
  // CannonJS 물리엔진 초기셋팅
  world = new CANNON.World();
  world.gravity.set(0, -20, 0); //박스 떨어지는 중력(밑으로y)
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40; //중력부여 횟수

  //ThreeJs 초기화 셋팅
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

  camera.position.set(4, 4, 4); //카메라 초기 위치

  camera.lookAt(0, 0, 0); //카메라 가운데 보기

  scene = new THREE.Scene();

  // addLayer(0, 0, 0, originalBoxSize, originalBoxSize);
  // addLayer(-10, boxHeight, 0, originalBoxSize, originalBoxSize, "x");

  // serverInit();

  //비주얼라이제이션 (조명 및 배경)
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
  scene.add(skyObjects);
  topLayerObject = stack[-1];
  console.log(stack);

  // ThreeJS 렌더러 초기설정
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  document.body.appendChild(renderer.domElement);
}

//처음시작하는 스테이지 - 게임 스타트 함수
function fireGameStart() {
  socket.emit("start");
  autopilot = false;
  lastTime = 0;
  overhangs = [];

  //게임 스타트시 HTML스코어 관련 초기화
  if (instructionsElement) instructionsElement.style.display = "none";
  if (resultsElement) resultsElement.style.display = "none";
  if (scoreElement) scoreElement.innerText = 0;

  if (world) {
    // CannonJS 초기화 전 게임에 있던 캐논 바디들 삭제
    while (world.bodies.length > 0) {
      world.remove(world.bodies[0]);
    }
  }

  //ThreeJS 씬에서 기존 게임에 있던 메쉬들 초기화
  if (scene) {
    // Remove every Mesh from the scene
    while (scene.children.find((c) => c.type == "Mesh")) {
      const mesh = scene.children.find((c) => c.type == "Mesh");
      scene.remove(mesh);
    }
    serverInit();
  }

  //카메라도 제일 밑에서 다시 시작
  if (camera) {
    // Reset camera positions
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    skyObjects.position.y = 0;
  }
}

//레이어 추가하는 함수 (x좌표, z좌표, 층고높이, 방향(x/z))
function addLayer(x, y, z, width, depth, direction) {
  const layer = generateBox(x, y, z, width, depth, false); //현재 레이어에 넣는 새로운 박스 만들기
  layer.direction = direction;
  stack.push(layer);
}

//바닥에 떨어지는 박스 (x,z방향, 너비, 층고높이)
function addOverhang(x, y, z, width, depth) {
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang); //오버행배열에 현재 오버행 박스 넣기
}

//박스 만들어내는 함수(좌표,너비,층고높이, 떨어지는지 유무)
function generateBox(x, y, z, width, depth, falls) {
  // ThreeJS 비주얼
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  const material = new THREE.MeshStandardMaterial({
    color: "#cdcdcd",
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // CannonJS 물리 떨어지는..
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
  );
  let mass = falls ? 5 : 0; //떨어지는지 유무로 박스에 질량 넣기
  mass *= width / originalBoxSize; // 현재 박스 비율로 질량 줄이기
  mass *= depth / originalBoxSize; // 현재 박스 비율로 질량 줄이기
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

//박스 자르는 함수(탑레이어,쌓인 박스크기, 잘릴 박스크기, 전보다 이동한 차이값)
function cutBox(topLayer, overlap, size, delta) {
  console.log(globalGameState);
  const previousLayerData =
    globalGameState.stack[globalGameState.stack.length - 2]; //전 레이어

  prevLayerObject = stack[stack.length - 2];
  var updateData = previousLayerData;
  console.log(updateData);
  if (prevLayerObject && updateData) {
    prevLayerObject.threejs.position.x = updateData.position.x;
    prevLayerObject.threejs.position.y = updateData.position.y;
    prevLayerObject.threejs.position.z = updateData.position.z;

    prevLayerObject.threejs.scale.x = updateData.scale.x;
    prevLayerObject.threejs.scale.y = updateData.scale.y;
    prevLayerObject.threejs.scale.z = updateData.scale.z;

    prevLayerObject.threejs.width = updateData.width;
    prevLayerObject.threejs.depth = updateData.depth;

    // topLayerObject.cannonjs.position["x"] = topLayerData.position.x;
    // topLayerObject.cannonjs.position["y"] = topLayerData.position.y;
    // topLayerObject.cannonjs.position["z"] = topLayerData.position.z;
    // topLayerObject.cannonjs.width = topLayerData.width;
    // topLayerObject.cannonjs.depth = topLayerData.depth;

    prevLayerObject.direction = updateData.direction;
  }
}

//게임 리트라이
function retry() {
  serverInit(true);
  fireGameStart();
  return;
}

//이벤트 들어왔을 때
window.addEventListener("mousedown", eventHandler);
window.addEventListener("touchstart", eventHandler);
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    //시작
    event.preventDefault();
    eventHandler();
    return;
  }
  if (event.key == "R" || event.key == "r") {
    //리트라이
    event.preventDefault();
    retry();
  }
});

//이벤트가 참일 때
function eventHandler() {
  if (autopilot) fireGameStart(); //오토파일럿이 참일때 게임 스타트
  else splitBlockAndAddNextOneIfOverlaps(); //아니면 오토파일럿 시작
}
//오토파일럿 로직 자동 계산
function splitBlockAndAddNextOneIfOverlaps() {
  if (!autopilot) {
    fireStack();
  }

  topLayerObject = stack[stack.length - 1];
  const previousLayer = stack[stack.length - 2];
  const direction = topLayerObject ? topLayerObject.direction : "x";
  const size = direction == "x" ? topLayerObject.width : topLayerObject.depth;
  const delta =
    topLayerObject.threejs.position[direction] -
    previousLayer.threejs.position[direction];
  const overhangSize = Math.abs(delta);
  const overlap = size - overhangSize;

  if (overlap > 0) {
    // addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

    // Next layer
    const nextX = direction == "x" ? topLayerObject.threejs.position.x : -10;
    const nextZ = direction == "z" ? topLayerObject.threejs.position.z : -10;
    const newWidth = topLayerObject.width; // New layer has the same size as the cut top layer
    const newDepth = topLayerObject.depth; // New layer has the same size as the cut top layer
    const nextDirection = direction == "x" ? "z" : "x";

    if (scoreElement) scoreElement.innerText = stack.length - 1;
    addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
  }
}

//쌓지 못하는 경우 - 게임 탈락 함수
function fireEndProcess() {
  topLayerObject = stack[stack.length - 1];
  // Turn to top layer into an overhang and let it fall down
  addOverhang(
    topLayerObject.threejs.position.x,
    topLayerObject.threejs.position.y,
    topLayerObject.threejs.position.z,
    topLayerObject.width,
    topLayerObject.depth
  );
  // world.remove(topLayerObject.cannonjs);
  scene.remove(topLayerObject.threejs);
  if (resultsElement && !autopilot) resultsElement.style.display = "flex";
}

function animation(time) {
  // console.log(camera)

  if (lastTime) {
    const timePassed = time - lastTime;
    topLayerObject = stack[stack.length - 1];

    const previousLayer = stack[stack.length - 2]; //전 레이어

    topLayerObject = stack[stack.length - 1];
    var topLayerData = fetchedTopLayerData;
    // console.log(fetchedTopLayerData);
    if (topLayerObject && topLayerData) {
      topLayerObject.threejs.position.x = topLayerData.position.x;
      topLayerObject.threejs.position.y = topLayerData.position.y;
      topLayerObject.threejs.position.z = topLayerData.position.z;

      topLayerObject.threejs.scale.x = topLayerData.scale.x;
      topLayerObject.threejs.scale.y = topLayerData.scale.y;
      topLayerObject.threejs.scale.z = topLayerData.scale.z;

      topLayerObject.threejs.width = topLayerData.width;
      topLayerObject.threejs.depth = topLayerData.depth;

      // topLayerObject.cannonjs.position["x"] = topLayerData.position.x;
      // topLayerObject.cannonjs.position["y"] = topLayerData.position.y;
      // topLayerObject.cannonjs.position["z"] = topLayerData.position.z;
      // topLayerObject.cannonjs.width = topLayerData.width;
      // topLayerObject.cannonjs.depth = topLayerData.depth;

      topLayerObject.direction = topLayerData.direction;
    }

    // The top level box should move if the game has not ended AND
    // it's either NOT in autopilot or it is in autopilot and the box did not yet reach the robot position
    // TODO
    const isMovedByAuto =
      false &&
      autopilot &&
      topLayerObject.threejs.position[topLayerObject.direction] <
        previousLayer.threejs.position[topLayerObject.direction] +
          robotPrecision;

    //
    if (isMovedByAuto) {
      // Keep the position visible on UI and the position in the model in sync

      turn = globalGameState.topLayer.turn;
      topLayerObject.threejs.position[topLayerObject.direction] +=
        speed * timePassed * turn;
      // topLayerObject.cannonjs.position[topLayerObject.direction] +=
      //   speed * timePassed * turn;
    } else {
      // If it shouldn't move then is it because the autopilot reached the correct position?
      // Because if so then next level is coming
      // TODO
      if (autopilot && false) {
        splitBlockAndAddNextOneIfOverlaps();
        setRobotPrecision();
      }
    }

    // 4 is the initial camera height
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
      if (autopilot) {
        camera.position.y += speed * timePassed;
        dispatchCameraPosition(camera.position.y);
        console.log("autopilot");
      } else {
        camera.position.y = globalGameState.cameraHeight;
      }
      skyObjects.position.y += speed * timePassed;
    }
    updatePhysics(timePassed);
  }
  renderer.render(scene, camera);
  updateStarsPosition();
  lastTime = time;
}

function updateStarsPosition() {
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
}

function updatePhysics(timePassed) {
  world.step(timePassed / 1000); // Step the physics world
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
