import {
  Mesh,
  MeshBasicMaterial,
  Group,
  CircleGeometry,
  DoubleSide
} from "three";

class Figure extends Group {
  constructor(circleSize = 5, spacingX = 15, spacingY = 15) {
    super();
    
    // Variables to control the pattern
    // circleSize: Radius of each circular hole
    // spacingX: Horizontal distance between circle centers
    // spacingY: Vertical distance between circle centers
    
    // Rectangle dimensions (for positioning only)
    const width = 200;
    const height = 150;
    
    // Calculate number of circles in each dimension
    const circlesX = Math.floor(width / spacingX);
    const circlesY = Math.floor(height / spacingY);
    
    // Create circle geometry (will be reused)
    const circleGeometry = new CircleGeometry(circleSize, 32);
    
    // Create material for circles
    const circleMaterial = new MeshBasicMaterial({
      color: 0x080808,
      side: DoubleSide,
    });
    
    // Starting position (centered)
    const startX = -width / 2 + spacingX / 2;
    const startY = -height / 2 + spacingY / 2;
    
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