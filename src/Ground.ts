import * as THREE from "three";

import { BoxMesh, BoxGeometry, createMaterial } from "./Physics";

export class Ground extends BoxMesh {
  constructor() {
    const geom = new BoxGeometry(100, 1, 100);

    const mat = createMaterial(
      new THREE.MeshLambertMaterial({
        // ambient		: 0x444444,
        color: 0x8844aa,
        // shininess	: 300,
        // specular	: 0x33AA33,
        // shading		: THREE.SmoothShading,
        // map			: THREE.ImageUtils.loadTexture( "data/textures/grid.jpg" )
      }),
      0.8, // high friction
      0.3 // low restitution
    );

    super(geom.three(), geom, mat, 0 /* mass */);
    this.receiveShadow = true;
    this.setPosition(new THREE.Vector3(0, -4, 0));
  }
}
