import * as THREE from "three";

/**
 * Atmospheric particle system.
 * Distributes particles in a 3D volume with subtle rotation.
 * Inspired from https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class
 * @property {number} particleCount - Number of particles in the system.
 * @property {THREE.Points} particles - Points object containing the particle geometry and material.
 */
export class ParticleSystem {
  constructor(particleCount = 100000) {
    this.particleCount = particleCount;
    this.particles = this.createParticles();
  }

  createParticles() {
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

  // Animate particles with subtle rotation
  update(time) {
    this.particles.rotation.y = Math.sin(time * 0.1) * 0.5;
    this.particles.rotation.x = Math.cos(time * 0.07) * 0.3;
  }

  getMesh() {
    return this.particles;
  }
}