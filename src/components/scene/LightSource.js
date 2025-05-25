import { CircleGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import noise from "./noise.glsl?raw";

class LightSource extends Mesh {
  constructor() {
    super();
    this.userData.time = { value: 0 };
    this.userData.beatIntensity = { value: 0 };
    this.userData.colorMix = { value: 0 };
    
    // Create a larger circle for more impact
    let g = new CircleGeometry(50, 64);
    let m = new MeshBasicMaterial({
      color: 0xbb0000,
      onBeforeCompile: (shader) => {
        // Add custom uniforms for DJ lighting effects
        shader.uniforms.time = this.userData.time;
        shader.uniforms.beatIntensity = this.userData.beatIntensity;
        shader.uniforms.colorMix = this.userData.colorMix;
        
        shader.fragmentShader = `
          uniform float time;
          uniform float beatIntensity;
          uniform float colorMix;
          ${shader.fragmentShader}
        `
          .replace(
            `void main() {`,
            `
          ${noise}
          
          // Color palette for DJ lights
          vec3 color1 = vec3(1.0, 0.1, 0.1);   // Red
          vec3 color2 = vec3(0.1, 0.1, 1.0);   // Blue
          vec3 color3 = vec3(1.0, 0.8, 0.0);   // Yellow/Gold
          vec3 color4 = vec3(0.9, 0.1, 0.9);   // Magenta
          
          // Strobe and pattern functions
          float strobe(float t, float freq, float sharpness) {
            return pow(sin(t * freq) * 0.5 + 0.5, sharpness);
          }
          
          float pulse(float t, float freq) {
            float x = mod(t * freq, 3.14159 * 2.0);
            return smoothstep(0.0, 1.0, sin(x) * 0.5 + 0.5);
          }
          
          void main() {`
          )
          .replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
          vec2 uv = vUv - 0.5;
          vec3 col = vec3(0);
          
          // Base light shape
          float f = smoothstep(0.5, 0.0, length(uv));
          f = pow(f, 2.0);
          
          // Noise pattern for texture
          float n = snoise(vec3(uv * 7.0, time * 0.5)) * 0.5 + 0.5;
          
          // Beat-driven flashing (creates pulses)
          float beat1 = strobe(time, 8.0, 5.0);
          float beat2 = pulse(time, 2.0);
          float beat3 = strobe(time, 1.0, 2.0);
          
          // Color cycling
          float colorCycle = mod(time * 0.2, 4.0);
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
          
          // Apply beat modulation to intensity
          float intensity = 0.8 + beat1 * 0.5;
          
          // Special strobe effect every few seconds
          if (mod(time, 10.0) > 9.0) {
            intensity *= strobe(time, 20.0, 1.0) * 2.0;
          }
          
          // Apply color and effects
          col = currentColor * f * intensity * (n * 0.5 + 0.5);
          
          vec4 diffuseColor = vec4(col, opacity);
          `
          );
      }
    });
    m.defines = { USE_UV: "" };
    this.geometry = g;
    this.material = m;
  }
  
  // Add a method to update beat patterns if you want to sync with music
  updateBeat(intensity) {
    this.userData.beatIntensity.value = intensity;
  }
}

export { LightSource };