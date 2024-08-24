import * as THREE from "three";

const ROTATION_FACTOR = 1;

export class ShipOrientation extends THREE.Mesh {
  yaw: number = 0;
  pitch: number = 0;
  roll: number = 0;

  constructor() {
    const _material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    // todo(Gustav): fix this
    // const geom = gAssets.geoms["ship"];
    const geom = new THREE.BoxGeometry(1, 1, 1);
    super(geom, _material);

    this.rotation.order = "YZX";
  }

  incYaw = (dir: number) => {
    this.yaw += dir * ROTATION_FACTOR;
  };

  incPitch = (dir: number) => {
    this.pitch += dir * ROTATION_FACTOR;
  };

  incRoll = (dir: number) => {
    this.roll += dir * ROTATION_FACTOR;
  };

  orientation_matrix = () => {
    return new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(this.pitch, this.yaw, this.roll, "YZX")
    );
  };

  reset = () => {
    this.pitch = 0;
    this.yaw = 0;
    this.roll = 0;
  };

  update = (ship: { position: THREE.Vector3 }) => {
    this.position.copy(ship.position);
    this.rotation.set(this.pitch, this.yaw, this.roll);
    this.updateMatrix();
  };
}
