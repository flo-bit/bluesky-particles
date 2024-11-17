import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Particles } from "./particles";

const url =
  "wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&wantedCollections=app.bsky.feed.like&wantedCollections=app.bsky.graph.follow";

const width = window.innerWidth,
  height = window.innerHeight;

const canvas = document.getElementById("root");

if (!canvas) {
  throw new Error("Canvas not found");
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 30);
camera.position.set(0, 0, 2.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});

// basic tone mapping
renderer.toneMapping = THREE.LinearToneMapping;
renderer.shadowMap.enabled = true;

const _ = new OrbitControls(camera, renderer.domElement);

const particles = new Particles();
scene.add(particles);

let total = 0;
let last = 0;

renderer.setAnimationLoop((current) => {
  renderer.render(scene, camera);

  particles.update(current - last);

  last = current;

  //particles.spawn(Math.floor(Math.random() * 4) + 1);
});

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

updateSize();
window.addEventListener("resize", updateSize);

// WebSocket logic
const ws = new WebSocket(url);
ws.onopen = () => {
  console.log("Connected to BlueSky WebSocket");
};

ws.onmessage = (event) => {
  const json = JSON.parse(event.data);

  if (json.kind === "commit") {
    if (
      json.commit.collection === "app.bsky.feed.post" &&
      json.commit.operation === "create"
    ) {
      particles.spawn(1);
    } else if (
      json.commit.collection === "app.bsky.feed.like" &&
      json.commit.operation === "create"
    ) {
      particles.spawn(2);
    } else if (
      json.commit.collection === "app.bsky.graph.follow" &&
      json.commit.operation === "create"
    ) {
      particles.spawn(3);
    }
  } else if (json.kind === "account" && json.account.active) {
    particles.spawn(4);
  }
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};
