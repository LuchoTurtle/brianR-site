import { Mesh, MeshBasicMaterial, Group, CircleGeometry, DoubleSide } from "three";

/**
 * Background circle grid mesh.
 * Creates a grid of circles with depth variation.
 * Inspired from https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class
 * @extends {THREE.Group}
 * @property {number} circleSize - Radius of each circle.
 * @property {number} spacingX - Horizontal spacing between circles.
 * @property {number} spacingY - Vertical spacing between circles.
 * @property {THREE.CircleGeometry} circleGeometry - Shared geometry for all circles.
 */
class CircleMesh extends Group {
  constructor(
    circleSize = 5,
    spacingX = 15,
    spacingY = 15,
    viewportWidth = 800,
    viewportHeight = 600
  ) {
    super();
    this.circleSize = circleSize;
    this.spacingX = spacingX;
    this.spacingY = spacingY;

    // Create shared geometry for all circles to optimize memory
    this.circleGeometry = new CircleGeometry(circleSize, 72);

    this.createGrid(viewportWidth, viewportHeight);
  }

  createGrid(viewportWidth, viewportHeight) {
    // Clear existing meshes and free memory on resize
    while (this.children.length > 0) {
      const obj = this.children[0];
      this.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    // Add padding to ensure full viewport coverage
    const width = viewportWidth * 1.1;
    const height = viewportHeight * 1.1;

    const circlesX = Math.ceil(width / this.spacingX);
    const circlesY = Math.ceil(height / this.spacingY);

    // Center the grid in the viewport
    const startX = -(circlesX * this.spacingX) / 2 + this.spacingX / 2;
    const startY = -(circlesY * this.spacingY) / 2 + this.spacingY / 2;

    // Create grid pattern with depth variation
    for (let x = 0; x < circlesX; x++) {
      for (let y = 0; y < circlesY; y++) {
        const circleX = startX + x * this.spacingX;
        const circleY = startY + y * this.spacingY;

        // Create wave-like depth pattern using trigonometry
        const depth = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 20;

        const circleMaterial = new MeshBasicMaterial({
          color: 0x080808,
          side: DoubleSide,
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3,
        });

        const circleMesh = new Mesh(this.circleGeometry, circleMaterial);
        circleMesh.position.set(circleX, circleY, depth);
        this.add(circleMesh);
      }
    }
  }

  // Recreate grid when viewport dimensions change
  resize(viewportWidth, viewportHeight) {
    this.createGrid(viewportWidth, viewportHeight);
  }
}

export { CircleMesh };
