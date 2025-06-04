import * as THREE from "three";
import { CircleMesh } from "./CircleMesh";
import { LightSource } from "./LightSource";
import { ParticleSystem } from "./ParticleSystem";
import { debounce, isDesktop } from "./utils";
import { EffectComposer, EffectPass, GodRaysEffect, RenderPass } from "postprocessing";

/**
 * Manages the Three.js scene, camera, renderer, and all objects within the scene.
 * Handles mouse interactions, post-processing effects, and responsive resizing.
 * It initializes the scene with a grid of circles, a light source, and a particle system.
 * It also includes methods for rendering the scene and updating objects based on time and user input.
 * Inspired by https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class SceneManager
 * @description Initializes and manages the Three.js scene, camera, renderer, and objects.
 * @property {number} mouseX - Normalized X coordinate of the mouse position.
 * @property {number} mouseY - Normalized Y coordinate of the mouse position.
 * @property {boolean} isDesktopDevice - Flag indicating if the device is a desktop.
 * @property {HTMLElement | null} container - The HTML container for the Three.js scene.
 * @property {THREE.Scene | null} scene - The Three.js scene object.
 * @property {THREE.PerspectiveCamera | null} camera - The camera used to view the scene.
 * @property {THREE.WebGLRenderer | null} renderer - The renderer for the scene.
 * @property {EffectComposer | null} composer - The post-processing composer for effects.
 * @property {LightSource | null} light - The main light source in the scene.
 * @property {CircleMesh | null} figure - The grid of circles used as a background mesh.
 * @property {ParticleSystem | null} particleSystem - The atmospheric particle system.
 * @property {THREE.Clock} clock - The clock for time-based animations.
 */
export class SceneManager {
  private mouseX: number;
  private mouseY: number;
  private isDesktopDevice: boolean;
  private container: HTMLElement | null;
  private scene: THREE.Scene | null;
  private camera: THREE.PerspectiveCamera | null;
  private renderer: THREE.WebGLRenderer | null;
  private composer: EffectComposer | null;
  private light: LightSource | null;
  private figure: CircleMesh | null;
  private particleSystem: ParticleSystem | null;
  private clock: THREE.Clock;

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

  /**
   * Initializes the Three.js scene, camera, renderer, and all objects.
   * Sets up mouse tracking for desktop devices and starts the render loop.
   */
  public init(): void {
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

  /**
   * Sets up mouse tracking for desktop devices to enable interactive effects.
   * It listens for mouse movements and updates normalized coordinates.
   */
  private setupMouseTracking(): void {
    // Only add mouse movement effects on desktop devices
    if (this.isDesktopDevice && this.container) {
      const section = this.container.closest("section");
      if (section) {
        section.addEventListener("mousemove", (event: MouseEvent) => {
          const rect = section.getBoundingClientRect();
          // Convert to normalized coordinates (-1 to 1)
          this.mouseX = ((event.clientX - rect.left) / section.clientWidth) * 2 - 1;
          this.mouseY = -(((event.clientY - rect.top) / section.clientHeight) * 2 - 1);
        });
      }
    }
  }

  /**
   * Creates the main Three.js scene with atmospheric fog for depth and haze.
   */
  private createScene(): void {
    this.scene = new THREE.Scene();
    // Add atmospheric fog for depth and haze
    this.scene.fog = new THREE.FogExp2(0x000000, 0.005);
  }

  /**
   * Creates the camera for viewing the scene.
   * Sets the initial position and aspect ratio based on the container size.
   */
  private createCamera(): void {
    if (!this.container) return;

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      1,
      1000
    );
    this.camera.position.set(5, 0, 300);
  }

  /**
   * Creates the WebGL renderer and appends it to the container.
   * Sets the renderer size based on the container dimensions.
   */
  private createRenderer(): void {
    if (!this.container) return;

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Creates the main light source and ambient light for the scene.
   * The light source is interactive and can be influenced by mouse movements.
   */
  private createLights(): void {
    if (!this.scene) return;

    // Add ambient light for basic illumination
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    // Create main interactive light source
    this.light = new LightSource();
    this.light.position.set(2, 0, -10);
    this.scene.add(this.light);
  }

  /**
   * Creates the main objects in the scene, including a grid of circles and a particle system.
   * The grid is created based on the viewport dimensions and serves as a background mesh.
   */
  private createObjects(): void {
    if (!this.scene || !this.container) return;

    // Create grid figure with viewport dimensions
    this.figure = new CircleMesh(
      5,
      15,
      15,
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.scene.add(this.figure);

    // Create atmospheric particle system
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.getMesh());
  }

  /**
   * Creates post-processing effects for the scene, including god rays.
   * It uses EffectComposer to manage multiple rendering passes.
   */
  private createPostProcessing(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.light) return;

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

  /**
   * Sets up event listeners for window resize to adjust camera and renderer.
   * Uses debounce to limit the frequency of resize handling.
   */
  private setupEventListeners(): void {
    window.addEventListener(
      "resize",
      debounce(() => this.onResize(), 250),
      false
    );
  }

  /**
   * Starts the render loop to continuously update and render the scene.
   * It uses the renderer's animation loop to call the render method.
   */
  private startRenderLoop(): void {
    if (!this.renderer) return;
    this.renderer.setAnimationLoop(() => this.render());
  }

  /**
   * Render loop method that updates the scene and renders it.
   * It updates the light source and particle system based on time and mouse position.
   * It also applies post-processing effects using the composer.
   */
  private render(): void {
    if (!this.light || !this.particleSystem || !this.composer) return;

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

  /**
   * Handles window resize events to adjust camera aspect ratio and renderer size.
   * It also resizes the figure mesh to fit the new container dimensions.
   */
  private onResize(): void {
    if (!this.camera || !this.renderer || !this.container || !this.figure) return;

    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.figure.resize(this.container.clientWidth, this.container.clientHeight);
  }


  /**
   * Disposes of all resources used by the scene manager.
   * This includes disposing of the renderer, light, figure, particle system, and composer.
   * It should be called when the scene is no longer needed to free up memory.
   */
  public dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.light) {
      this.light.dispose();
    }
    if (this.figure) {
      this.figure.dispose();
    }
    if (this.particleSystem) {
      this.particleSystem.dispose();
    }
    if (this.composer) {
      this.composer.dispose();
    }
  }
}
