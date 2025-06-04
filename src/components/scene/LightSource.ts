import { CircleGeometry, Mesh, MeshBasicMaterial } from "three";

/**
 * ShaderUniforms interface defines the structure for shader uniforms.
 * These uniforms are used to pass dynamic values
 * to the shader for rendering effects like time, intensity, and mouse influence.
 * @interface ShaderUniforms
 * @property {Object} time - Uniform for time-based animations.
 * @property {Object} intensity - Uniform for light intensity.
 * @property {Object} pulseSpeed - Uniform for controlling the speed of pulsing effects.
 * @property {Object} colorSpeed - Uniform for controlling the speed of color cycling.
 * @property {Object} mouseInfluence - Uniform for how much the mouse position affects the light.
 * @property {Object} mouseX - Uniform for the X coordinate of the mouse position.
 * @property {Object} mouseY - Uniform for the Y coordinate of the mouse position.
 */
interface ShaderUniforms {
  time: { value: number };
  intensity: { value: number };
  pulseSpeed: { value: number };
  colorSpeed: { value: number };
  mouseInfluence: { value: number };
  mouseX: { value: number };
  mouseY: { value: number };
}

/**
 * LightSource class extends Mesh to create a dynamic light source
 * with shader effects. It supports automatic movement, pulsing colors,
 * and mouse interaction to influence its position and appearance.
 * It uses a custom shader to create animated effects and can be updated
 * with time and mouse coordinates.
 * The class also includes a dispose method to clean up resources.
 *
 * Inspired from https://discourse.threejs.org/t/recreating-a-volumetric-light-effect/31387/2.
 * @class LightSource
 * @extends Mesh
 * @property {boolean} autoMove - Whether the light moves automatically.
 * @property {number} moveSpeed - Speed of automatic movement.
 * @property {number} moveRange - Range of automatic movement.
 * @property {number} offsetX - Horizontal offset for positioning.
 * @property {number} offsetY - Vertical offset for positioning.
 * @property {ShaderUniforms} userData - Shader uniforms for GPU communication.
 */
class LightSource extends Mesh {
  public autoMove: boolean;
  public moveSpeed: number;
  public moveRange: number;
  private offsetX: number;
  private offsetY: number;

  // Override userData to have proper typing
  declare userData: ShaderUniforms;

  constructor() {
    super();

    // Shader uniforms - userData automatically passes to GPU
    this.userData = {
      time: { value: 0 },
      intensity: { value: 0.8 },
      pulseSpeed: { value: 1.5 },
      colorSpeed: { value: 0.2 },
      mouseInfluence: { value: 0.5 },
      mouseX: { value: 0 },
      mouseY: { value: 0 },
    };

    // Movement settings
    this.autoMove = true;
    this.moveSpeed = 1.0;
    this.moveRange = 4.0;

    // Position offset for right-top positioning
    this.offsetX = 45; // Move right
    this.offsetY = 15; // Move up

    const geometry = new CircleGeometry(50, 32);
    const material = new MeshBasicMaterial({ color: 0xbb0000 });
    material.onBeforeCompile = (shader) => {
      // Connect userData to shader uniforms
      shader.uniforms.time = this.userData.time;
      shader.uniforms.intensity = this.userData.intensity;
      shader.uniforms.pulseSpeed = this.userData.pulseSpeed;
      shader.uniforms.colorSpeed = this.userData.colorSpeed;
      shader.uniforms.mouseInfluence = this.userData.mouseInfluence;
      shader.uniforms.mouseX = this.userData.mouseX;
      shader.uniforms.mouseY = this.userData.mouseY;

      // Inject custom shader code
      shader.fragmentShader = `
          uniform float time;
          uniform float intensity;
          uniform float pulseSpeed;
          uniform float colorSpeed;
          uniform float mouseInfluence;
          uniform float mouseX;
          uniform float mouseY;
          ${shader.fragmentShader}
        `
        .replace(
          `void main() {`,
          `
          // Simplified 3D noise for texture variation
          float snoise(vec3 p) {
            float n = sin(p.x * 1.0) * 0.5 + 0.5;
            n += cos(p.y * 1.1 + p.z) * 0.5;
            n += sin((p.x + p.z) * 0.5) * 0.5;
            return n / 1.5;
          }
          
          // Color palette for cycling
          vec3 color1 = vec3(1.0, 0.1, 0.1);   // Red
          vec3 color2 = vec3(0.1, 0.1, 1.0);   // Blue
          vec3 color3 = vec3(1.0, 0.8, 0.0);   // Yellow
          vec3 color4 = vec3(0.9, 0.1, 0.9);   // Magenta
          
          float pulse(float t, float speed) {
            return (sin(t * speed) * 0.5 + 0.5);
          }
          
          void main() {`
        )
        .replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `
          // Center UV coordinates and apply mouse offset
          vec2 uv = vUv - 0.5;
          vec2 mouseOffset = vec2(mouseX, mouseY) * mouseInfluence * 0.2;
          uv += mouseOffset;
          
          // Circular gradient from center
          float lightShape = smoothstep(0.5, 0.0, length(uv));
          lightShape = pow(lightShape, 2.0);
          
          float noise = snoise(vec3(uv * 7.0, time * 0.5)) * 0.5 + 0.5;
          float pulseEffect = pulse(time, pulseSpeed);
          
          // Cycle through 4 colors over time
          float colorCycle = mod(time * colorSpeed + mouseX * 0.5, 4.0);
          vec3 currentColor;
          
          if (colorCycle < 1.0) {
            currentColor = mix(color1, color2, colorCycle);
          } else if (colorCycle < 2.0) {
            currentColor = mix(color2, color3, colorCycle - 1.0);
          } else if (colorCycle < 3.0) {
            currentColor = mix(color3, color4, colorCycle - 2.0);
          } else {
            currentColor = mix(color4, color1, colorCycle - 3.0);
          }
          
          float finalIntensity = intensity * (1.0 + pulseEffect * 0.5 + mouseY * 0.3);
          
          // Combine all effects
          vec3 col = currentColor * lightShape * finalIntensity * (noise * 0.3 + 0.7);
          
          vec4 diffuseColor = vec4(col, opacity);
          `
        );
    };
    // Required for UV coordinates in shader
    material.defines = { USE_UV: "" };

    this.geometry = geometry;
    this.material = material;
  }

  /**
   * Updates the light source position and shader uniforms.
   * @param time - Current time for animations.
   * @param mouseX - X coordinate of the mouse position.
   * @param mouseY - Y coordinate of the mouse position.
   */
  public update(time: number, mouseX: number = 0, mouseY: number = 0): void {
    this.userData.time.value = time;
    this.userData.mouseX.value = mouseX;
    this.userData.mouseY.value = mouseY;

    if (this.autoMove) {
      // Blend automatic movement with mouse interaction
      const mx = Math.cos(time * this.moveSpeed) * this.moveRange;
      const my = Math.sin(time * 0.6 * this.moveSpeed) * this.moveRange;

      const influence = this.userData.mouseInfluence.value;
      this.position.x = mx * (1 - influence) + mouseX * this.moveRange * influence + this.offsetX;
      this.position.y = my * (1 - influence) + mouseY * this.moveRange * influence + this.offsetY;
    } else {
      this.position.x = mouseX * this.moveRange + this.offsetX;
      this.position.y = mouseY * this.moveRange + this.offsetY;
    }
  }

  /**
   * Disposes the geometry and material to free up resources.
   */
  public dispose(): void {
    this.geometry.dispose();
    if (this.material) {
      if (Array.isArray(this.material)) {
        this.material.forEach((mat) => mat.dispose());
      } else {
        this.material.dispose();
      }
    }
  }
}

export { LightSource };
