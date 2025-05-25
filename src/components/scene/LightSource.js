import { CircleGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import noise from "./noise.glsl?raw";

class LightSource extends Mesh {
  constructor() {
    super();
    this.userData.time = { value: 0 };
    this.userData.beatIntensity = { value: 0.5 };
    this.userData.colorMix = { value: 0 };
    this.userData.mouseInfluence = { value: 0.5 }; // How much mouse affects light
    this.userData.mouseX = { value: 0 };
    this.userData.mouseY = { value: 0 };
    
    // Default animation settings
    this.autoMove = true;
    this.moveSpeed = 1.0;
    this.moveRange = 4.0;
    
    // Create a larger circle for more impact
    let g = new CircleGeometry(50, 64);
    let m = new MeshBasicMaterial({
      color: 0xbb0000,
      onBeforeCompile: (shader) => {
        // Add custom uniforms for DJ lighting effects
        shader.uniforms.time = this.userData.time;
        shader.uniforms.beatIntensity = this.userData.beatIntensity;
        shader.uniforms.colorMix = this.userData.colorMix;
        shader.uniforms.mouseInfluence = this.userData.mouseInfluence;
        shader.uniforms.mouseX = this.userData.mouseX;
        shader.uniforms.mouseY = this.userData.mouseY;
        
        shader.fragmentShader = `
          uniform float time;
          uniform float beatIntensity;
          uniform float colorMix;
          uniform float mouseInfluence;
          uniform float mouseX;
          uniform float mouseY;
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
          
          // Mouse influence on light pattern
          float mouseFactor = mouseInfluence * 0.2;
          vec2 mouseOffset = vec2(mouseX, mouseY) * mouseFactor;
          uv += mouseOffset; // Shift light pattern based on mouse
          
          vec3 col = vec3(0);
          
          // Base light shape
          float f = smoothstep(0.5, 0.0, length(uv));
          f = pow(f, 2.0);
          
          // Noise pattern for texture
          float n = snoise(vec3(uv * 7.0, time * 0.5)) * 0.5 + 0.5;
          
          // Beat-driven flashing (creates pulses) - now affected by beatIntensity
          float beat1 = strobe(time, 8.0, 5.0 * beatIntensity);
          float beat2 = pulse(time, 2.0 * beatIntensity);
          float beat3 = strobe(time, 1.0, 2.0 * beatIntensity);
          
          // Color cycling - now affected by mouseX for more interactive control
          float colorCycle = mod(time * 0.2 + mouseX * 0.5, 4.0);
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
          
          // Apply beat modulation to intensity - now affected by mouseY
          float intensity = 0.8 + beat1 * 0.5 * (1.0 + mouseY * 0.5);
          
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
  
  // Update method that can be called from animation loop
  update(time, mouseX = 0, mouseY = 0) {
    // Update time uniform
    this.userData.time.value = time;
    
    // Update mouse position uniforms (normalized -1 to 1)
    this.userData.mouseX.value = mouseX;
    this.userData.mouseY.value = mouseY;
    
    // Calculate position based on time and mouse
    if (this.autoMove) {
      // Auto-movement base position
      const autoX = Math.cos(time * this.moveSpeed) * this.moveRange;
      const autoY = Math.sin(time * 0.6 * this.moveSpeed) * this.moveRange;
      
      // Blend with mouse position based on mouseInfluence
      const mouseInfluence = this.userData.mouseInfluence.value;
      this.position.x = autoX * (1 - mouseInfluence) + mouseX * this.moveRange * mouseInfluence;
      this.position.y = autoY * (1 - mouseInfluence) + mouseY * this.moveRange * mouseInfluence;
    } else {
      // Pure mouse control
      this.position.x = mouseX * this.moveRange;
      this.position.y = mouseY * this.moveRange;
    }
  }
  
  // Method to update beat patterns and intensity
  updateBeat(intensity) {
    this.userData.beatIntensity.value = intensity;
  }
  
  // Method to set how much mouse influences the light
  setMouseInfluence(value) {
    this.userData.mouseInfluence.value = Math.max(0, Math.min(1, value));
  }
  
  // Toggle automatic movement
  toggleAutoMove() {
    this.autoMove = !this.autoMove;
    return this.autoMove;
  }
  
  // Set movement range
  setMoveRange(range) {
    this.moveRange = range;
  }
  
  // Set movement speed
  setMoveSpeed(speed) {
    this.moveSpeed = speed;
  }
}

export { LightSource };