import * as THREE from "three";

import { Camera } from "./Camera";
import { Block } from "./Block";
import { Ground } from "./Ground";
import { Monolith } from "./Monolith";
import { Ship } from "./Ship";
import { ShipOrientation } from "./ShipOrientation";
import { Sun } from "./Sun";
import { Scene } from "./Physics";
import { BoxGeometry } from "./Physics";

const ORIENTATION_INC = 0.025;
const GRAVITY_POWER = 10;
const SENS = -0.1;

export class Game {
  elem: HTMLElement;
  gRenderer: THREE.WebGLRenderer;

  isthrusting = false;
  gShipOrientation: ShipOrientation;
  gShip: Ship;
  keyState = {
    space: false,
    a: false,
    d: false,
    up: false,
    down: false,
    right: false,
    left: false,
    r: false,
  };

  onKey(code: string, state: boolean) {
    switch (code) {
      case "Space":
        this.keyState.space = state;
        break;
      case "KeyA":
        this.keyState.a = state;
        break;
      case "KeyD":
        this.keyState.d = state;
        break;
      case "ArrowUp":
        this.keyState.up = state;
        break;
      case "ArrowDown":
        this.keyState.down = state;
        break;
      case "ArrowLeft":
        this.keyState.left = state;
        break;
      case "ArrowRight":
        this.keyState.right = state;
        break;
      case "KeyR":
        this.keyState.r = state;
        break;
    }
  }

  scene: Scene;
  gCamera: Camera;
  gSun: Sun;
  // gStats: Stats;

  shipGeom: THREE.BufferGeometry;

  // var elem = document.getElementById("viewport");
  constructor(elem: HTMLElement) {
    this.elem = elem;
    this.gShipOrientation = new ShipOrientation();

    // todo(Gustav): load geom from file
    this.shipGeom = new BoxGeometry(1, 1, 1).three();

    // create scene
    this.scene = new Scene();
    this.scene.setGravity(new THREE.Vector3(0, -GRAVITY_POWER, 0));

    this.gRenderer = new THREE.WebGLRenderer();
    this.gRenderer.setSize(window.innerWidth, window.innerHeight);
    this.elem.appendChild(this.gRenderer.domElement);
    this.gRenderer.shadowMap.enabled = true;

    this.gShip = new Ship(this.shipGeom);
    this.scene.add(this.gShip);
    this.gShip.finalizeInit();

    this.scene.addThree(this.gShipOrientation);

    this.scene.add(new Block());
    this.scene.add(new Monolith());

    var ground = new Ground();
    this.scene.add(ground);

    this.gCamera = new Camera();

    var amb = new THREE.AmbientLight(0x0a0a0a);
    this.scene.addThree(amb);

    this.gSun = new Sun();
    this.scene.addThree(this.gSun);
    this.scene.addThree(this.gSun.ambientLight());

    var axis = new THREE.AxesHelper(2);
    this.scene.addThree(axis);

    // this.gStats = new Stats();
    // this.gStats.dom.style.position = "absolute";
    // this.gStats.dom.style.top = "0px";
    // this.elem.appendChild(this.gStats.dom);

    //this.scene.fog = new THREE.Fog();
  }

  registerEvents() {
    console.log("Registering events with elem", this.elem);

    this.elem.addEventListener("mouseup", () => {
      this.onMouseUp();
    });
    this.elem.addEventListener("mousedown", () => {
      this.onMouseDown();
    });
    this.elem.addEventListener("mousemove", (ev) => {
      this.onMouseMove(ev);
    });
    this.elem.addEventListener("dblclick", () => {
      console.log("dblclick", this.elem);
      this.onDoubleClick();
    });

    document.addEventListener(
      "fullscreenchange",
      () => {
        this.fullscreenChange();
      },
      false
    );
    document.addEventListener(
      "pointerlockchange",
      () => {
        this.pointerLockChange();
      },
      false
    );
    document.addEventListener(
      "pointerlockerror",
      () => {
        this.pointerLockError();
      },
      false
    );

    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    document.addEventListener(
      "keydown",
      (e) => {
        this.onKey(e.code, true);
      },
      false
    );
    document.addEventListener(
      "keyup",
      (e) => {
        this.onKey(e.code, false);
      },
      false
    );
  }

  render() {
    this.gRenderer.render(this.scene.scene, this.gCamera);
  }

  onWindowResize() {
    if (this.gCamera === undefined) {
      console.log("Invalid camera state");
      return;
    }
    this.gCamera.aspect = window.innerWidth / window.innerHeight;
    this.gCamera.updateProjectionMatrix();
    this.gRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseUp() {
    this.isthrusting = false;
  }

  onMouseDown() {
    if (this.isFullscreen()) this.isthrusting = true;
  }

  fullscreenChange() {
    if (document.fullscreenElement === this.elem) {
      console.log("Got fullscreen.");
      this.elem.requestPointerLock();
    } else {
      console.log("No fullscreen.");
    }
  }

  pointerLockChange() {
    if (document.pointerLockElement === this.elem) {
      console.log("Has pointer lock.");
    } else {
      console.log("Pointer lock released");
    }
  }

  pointerLockError() {
    console.log("Error while locking pointer.");
  }

  onDoubleClick() {
    // Start by going fullscreen with the element.	Current implementations
    // require the element to be in fullscreen before requesting pointer
    // lock--something that will likely change in the future.
    if (this.elem === null) return;

    if (this.isFullscreen()) {
      console.log("Leaving fullscreen...");
      document.exitFullscreen();
    } else {
      console.log("Requesting fullscreen...");
      this.elem.requestFullscreen();
    }
  }

  isFullscreen() {
    // console.log("fse: ", document.fullscreenElement);
    return document.fullscreenElement !== null;
  }

  onMouseMove(e: MouseEvent) {
    if (this.isFullscreen()) {
      const movementX = e.movementX,
        movementY = e.movementY;

      this.gShipOrientation.incYaw(movementX * SENS * ORIENTATION_INC);
      this.gShipOrientation.incPitch(movementY * SENS * ORIENTATION_INC);
    }
  }

  update() {
    if (this.keyState.space || this.isthrusting) this.gShip.thrust();
    if (this.keyState.a) this.gShipOrientation.incRoll(-ORIENTATION_INC);
    if (this.keyState.d) this.gShipOrientation.incRoll(ORIENTATION_INC);
    if (this.keyState.up) this.gShipOrientation.incPitch(ORIENTATION_INC);
    if (this.keyState.down) this.gShipOrientation.incPitch(-ORIENTATION_INC);
    if (this.keyState.right) this.gShipOrientation.incYaw(-ORIENTATION_INC);
    if (this.keyState.left) this.gShipOrientation.incYaw(ORIENTATION_INC);

    if (this.keyState.r) {
      this.scene.remove(this.gShip);
      this.gShip = new Ship(this.shipGeom);
      this.scene.add(this.gShip);
      this.gShip.finalizeInit();
      this.gShipOrientation.reset();
    }

    this.gShipOrientation.update(this.gShip);

    this.gShip.update(this.gShipOrientation);
    this.gSun.update(this.gShip);
    this.gCamera.update(this.gShipOrientation, this.gShipOrientation.yaw);
    // this.gStats.update();
    this.scene.simulate(undefined, 1);
  }
}
