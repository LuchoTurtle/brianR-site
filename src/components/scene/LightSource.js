import { CircleGeometry, Mesh, MeshBasicMaterial } from "three";

class LightSource extends Mesh {
  constructor() {
    super();

    // Core parameters - reduced to essential ones
    this.userData.time = { value: 0 };
    this.userData.intensity = { value: 0.8 };
    this.userData.pulseSpeed = { value: 1.5 };
    this.userData.colorSpeed = { value: 0.2 };
    this.userData.mouseInfluence = { value: 0.5 };
    this.userData.mouseX = { value: 0 };
    this.userData.mouseY = { value: 0 };

    // Movement settings
    this.autoMove = true;
    this.moveSpeed = 1.0;
    this.moveRange = 4.0;

    // Create light geometry and material
    const geometry = new CircleGeometry(50, 32);
    const material = new MeshBasicMaterial({
      color: 0xbb0000,
      onBeforeCompile: (shader) => {
        // Add uniforms
        shader.uniforms.time = this.userData.time;
        shader.uniforms.intensity = this.userData.intensity;
        shader.uniforms.pulseSpeed = this.userData.pulseSpeed;
        shader.uniforms.colorSpeed = this.userData.colorSpeed;
        shader.uniforms.mouseInfluence = this.userData.mouseInfluence;
        shader.uniforms.mouseX = this.userData.mouseX;
        shader.uniforms.mouseY = this.userData.mouseY;

        // Add declarations to fragment shader
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
          // Replace main function
          .replace(
            `void main() {`,
            `
          // Simple noise function for texture
          float snoise(vec3 p) {
            // Simplified noise - just enough for texture variation
            float n = sin(p.x * 1.0) * 0.5 + 0.5;
            n += cos(p.y * 1.1 + p.z) * 0.5;
            n += sin((p.x + p.z) * 0.5) * 0.5;
            return n / 1.5;
          }
          
          // Color palette for light
          vec3 color1 = vec3(1.0, 0.1, 0.1);   // Red
          vec3 color2 = vec3(0.1, 0.1, 1.0);   // Blue
          vec3 color3 = vec3(1.0, 0.8, 0.0);   // Yellow
          vec3 color4 = vec3(0.9, 0.1, 0.9);   // Magenta
          
          // Simple pulse function
          float pulse(float t, float speed) {
            return (sin(t * speed) * 0.5 + 0.5);
          }
          
          void main() {`
          )
          .replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `
          // Get UV coordinates centered at 0
          vec2 uv = vUv - 0.5;
          
          // Apply mouse influence to move the light pattern
          vec2 mouseOffset = vec2(mouseX, mouseY) * mouseInfluence * 0.2;
          uv += mouseOffset;
          
          // Base light shape - circular falloff
          float lightShape = smoothstep(0.5, 0.0, length(uv));
          lightShape = pow(lightShape, 2.0);
          
          // Simple noise texture
          float noise = snoise(vec3(uv * 7.0, time * 0.5)) * 0.5 + 0.5;
          
          // Single pulse effect with speed control
          float pulseEffect = pulse(time, pulseSpeed);
          
          // Color cycling based on time and mouse
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
          
          // Calculate final light intensity
          float finalIntensity = intensity * (1.0 + pulseEffect * 0.5 + mouseY * 0.3);
          
          // Combine all effects
          vec3 col = currentColor * lightShape * finalIntensity * (noise * 0.3 + 0.7);
          
          vec4 diffuseColor = vec4(col, opacity);
          `
          );
      },
    });
    material.defines = { USE_UV: "" };

    this.geometry = geometry;
    this.material = material;
  }

  // Update method for animation loop
  update(time, mouseX = 0, mouseY = 0) {
    // Update time and mouse uniforms
    this.userData.time.value = time;
    this.userData.mouseX.value = mouseX;
    this.userData.mouseY.value = mouseY;

    // Update position
    if (this.autoMove) {
      // Blend auto-movement with mouse position
      const mx = Math.cos(time * this.moveSpeed) * this.moveRange;
      const my = Math.sin(time * 0.6 * this.moveSpeed) * this.moveRange;

      const influence = this.userData.mouseInfluence.value;
      this.position.x = mx * (1 - influence) + mouseX * this.moveRange * influence;
      this.position.y = my * (1 - influence) + mouseY * this.moveRange * influence;
    } else {
      this.position.x = mouseX * this.moveRange;
      this.position.y = mouseY * this.moveRange;
    }
  }
}

export { LightSource };
