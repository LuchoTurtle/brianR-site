import { Mesh, MeshBasicMaterial, Group, CircleGeometry, DoubleSide } from "three";

class CircleMesh extends Group {
  constructor(circleSize = 5, spacingX = 15, spacingY = 15, viewportWidth = 800, viewportHeight = 600) {
    super();
    this.circleSize = circleSize;
    this.spacingX = spacingX;
    this.spacingY = spacingY;

    // Create circle for grid
    this.circleGeometry = new CircleGeometry(circleSize, 72);

    // Initial creation
    this.createGrid(viewportWidth, viewportHeight);
  }

  createGrid(viewportWidth, viewportHeight) {
    // Clear any existing meshes (called on resize)
    while (this.children.length > 0) {
      const obj = this.children[0];
      this.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    // Use viewport dimensions with padding
    const width = viewportWidth * 1.1;
    const height = viewportHeight * 1.1;

    // Calculate grid dimensions
    const circlesX = Math.ceil(width / this.spacingX);
    const circlesY = Math.ceil(height / this.spacingY);

    // Starting position (centered)
    const startX = -(circlesX * this.spacingX) / 2 + this.spacingX / 2;
    const startY = -(circlesY * this.spacingY) / 2 + this.spacingY / 2;

    // Create mesh of circles
    for (let x = 0; x < circlesX; x++) {
      for (let y = 0; y < circlesY; y++) {
        const circleX = startX + x * this.spacingX;
        const circleY = startY + y * this.spacingY;
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

  // Method to resize the figure
  resize(viewportWidth, viewportHeight) {
    this.createGrid(viewportWidth, viewportHeight);
  }
}

export { CircleMesh };
