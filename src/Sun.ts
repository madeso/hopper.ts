import * as THREE from "three";

export class Sun extends THREE.DirectionalLight {
  amb = new THREE.AmbientLight(0x0a0a0a);

  constructor() {
    super(0xffffff, 1);

    this.position.set(-5, 15, 5);

    this.castShadow = true;
  }

  ambientLight = () => {
    return this.amb;
  };

  update = (obj: THREE.Object3D) => {
    this.position.set(
      obj.position.x - 5,
      obj.position.y + 15,
      obj.position.z + 5
    );
    this.target = obj;
  };
}
