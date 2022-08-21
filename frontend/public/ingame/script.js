window.focus(); // Capture keys right away (by default focus is on editor)

let camera, scene, renderer; // ThreeJS globals
let world; // CannonJs world
let lastTime; // 에니메이션의 마지막 끝난 시간
let stack; // 위에 쌓이는 박스
let overhangs; // 떨어질 박스들
let autopilot; //오토파일럿
let gameEnded; //게임끝
let robotPrecision; // 오토파일럿의 정확도
let turn = 1; //박스 튕겨서 돌아오는 속도(방향값)
const boxHeight = 1; // 각 박스의 높이
const originalBoxSize = 3; // 처음 박스의 시작 크기

// 배경 비주얼관련 변수
let skyObjects;
let star = [];
let star1, star2, star3;
let skyW = 6.99;
let skyD = 12.9;
let starR = 0.7;
let mspeedX = 0.02;
let mspeedY = 0.02;
let moveSpeed = 0.05;

// HTML에 보내는 스코어
const scoreElement = document.getElementById('score');
const instructionsElement = document.getElementById('instructions');
const resultsElement = document.getElementById('results');

// 오토파일럿의 정확도를 파악하는 함수
function setRobotPrecision() {
  robotPrecision = Math.random() * 1 - 0.5;
}

//초기화 코드 셋업
init();

function init() {
  autopilot = true; //오토파일럿 처음부터 시작
  gameEnded = false; //게임끝 불린변수
  lastTime = 0; //게임 시간
  stack = []; // 스택 배열 만들기
  overhangs = []; // 떨어진 것들 배열 만들기
  setRobotPrecision(); // 오토파일럿의 정확도를 파악하는 함수

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

  // // If you want to use perspective camera instead, uncomment these lines
  // camera = new THREE.PerspectiveCamera(
  //   45, // field of view
  //   aspect, // aspect ratio
  //   1, // near plane
  //   100 // far plane
  // );

  camera.position.set(4, 4, 4); //카메라 초기 위치

  camera.lookAt(0, 0, 0); //카메라 가운데 보기

  scene = new THREE.Scene();

  // 바닥 처음 고정된 박스
  addLayer(0, 0, originalBoxSize, originalBoxSize);

  // 처음 쌓이는 레이어 1층(x축 -10 방향에서 리스폰)
  addLayer(-10, 0, originalBoxSize, originalBoxSize, 'x');

  //비주얼라이제이션 (조명 및 배경)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  ambientLight.castShadow = true;

  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 0);
  dirLight.castShadow = true;

  scene.add(dirLight);
  //Sky object
  skyObjects = new THREE.Group();
  //Texture
  const textureLoader = new THREE.TextureLoader();
  const starTexture = textureLoader.load('./textures/star.png');
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

  // ThreeJS 렌더러 초기설정
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.shadowMap.enabled = true;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  document.body.appendChild(renderer.domElement);
}

//처음시작하는 스테이지 - 게임 스타트 함수
function startGame() {
  //게임 스타트시 모든 게임 전역 변수 초기화
  autopilot = false;
  gameEnded = false;
  lastTime = 0;
  stack = [];
  overhangs = [];

  //게임 스타트시 HTML스코어 관련 초기화
  if (instructionsElement) instructionsElement.style.display = 'none';
  if (resultsElement) resultsElement.style.display = 'none';
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
    while (scene.children.find((c) => c.type == 'Mesh')) {
      const mesh = scene.children.find((c) => c.type == 'Mesh');
      scene.remove(mesh);
    }

    // 바닥 박스 고정
    addLayer(0, 0, originalBoxSize, originalBoxSize);

    // 처음 쌓이는 박스 (-10.1 x축으로)
    addLayer(-10.1, 0, originalBoxSize, originalBoxSize, 'x');
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
function addLayer(x, z, width, depth, direction) {
  const y = boxHeight * stack.length; // 박스 높이 * 스택 갯수
  const layer = generateBox(x, y, z, width, depth, false); //현재 레이어에 넣는 새로운 박스 만들기
  layer.direction = direction;
  stack.push(layer); //스택에 현재 레이어 넣기

}

//바닥에 떨어지는 박스 (x,z방향, 너비, 층고높이)
function addOverhang(x, z, width, depth) {
  const y = boxHeight * (stack.length - 1); // 박스 높이 * 스택 갯수(현재높이를 포함하지 않아 -1)
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang); //오버행배열에 현재 오버행 박스 넣기
}

//박스 만들어내는 함수(좌표,너비,층고높이, 떨어지는지 유무)
function generateBox(x, y, z, width, depth, falls) {
  const textureLoader = new THREE.TextureLoader();
  const textureCube3 = [
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/px.png'),
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/py.png'),
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/pz.png'),
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/nx.png'),
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/ny.png'),
    }),
    new THREE.MeshStandardMaterial({
      map: textureLoader.load('./textures/cube/PNG/nz.png'),
    }),
  ];
  textureCube3.minFilter = THREE.NearestFilter;
  // textureCube3.magFilter = THREE.NearestFilter

  // ThreeJS 비주얼
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  const material = new THREE.MeshStandardMaterial({
    color: '#cdcdcd',
  });
  const mesh = new THREE.Mesh(geometry, textureCube3);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

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
  const direction = topLayer.direction;
  const newWidth = direction == 'x' ? overlap : topLayer.width;
  const newDepth = direction == 'z' ? overlap : topLayer.depth;

  // Update metadata
  topLayer.width = newWidth;
  topLayer.depth = newDepth;

  // Update ThreeJS model
  topLayer.threejs.scale[direction] = overlap / size;
  topLayer.threejs.position[direction] -= delta / 2;

  // Update CannonJS model
  topLayer.cannonjs.position[direction] -= delta / 2;

  // CannonJS 잘릴 박스를 리사이즈할 수 없어서 새로운 박스로 대체
  const shape = new CANNON.Box(
    new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
  );
  topLayer.cannonjs.shapes = [];
  topLayer.cannonjs.addShape(shape);
}

//게임 리트라이
function retry(){
window.parent.postMessage(stack.length, 'https://cobuilding.vercel.app');
startGame();
return;
}

//이벤트 들어왔을 때
window.addEventListener('mousedown', eventHandler);
window.addEventListener('touchstart', eventHandler);
window.addEventListener('keydown', function (event) {
  if (event.key == ' ') {
    //시작
    event.preventDefault();
    eventHandler();
    return;
  }
  if (event.key == 'R' || event.key == 'r') {
    //리트라이
    event.preventDefault();
    retry();
  }
});

//이벤트가 참일 때
function eventHandler() {
  if (autopilot) startGame(); //오토파일럿이 참일때 게임 스타트
  else splitBlockAndAddNextOneIfOverlaps(); //아니면 오토파일럿 시작
}
//오토파일럿 로직 자동 계산
function splitBlockAndAddNextOneIfOverlaps() {
  if (gameEnded) return;

  const topLayer = stack[stack.length - 1];

  const previousLayer = stack[stack.length - 2];

  const direction = topLayer.direction;

  const size = direction == 'x' ? topLayer.width : topLayer.depth;

  const delta =
    topLayer.threejs.position[direction] -
    previousLayer.threejs.position[direction];
  const overhangSize = Math.abs(delta);
  const overlap = size - overhangSize;
  console.log(overlap);
  if (overlap > 0) {
    cutBox(topLayer, overlap, size, delta);

    // Overhang
    const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
    const overhangX =
      direction == 'x' ?
      topLayer.threejs.position.x + overhangShift :
      topLayer.threejs.position.x;
    const overhangZ =
      direction == 'z' ?
      topLayer.threejs.position.z + overhangShift :
      topLayer.threejs.position.z;
    const overhangWidth = direction == 'x' ? overhangSize : topLayer.width;
    const overhangDepth = direction == 'z' ? overhangSize : topLayer.depth;

    addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

    // Next layer
    const nextX = direction == 'x' ? topLayer.threejs.position.x : -10;
    const nextZ = direction == 'z' ? topLayer.threejs.position.z : -10;
    const newWidth = topLayer.width; // New layer has the same size as the cut top layer
    const newDepth = topLayer.depth; // New layer has the same size as the cut top layer
    const nextDirection = direction == 'x' ? 'z' : 'x';

    if (scoreElement) scoreElement.innerText = stack.length + " floor";
    addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
  } else {
    missedTheSpot();
  }
}

//쌓지 못하는 경우 - 게임 탈락 함수
function missedTheSpot() {
  const topLayer = stack[stack.length - 1]; //전에 탑레이어의 객체를 가져온다
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
  if (resultsElement && !autopilot) resultsElement.style.display = 'flex';
}

function animation(time) {
  if (lastTime) {
    const timePassed = time - lastTime; //델타타임
    const topLayer = stack[stack.length - 1];
    const speed = 0.007;

    const previousLayer = stack[stack.length - 2]; //전 레이어

    // The top level box should move if the game has not ended AND
    // it's either NOT in autopilot or it is in autopilot and the box did not yet reach the robot position
    const boxShouldMove = !gameEnded &&
      (!autopilot ||
        (autopilot &&
          topLayer.threejs.position[topLayer.direction] <
          previousLayer.threejs.position[topLayer.direction] +
          robotPrecision));

    //
    if (boxShouldMove) {
      // Keep the position visible on UI and the position in the model in sync
      topLayer.threejs.position[topLayer.direction] +=
        speed * timePassed * turn;
      topLayer.cannonjs.position[topLayer.direction] +=
        speed * timePassed * turn;

      if (topLayer.threejs.position[topLayer.direction] > 10) {
        // If the box went beyond the stack then show up the fail screen
        // missedTheSpot();
        turn *= -1;
      }
      if (topLayer.threejs.position[topLayer.direction] < -10) {
        // If the box went beyond the stack then show up the fail screen
        // missedTheSpot();
        turn *= -1;
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
      camera.position.y += speed * timePassed;
    }

    skyObjects.position.y += speed * timePassed;

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

window.addEventListener('resize', () => {
  // Adjust camera
  console.log('resize', window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;
  const width = 10;
  const height = width / aspect;

  camera.top = height / 2;
  camera.bottom = height / -2;

  // Reset renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});