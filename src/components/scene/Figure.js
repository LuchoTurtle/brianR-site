import { Mesh, MeshBasicMaterial, Group, CircleGeometry, DoubleSide } from "three";

class Figure extends Group {
  /**
   * Creates a grid of circular holes in a plane to simulate a DJ lighting effect.
   * @param {*} circleSize size of each circular hole
   * @param {*} spacingX spacing between circles in the X direction
   * @param {*} spacingY spacing between circles in the Y direction
   * @param {*} viewportWidth viewport width to fill
   * @param {*} viewportHeight viewport height to fill
   */
  constructor(circleSize = 5, spacingX = 15, spacingY = 15, viewportWidth = 800, viewportHeight = 600) {
    super();

    // Use viewport dimensions instead of fixed values
    // Add some padding to ensure we fully cover the viewport
    const width = viewportWidth * 1.1; // 10% extra to ensure coverage
    const height = viewportHeight * 1.1;

    // Calculate number of circles in each dimension to fill viewport
    const circlesX = Math.ceil(width / spacingX);
    const circlesY = Math.ceil(height / spacingY);

    // Create circle geometry (will be reused)
    const circleGeometry = new CircleGeometry(circleSize, 64); // Increased segments for smoother circles

    // Create material for circles
    const circleMaterial = new MeshBasicMaterial({
      color: 0x080808,
      side: DoubleSide,
    });

    // Starting position (centered in viewport)
    const startX = -(circlesX * spacingX) / 2 + spacingX / 2;
    const startY = -(circlesY * spacingY) / 2 + spacingY / 2;

    // Create grid of circles
    for (let x = 0; x < circlesX; x++) {
      for (let y = 0; y < circlesY; y++) {
        // Position for this circle
        const circleX = startX + x * spacingX;
        const circleY = startY + y * spacingY;

        // Create a circle mesh
        const circleMesh = new Mesh(circleGeometry, circleMaterial);
        circleMesh.position.set(circleX, circleY, 0);

        // Add to group
        this.add(circleMesh);
      }
    }
  }
}

export { Figure };
