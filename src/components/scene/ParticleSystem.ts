import * as THREE from "three";

/**
 * Atmospheric particle system.
 * Distributes particles in a 3D volume with subtle rotation.
 * Inspired from https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class ParticleSystem
 * @description Creates a particle system that simulates atmospheric particles.
 * @property {number} particleCount - Number of particles in the system.
 * @property {THREE.Points} particles - The particle mesh containing the geometry and material.
 */
export class ParticleSystem {
  private particleCount: number;
  private particles: THREE.Points;

  constructor(particleCount: number = 100000) {
    this.particleCount = particleCount;
    this.particles = this.createParticles();
  }

  /**
   * Creates a particle mesh with random positions in a 3D volume.
   * @returns {THREE.Points} The particle mesh.
   */
  private createParticles(): THREE.Points {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    // Distribute particles in a volume
    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400; // x
      positions[i + 1] = (Math.random() - 0.5) * 400; // y
      positions[i + 2] = (Math.random() - 0.5) * 200; // z
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(particles, particleMaterial);
  }

  /**
   * Updates the particle system with time-based animations.
   * @param {number} time - The current time in milliseconds.
   */
  public update(time: number): void {
    this.particles.rotation.y = Math.sin(time * 0.1) * 0.5;
    this.particles.rotation.x = Math.cos(time * 0.07) * 0.3;
  }

  /**
   * Returns the particle mesh.
   * @returns {THREE.Points} The particle mesh.
   */
  public getMesh(): THREE.Points {
    return this.particles;
  }

  /**
   * Disposes the particle system resources.
   * Frees up geometry and material to prevent memory leaks.
   */
  public dispose(): void {
    this.particles.geometry.dispose();
    if (this.particles.material) {
      if (Array.isArray(this.particles.material)) {
        this.particles.material.forEach((mat) => mat.dispose());
      } else {
        this.particles.material.dispose();
      }
    }
  }
}
