import { Mesh, MeshBasicMaterial, Group, CircleGeometry, DoubleSide } from "three";

/**
 * A Three.js Group that creates a grid of circles with depth variation.
 * This class is designed to be used as a background mesh in a scene.
 * It optimizes memory usage by sharing geometry across all circles.
 * The grid adapts to the viewport size and can be resized dynamically.
 * It also includes a dispose method to clean up resources when no longer needed.
 *
 * Inspired from https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class CircleMesh
 * @extends Group
 * @param {number} [circleSize=5] - The radius of each circle.
 * @param {number} [spacingX=15] - The horizontal spacing between circles.
 * @param {number} [spacingY=15] - The vertical spacing between circles.
 * @param {number} [viewportWidth=800] - The initial width of the viewport.
 * @param {number} [viewportHeight=600] - The initial height of the viewport.
 */
class CircleMesh extends Group {
  private circleSize: number;
  private spacingX: number;
  private spacingY: number;
  private circleGeometry: CircleGeometry;

  constructor(
    circleSize: number = 5,
    spacingX: number = 15,
    spacingY: number = 15,
    viewportWidth: number = 800,
    viewportHeight: number = 600
  ) {
    super();
    this.circleSize = circleSize;
    this.spacingX = spacingX;
    this.spacingY = spacingY;

    // Create shared geometry for all circles to optimize memory
    this.circleGeometry = new CircleGeometry(circleSize, 72);

    this.createGrid(viewportWidth, viewportHeight);
  }

  /**
   * Creates a grid of circles.
   *
   * @param {number} viewportWidth - The width of the viewport.
   * @param {number} viewportHeight - The height of the viewport.
   */
  private createGrid(viewportWidth: number, viewportHeight: number): void {
    // Clear existing meshes and free memory on resize
    while (this.children.length > 0) {
      const obj = this.children[0] as Mesh;
      this.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
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
          // Random opacity variation for visual interest
          opacity: 0.7 + Math.random() * 0.3,
        });

        const circleMesh = new Mesh(this.circleGeometry, circleMaterial);
        circleMesh.position.set(circleX, circleY, depth);
        this.add(circleMesh);
      }
    }
  }

  /**
   * Resizes the grid based on the new viewport dimensions.
   *
   * @param {number} viewportWidth - The new width of the viewport.
   * @param {number} viewportHeight - The new height of the viewport.
   */
  public resize(viewportWidth: number, viewportHeight: number): void {
    this.createGrid(viewportWidth, viewportHeight);
  }

  /**
   * Disposes the geometry and materials to free up resources.
   */
  public dispose(): void {
    this.circleGeometry.dispose();
    this.children.forEach((child) => {
      const mesh = child as Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    this.clear();
  }
}

export { CircleMesh };
