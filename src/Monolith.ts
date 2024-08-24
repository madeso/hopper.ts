import * as THREE from "three";

import { BoxMesh, BoxGeometry, createMaterial } from "./Physics";

export class Monolith extends BoxMesh {
  constructor() {
    let mat = createMaterial(
      new THREE.MeshLambertMaterial({ color: 0x000000 }),
      0.5, // friction
      0.5 // bouncyness
    );
    const geom = new BoxGeometry(1, 9, 4);
    super(geom.three(), geom, mat, 0);

    this.receiveShadow = true;
    this.castShadow = true;
    this.setPosition(new THREE.Vector3(4, 0, 4));
  }
}
