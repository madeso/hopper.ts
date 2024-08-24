import * as THREE from "three";

import { BoxMesh, BoxGeometry, createMaterial } from "./Physics";

export class Block extends BoxMesh {
  constructor() {
    const _material = createMaterial(
      new THREE.MeshLambertMaterial({ color: 0x0000ff }),
      0.5, // friction
      0.5 // bouncyness
    );
    const geom = new BoxGeometry(3, 3, 3);
    super(geom.three(), geom, _material, 0);

    this.receiveShadow = true;
    this.castShadow = true;
    this.setPosition(new THREE.Vector3(-5, -2, 6));
  }
}
