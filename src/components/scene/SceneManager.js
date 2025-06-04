import * as THREE from "three";
import { CircleMesh } from "./CircleMesh";
import { LightSource } from "./LightSource";
import { ParticleSystem } from "./ParticleSystem";
import { debounce, isDesktop } from "./utils";
import {
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  RenderPass,
} from "postprocessing";

/**
 * Scene orchestration and rendering.
 * Handles initialization, rendering loop, and user interactions.
 * Inspired by https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class
 * @property {number} mouseX - Normalized mouse X position (-1 to 1).
 * @property {number} mouseY - Normalized mouse Y position (-1 to 1).
 * @property {boolean} isDesktopDevice - True if running on desktop.
 * @property {HTMLElement} container - DOM element for the Three.js scene.
 * @property {THREE.Scene} scene - Main Three.js scene.
 * @property {THREE.PerspectiveCamera} camera - Perspective camera for the scene.
 * @property {THREE.WebGLRenderer} renderer - WebGL renderer for the scene.
 * @property {EffectComposer} composer - Post-processing composer for effects.
 * @property {LightSource} light - Interactive light source.
 * @property {CircleMesh} figure - Background circle grid mesh.
 * @property {ParticleSystem} particleSystem - Atmospheric particle system.
 * @property {THREE.Clock} clock - Clock for time-based animations.
 */
export class SceneManager {
  constructor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.isDesktopDevice = isDesktop();
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.light = null;
    this.figure = null;
    this.particleSystem = null;
    this.clock = new THREE.Clock();
  }

  init() {
    this.container = document.getElementById("three-container");
    if (!this.container) return;

    this.setupMouseTracking();
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createObjects();
    this.createPostProcessing();
    this.setupEventListeners();
    this.startRenderLoop();
  }

  setupMouseTracking() {
    // Only add mouse movement effects on desktop devices
    if (this.isDesktopDevice) {
      const section = this.container.closest("section");
      if (section) {
        section.addEventListener("mousemove", (event) => {
          const rect = section.getBoundingClientRect();
          // Convert to normalized coordinates (-1 to 1)
          this.mouseX = ((event.clientX - rect.left) / section.clientWidth) * 2 - 1;
          this.mouseY = -(((event.clientY - rect.top) / section.clientHeight) * 2 - 1);
        });
      }
    }
  }

  createScene() {
    this.scene = new THREE.Scene();
    // Add atmospheric fog for depth and haze
    this.scene.fog = new THREE.FogExp2(0x000000, 0.005);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      1,
      1000
    );
    this.camera.position.set(5, 0, 300);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  createLights() {
    // Add ambient light for basic illumination
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    // Create main interactive light source
    this.light = new LightSource();
    this.light.position.set(2, 0, -10);
    this.scene.add(this.light);
  }

  createObjects() {
    // Create grid figure with viewport dimensions
    this.figure = new CircleMesh(5, 15, 15, this.container.clientWidth, this.container.clientHeight);
    this.scene.add(this.figure);

    // Create atmospheric particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getMesh());
  }

  createPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Add god rays effect
    const godRaysEffect = new GodRaysEffect(this.camera, this.light, {
      height: 720,
      kernelSize: 3,
      density: 1.2,
      decay: 0.92,
      weight: 0.6,
      exposure: 0.6,
      samples: 60,
      clampMax: 1.0,
    });
    this.composer.addPass(new EffectPass(this.camera, godRaysEffect));
  }

  setupEventListeners() {
    window.addEventListener("resize", debounce(() => this.onResize(), 250), false);
  }

  startRenderLoop() {
    this.renderer.setAnimationLoop(() => this.render());
  }

  render() {
    const time = this.clock.getElapsedTime();

    // Update light with mouse interaction (desktop only)
    this.light.userData.time.value = time;
    this.light.update(
      time, 
      this.isDesktopDevice ? this.mouseX : 0, 
      this.isDesktopDevice ? this.mouseY : 0
    );

    // Update particle system
    this.particleSystem.update(time);

    // Render with post-processing effects
    this.composer.render();
  }

  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.figure.resize(this.container.clientWidth, this.container.clientHeight);
  }
}