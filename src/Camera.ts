import * as THREE from "three";

const ELASTICITY: number = 30.0;
const BEHIND_DISTANCE: number = 8.0;

export class Camera extends THREE.PerspectiveCamera {
  yaw: number = 0;
  pitch: number = 0;

  constructor() {
    super(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.position.set(0, 50, 0);
    this.lookAt(new THREE.Vector3(0, 0, 0));
  }

  update(obj: { position: THREE.Vector3 }, yaw: number) {
    this.followCam(obj, yaw);
  }

  followCam(obj: { position: THREE.Vector3 }, target_yaw: number) {
    this.yaw += (target_yaw - this.yaw) / ELASTICITY;
    let pitch = -Math.PI / 3.5;

    this.position.set(
      obj.position.x + BEHIND_DISTANCE * Math.sin(this.yaw) * Math.sin(pitch),
      obj.position.y + BEHIND_DISTANCE * Math.cos(pitch),
      obj.position.z + BEHIND_DISTANCE * Math.cos(this.yaw) * Math.sin(pitch)
    );
    this.lookAt(obj.position);
  }
}
