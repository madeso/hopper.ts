import * as THREE from "three";
import CANNON from "cannon";

export interface Material {
  ren: THREE.MeshLambertMaterial;
  friction: number;
  bouncyness: number;
}

export const createMaterial = (
  ren: THREE.MeshLambertMaterial,
  friction: number,
  bouncyness: number
): Material => {
  return { ren, friction, bouncyness };
};

export class BoxGeometry {
  constructor(public x: number, public y: number, public z: number) {}

  three() {
    return new THREE.BoxGeometry(this.x, this.y, this.z);
  }

  static fromThree(geom: THREE.BufferGeometry): BoxGeometry {
    let aabb = geom.boundingBox;
    if (!aabb) {
      geom.computeBoundingBox();
      aabb = geom.boundingBox;
    }
    if (!aabb) {
      throw new Error("No bounding box");
    }
    return new BoxGeometry(
      aabb.max.x - aabb.min.x,
      aabb.max.y - aabb.min.y,
      aabb.max.z - aabb.min.z
    );
  }
}

export class BoxMesh extends THREE.Mesh {
  constructor(
    geometry: THREE.BufferGeometry,
    box: BoxGeometry,
    material: Material,
    mass: number
  ) {
    super(geometry, material.ren);
    this.body = new CANNON.Body({ mass });
    this.body.addShape(
      new CANNON.Box(new CANNON.Vec3(box.x / 2, box.y / 2, box.z / 2))
    );

    if (!this.body.material) {
      this.body.material = new CANNON.Material("");
    }
    this.body.material.friction = material.friction;
    this.body.material.restitution = material.bouncyness;
    // this.useQuaternion = true;
  }

  finalizeInit() {}

  setDamping(linear: number, angular: number) {
    this.body.linearDamping = linear;
    this.body.angularDamping = angular;
  }
  applyTorque(force: THREE.Vector3) {
    this.body.torque.x += force.x;
    this.body.torque.y += force.y;
    this.body.torque.z += force.z;
  }
  applyCentralForce(force: THREE.Vector3) {
    this.body.applyLocalForce(
      new CANNON.Vec3(force.x, force.y, force.z),
      new CANNON.Vec3(0, 0, 0)
    );
  }
  setLinearVelocity(velocity: THREE.Vector3) {
    this.body.velocity.x = velocity.x;
    this.body.velocity.y = velocity.y;
    this.body.velocity.z = velocity.z;
  }

  setAngularVelocity(velocity: THREE.Vector3) {
    this.body.angularVelocity.x = velocity.x;
    this.body.angularVelocity.y = velocity.y;
    this.body.angularVelocity.z = velocity.z;
  }

  setPosition(pos: THREE.Vector3) {
    this.body.position.x = pos.x;
    this.body.position.y = pos.y;
    this.body.position.z = pos.z;

    this.position.x = pos.x;
    this.position.y = pos.y;
    this.position.z = pos.z;
  }

  body: CANNON.Body;
}

export class Scene {
  scene = new THREE.Scene();
  world = new CANNON.World();
  meshes: BoxMesh[] = [];

  constructor() {
    this.world.gravity.set(0, 0, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
  }

  add(obj: BoxMesh) {
    this.scene.add(obj);
    this.world.addBody(obj.body);
    this.meshes.push(obj);
    obj.finalizeInit();
  }

  remove(obj: BoxMesh) {
    this.scene.remove(obj);
    this.world.remove(obj.body);
    this.meshes = this.meshes.filter((m) => m !== obj);
  }

  addThree(obj: THREE.Object3D) {
    this.scene.add(obj);
  }

  setGravity(gravity: THREE.Vector3) {
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
  }

  simulate() {
    const timeStep = 1 / 60;
    this.world.step(timeStep);

    for (const mesh of this.meshes) {
      mesh.position.x = mesh.body.position.x;
      mesh.position.y = mesh.body.position.y;
      mesh.position.z = mesh.body.position.z;
      mesh.quaternion.x = mesh.body.quaternion.x;
      mesh.quaternion.y = mesh.body.quaternion.y;
      mesh.quaternion.z = mesh.body.quaternion.z;
      mesh.quaternion.w = mesh.body.quaternion.w;
    }
  }
}
