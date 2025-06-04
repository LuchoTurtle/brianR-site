import { CircleGeometry, Mesh, MeshBasicMaterial } from "three";

class LightSource extends Mesh {
  constructor() {
    super();

    // Shader uniforms - userData automatically passes to GPU
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

    // Position offset for right-top positioning
    this.offsetX = 45; // Move right
    this.offsetY = 15; // Move up

    const geometry = new CircleGeometry(50, 32);
    const material = new MeshBasicMaterial({
      color: 0xbb0000,
      onBeforeCompile: (shader) => {
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
      },
    });
    // Required for UV coordinates in shader
    material.defines = { USE_UV: "" };

    this.geometry = geometry;
    this.material = material;
  }

  update(time, mouseX = 0, mouseY = 0) {
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
}

export { LightSource };