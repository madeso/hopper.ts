import { BoxMesh, BoxGeometry, createMaterial } from "./Physics";
import * as THREE from "three";

const TORQUE_POWER = 4.0;
const TORQUE_THRESHOLD = (5.0 * Math.PI) / 180.0;
const THRUST_POWER = 50.0;
const THRUST_FORCE = new THREE.Vector3(0, THRUST_POWER, 0);

export class Ship extends BoxMesh {
  mainThruster: THREE.ArrowHelper;

  constructor(shipGeom: THREE.BufferGeometry) {
    const _material = createMaterial(
      new THREE.MeshLambertMaterial({ color: 0xaaaa88 }),
      0.8, // friction
      0.6 // restitution
    );

    super(shipGeom, BoxGeometry.fromThree(shipGeom), _material, 1);

    this.mainThruster = new THREE.ArrowHelper(
      this.up /* dir */,
      this.position /* origin */,
      1 /* length  */
    );

    this.castShadow = true;
    this.receiveShadow = false;
  }

  finalizeInit() {
    this.setDamping(0.8, 0.9); // does work only after adding the object to the scene :/
  }

  world2local(vector: THREE.Vector3) {
    let rotation_matrix = new THREE.Matrix4();
    rotation_matrix.extractRotation(this.matrix);
    return vector.clone().applyMatrix4(rotation_matrix);
  }

  torque(force: THREE.Vector3) {
    this.applyTorque(this.world2local(force));
  }

  thrust() {
    this.applyCentralForce(this.world2local(THRUST_FORCE));
  }

  freeze() {
    this.setLinearVelocity(new THREE.Vector3(0, 0, 0));
    this.setAngularVelocity(new THREE.Vector3(0, 0, 0));
  }

  update(ship_orientation: { orientation_matrix(): THREE.Matrix4 }) {
    let aimO = ship_orientation.orientation_matrix();
    let curO = new THREE.Matrix4().extractRotation(this.matrix);

    let aimYaw = new THREE.Vector3(0, 0, 1).applyMatrix4(aimO);
    let aimPitch = new THREE.Vector3(0, 1, 0).applyMatrix4(aimO);
    let aimRoll = new THREE.Vector3(1, 0, 0).applyMatrix4(aimO);

    let curYaw = new THREE.Vector3(0, 0, 1).applyMatrix4(curO);
    let curPitch = new THREE.Vector3(0, 1, 0).applyMatrix4(curO);
    let curRoll = new THREE.Vector3(1, 0, 0).applyMatrix4(curO);

    let dotYaw = curRoll.dot(aimYaw);
    let dotRoll = curPitch.dot(aimRoll);
    let dotPitch = curYaw.dot(aimPitch);

    let torqueYaw = 0;
    let torquePitch = 0;
    let torqueRoll = 0;
    if (dotYaw > TORQUE_THRESHOLD) torqueYaw = TORQUE_POWER * dotYaw;
    if (dotYaw < -TORQUE_THRESHOLD) torqueYaw = TORQUE_POWER * dotYaw;
    if (dotRoll > TORQUE_THRESHOLD) torqueRoll = TORQUE_POWER * dotRoll;
    if (dotRoll < -TORQUE_THRESHOLD) torqueRoll = TORQUE_POWER * dotRoll;
    if (dotPitch > TORQUE_THRESHOLD) torquePitch = TORQUE_POWER * dotPitch;
    if (dotPitch < -TORQUE_THRESHOLD) torquePitch = TORQUE_POWER * dotPitch;

    this.torque(new THREE.Vector3(torquePitch, torqueYaw, torqueRoll));

    this.update_thrusters();
  }

  update_thrusters() {
    this.mainThruster.setDirection(this.up);
    this.mainThruster.position.copy(this.position);
  }
}
