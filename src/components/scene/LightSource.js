import { CircleGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import noise from "./noise.glsl?raw";

class LightSource extends Mesh {
  constructor() {
    super();
    // Add more specific parameters for beat control
    this.userData.time = { value: 0 };
    this.userData.beatIntensity = { value: 0.5 };
    this.userData.beatFrequency = { value: 1.0 }; // Control main beat frequency
    this.userData.pulseFrequency = { value: 1.0 }; // Control slower pulse frequency
    this.userData.strobeFrequency = { value: .4 }; // Control slow strobe frequency
    this.userData.colorSpeed = { value: 0.2 }; // Control color cycling speed
    this.userData.mouseInfluence = { value: 0.5 }; // How much mouse affects light
    this.userData.mouseX = { value: 0 };
    this.userData.mouseY = { value: 0 };
    
    // Additional beat pattern controls
    this.userData.beatWeight = { value: 0.2 }; // How much the main beat affects intensity
    this.userData.pulseWeight = { value: 0.1 }; // How much the pulse affects intensity
    this.userData.strobeWeight = { value: 0.1 }; // How much the strobe affects intensity
    this.userData.baseIntensity = { value: 0.8 }; // Base light intensity (before beats)
    
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
        shader.uniforms.beatFrequency = this.userData.beatFrequency;
        shader.uniforms.pulseFrequency = this.userData.pulseFrequency;
        shader.uniforms.strobeFrequency = this.userData.strobeFrequency;
        shader.uniforms.colorMix = this.userData.colorMix;
        shader.uniforms.colorSpeed = this.userData.colorSpeed;
        shader.uniforms.mouseInfluence = this.userData.mouseInfluence;
        shader.uniforms.mouseX = this.userData.mouseX;
        shader.uniforms.mouseY = this.userData.mouseY;
        shader.uniforms.beatWeight = this.userData.beatWeight;
        shader.uniforms.pulseWeight = this.userData.pulseWeight;
        shader.uniforms.strobeWeight = this.userData.strobeWeight;
        shader.uniforms.baseIntensity = this.userData.baseIntensity;
        
        shader.fragmentShader = `
          uniform float time;
          uniform float beatIntensity;
          uniform float beatFrequency;
          uniform float pulseFrequency;
          uniform float strobeFrequency;
          uniform float colorMix;
          uniform float colorSpeed;
          uniform float mouseInfluence;
          uniform float mouseX;
          uniform float mouseY;
          uniform float beatWeight;
          uniform float pulseWeight;
          uniform float strobeWeight;
          uniform float baseIntensity;
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
          
          // Beat-driven flashing (creates pulses) - now using controllable frequencies
          float beat1 = strobe(time, beatFrequency, 5.0 * beatIntensity);
          float beat2 = pulse(time, pulseFrequency);
          float beat3 = strobe(time, strobeFrequency, 2.0 * beatIntensity);
          
          // Color cycling - now affected by colorSpeed parameter
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
          
          // Create a combined beat effect with controllable weights
          float beatEffect = beat1 * beatWeight + beat2 * pulseWeight + beat3 * strobeWeight;
          
          // Apply beat modulation to intensity - now with base intensity control
          float intensity = baseIntensity + beatEffect * (1.0 + mouseY * 0.5);
          
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
  
  // Beat intensity control
  setBeatIntensity(intensity) {
    this.userData.beatIntensity.value = Math.max(0, intensity);
  }
  
  // Main beat frequency control (fast beats)
  setBeatFrequency(frequency) {
    this.userData.beatFrequency.value = Math.max(0.1, frequency);
  }
  
  // Pulse frequency control (slower beats)
  setPulseFrequency(frequency) {
    this.userData.pulseFrequency.value = Math.max(0.1, frequency);
  }
  
  // Strobe frequency control (slow flashing)
  setStrobeFrequency(frequency) {
    this.userData.strobeFrequency.value = Math.max(0.1, frequency);
  }
  
  // Color cycling speed control
  setColorSpeed(speed) {
    this.userData.colorSpeed.value = Math.max(0, speed);
  }
  
  // Controls for beat impact weights
  setBeatWeight(weight) {
    this.userData.beatWeight.value = Math.max(0, weight);
  }
  
  setPulseWeight(weight) {
    this.userData.pulseWeight.value = Math.max(0, weight);
  }
  
  setStrobeWeight(weight) {
    this.userData.strobeWeight.value = Math.max(0, weight);
  }
  
  // Base intensity control
  setBaseIntensity(intensity) {
    this.userData.baseIntensity.value = Math.max(0, intensity);
  }
  
  // Mouse influence control
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