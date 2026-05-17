import { useRef, useEffect, useMemo } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

export const LiquidChrome = ({
  baseColor = [1.0, 1.0, 1.0], // Silver/White base
  backgroundColor = [0.0, 0.0, 0.0], // Black background by default
  speed = 0.5,
  amplitude = 1.0,
  frequencyX = 2.0,
  frequencyY = 1.5,
  interactive = true,
  ...props
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    const renderer = new Renderer({ antialias: true, alpha: true });
    const gl = renderer.gl;
    if (!gl) return;

    // Use transparent background so the theme's background color shows through
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.zIndex = '0'; 
    gl.canvas.style.pointerEvents = 'none';

    console.log("LiquidChrome initialized", { width: container.offsetWidth, height: container.offsetHeight });

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform float uSpeed;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform vec3 uBgColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      // Simple noise function
      float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      // Smooth noise
      float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // FBM for organic swirls
      float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
              v += a * smoothNoise(p);
              p *= 2.0;
              a *= 0.5;
          }
          return v;
      }

      void main() {
          vec2 uv = vUv;
          vec2 m = uMouse;
          
          // Domain warping for the "Liquid Chrome" look
          vec2 q = vec2(
              fbm(uv * 3.0 + uTime * uSpeed * 0.1),
              fbm(uv * 3.0 + vec2(1.0))
          );
          
          // Mouse/Touch distortion
          float d = distance(uv, m);
          float strength = 0.6 * exp(-d * 8.0);
          vec2 p = uv + q * 0.5 + strength * (uv - m);
          
          // Final fractal shape
          float val = fbm(p * 4.0 + uTime * uSpeed);
          
          // High contrast "Chrome" thresholding
          float chrome = pow(val, 3.0) * 2.0;
          chrome = smoothstep(0.4, 0.9, chrome);
          
          // Deep sea glow and primary highlights
          vec3 color = mix(uBgColor, uBaseColor, chrome);
          
          // Subtle edge lighting
          float edge = smoothstep(0.4, 0.5, val) * smoothstep(0.6, 0.5, val);
          color += uBaseColor * edge * 0.3;
          
          // Interaction glow
          color += uBaseColor * strength * 0.8;

          gl_FragColor = vec4(color, 1.0); // Keep it slightly transparent if desired, but 1.0 is fine
      }
    `;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
        },
        uBaseColor: { value: new Float32Array(baseColor) },
        uBgColor: { value: new Float32Array(backgroundColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
        uSpeed: { value: speed },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      renderer.setSize(w, h);
      const resUniform = program.uniforms.uResolution.value;
      resUniform[0] = w;
      resUniform[1] = h;
      resUniform[2] = w / h;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    function updateMouse(x, y) {
        program.uniforms.uMouse.value[0] = x;
        program.uniforms.uMouse.value[1] = y;
    }

    function handleMouseMove(event) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      updateMouse(x, y);
    }

    function handleTouchMove(event) {
      if (!container || !event.touches[0]) return;
      const rect = container.getBoundingClientRect();
      const x = (event.touches[0].clientX - rect.left) / rect.width;
      const y = 1 - (event.touches[0].clientY - rect.top) / rect.height;
      updateMouse(x, y);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let animationId;
    function update(t) {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    animationId = requestAnimationFrame(update);

    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (gl.canvas.parentElement) {
        gl.canvas.parentElement.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

  const { className, ...restProps } = props;
  return <div ref={containerRef} className={`w-full h-full min-h-[300px] relative overflow-hidden ${className || ''}`} {...restProps} />;
};

export default LiquidChrome;
