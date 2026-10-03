import { useEffect, useRef } from "react";

/* A dotted globe behind the page. It turns slowly; scrolling blows it apart
 * into drifting particles, and it pulls itself back together once scrolling
 * stops. Raw WebGL, no library: one buffer of particles, and a vertex shader
 * that does all the motion, so a frame costs JavaScript a few uniforms.
 *
 * Colours come from CSS (--globe-* in App.css), so it follows the theme.
 * It dims behind long reading (About), fades out over the contact chat, and
 * stops drawing while hidden. */

/* How strong the globe stays while text it would sit behind is on screen. */
const DIM_BEHIND_TEXT = 0.25;

const VERTEX = `
attribute vec3 aOrigin;
attribute vec3 aTarget;
attribute float aSeed;
attribute float aAccent;

uniform float uTime;
uniform float uDisperse;
uniform vec2 uRotation;   // yaw, pitch
uniform vec2 uScale;      // globe radius in clip units, x and y
uniform float uPointSize; // device px

varying float vDepth;
varying float vAccent;
varying float vSpread;

void main() {
  // Each particle leaves on its own beat, so the globe peels apart rather
  // than inflating as one shell.
  float t = clamp((uDisperse - aSeed * 0.35) / 0.65, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec3 p = mix(aOrigin, aTarget, t);
  // Once loose, they drift.
  p += vec3(
    sin(uTime * 0.6 + aSeed * 40.0),
    cos(uTime * 0.5 + aSeed * 31.0),
    sin(uTime * 0.4 + aSeed * 23.0)
  ) * 0.05 * t;

  float cy = cos(uRotation.x), sy = sin(uRotation.x);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(uRotation.y), sx = sin(uRotation.y);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);

  float perspective = 3.2 / (3.2 - p.z);
  gl_Position = vec4(p.xy * perspective * uScale, 0.0, 1.0);
  gl_PointSize = uPointSize * perspective;

  vDepth = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);
  vAccent = aAccent;
  vSpread = t;
}
`;

const FRAGMENT = `
precision mediump float;

uniform vec3 uDot;
uniform vec3 uAccent;
uniform float uAlpha;
uniform float uGlow;

varying float vDepth;
varying float vAccent;
varying float vSpread;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float dot = 1.0 - smoothstep(0.28, 0.5, d);
  float glow = exp(-d * d * 14.0);
  float shape = mix(dot, glow, uGlow);

  // The far side of the globe is fainter, which is what reads as depth.
  float alpha = shape * uAlpha * mix(0.22, 1.0, vDepth) * (1.0 - 0.3 * vSpread);
  vec3 color = mix(uDot, uAccent, vAccent);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

/* Fibonacci sphere: evenly spaced points, no clumping at the poles. Each
 * also gets somewhere to fly to: pushed out along its own direction, then
 * bent by a smooth field, so neighbours travel together like a current
 * rather than as noise. */
function buildParticles(count) {
  const origin = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const accent = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - ((i + 0.5) / count) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * golden;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    origin.set([x, y, z], i * 3);

    const push = 1.45 + Math.random() * 1.25;
    const fx = Math.sin(3.1 * y + 1.7 * z) + 0.5 * Math.sin(5.3 * z - 2.1 * x);
    const fy = Math.sin(2.7 * z + 1.3 * x) + 0.5 * Math.sin(4.9 * x + 1.9 * y);
    const fz = Math.sin(2.3 * x + 2.9 * y) + 0.5 * Math.sin(5.7 * y - 1.1 * z);
    target.set([x * push + fx * 0.32, y * push + fy * 0.32, z * push + fz * 0.32], i * 3);

    seed[i] = Math.random();
    accent[i] = Math.random() < 0.07 ? 1 : 0;
  }
  return { origin, target, seed, accent };
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader failed to compile");
  }
  return shader;
}

/* "20 20 19" → [0.078, 0.078, 0.075] */
function readRGB(style, name, fallback) {
  const parts = style.getPropertyValue(name).trim().split(/[\s,]+/).map(Number);
  return parts.length === 3 && parts.every((n) => !Number.isNaN(n))
    ? parts.map((n) => n / 255)
    : fallback;
}

function readNumber(style, name, fallback) {
  const value = parseFloat(style.getPropertyValue(name));
  return Number.isNaN(value) ? fallback : value;
}

function readPalette() {
  const style = getComputedStyle(document.documentElement);
  return {
    dot: readRGB(style, "--globe-dot", [0.08, 0.08, 0.08]),
    accent: readRGB(style, "--globe-accent", [0.8, 0.47, 0.36]),
    alpha: readNumber(style, "--globe-alpha", 0.5),
    glow: readNumber(style, "--globe-glow", 0),
  };
}

const approach = (from, to, rate, dt) => from + (to - from) * (1 - Math.exp(-rate * dt));

export default function ParticleGlobe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    // No WebGL, no globe: it's decoration, and the page stands without it.
    if (!gl) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = window.innerWidth < 700 ? 1800 : 2800;

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    } catch (error) {
      return undefined;
    }
    gl.useProgram(program);

    const data = buildParticles(count);
    const buffers = [];
    const attribute = (name, array, size) => {
      const buffer = gl.createBuffer();
      buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    };
    attribute("aOrigin", data.origin, 3);
    attribute("aTarget", data.target, 3);
    attribute("aSeed", data.seed, 1);
    attribute("aAccent", data.accent, 1);

    const u = {};
    ["uTime", "uDisperse", "uRotation", "uScale", "uPointSize", "uDot", "uAccent", "uAlpha", "uGlow"].forEach(
      (name) => {
        u[name] = gl.getUniformLocation(program, name);
      }
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    /* --- size: the globe's radius follows the shorter side of the window */
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const radius = Math.min(width, height) * (width < 700 ? 0.42 : 0.36);
      gl.uniform2f(u.uScale, radius / (width / 2), radius / (height / 2));
      gl.uniform1f(u.uPointSize, (width < 700 ? 2.2 : 2.6) * dpr);
    };

    /* --- colour: eased toward the theme's values, so a theme flip fades */
    let palette = readPalette();
    let target = palette;
    const onTheme = () => {
      target = readPalette();
      if (reduced) {
        palette = target;
        draw();
      } else {
        wake();
      }
    };
    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", onTheme);

    /* --- motion state */
    let time = 0;
    let yaw = 0;
    let disperse = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let frame = 0;
    let hidden = false;
    let dim = 1;
    let dimTarget = 1;

    const draw = () => {
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uDisperse, disperse);
      gl.uniform2f(u.uRotation, yaw, 0.38 + Math.sin(time * 0.07) * 0.08);
      gl.uniform3fv(u.uDot, palette.dot);
      gl.uniform3fv(u.uAccent, palette.accent);
      gl.uniform1f(u.uAlpha, palette.alpha * dim);
      gl.uniform1f(u.uGlow, palette.glow);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    };

    /* Scroll speed is read off scrollY each frame, rather than from a
       scroll listener: the frame loop is running anyway. */
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      const y = window.scrollY;
      const speed = dt > 0 ? Math.abs(y - lastY) / dt : 0; // px/s
      lastY = y;
      const goal = Math.min(speed / 1600, 1);
      // Bursts apart quickly; reassembles at an unhurried pace.
      disperse = approach(disperse, goal, goal > disperse ? 7 : 2.2, dt);
      yaw += dt * (0.12 + disperse * 0.35);
      dim = approach(dim, dimTarget, 3, dt);

      palette = {
        dot: palette.dot.map((v, i) => approach(v, target.dot[i], 4, dt)),
        accent: palette.accent.map((v, i) => approach(v, target.accent[i], 4, dt)),
        alpha: approach(palette.alpha, target.alpha, 4, dt),
        glow: approach(palette.glow, target.glow, 4, dt),
      };

      draw();
      frame = hidden ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame || hidden || reduced) return;
      last = performance.now();
      lastY = window.scrollY;
      frame = requestAnimationFrame(tick);
    };

    /* --- out of the way at the bottom: once the contact chat is on screen,
       fade (CSS) and stop drawing; start again when scrolled back up. */
    const contact = document.getElementById("contact");
    let visibility;
    if (contact && "IntersectionObserver" in window) {
      visibility = new IntersectionObserver(
        ([entry]) => {
          const atChat = entry.isIntersecting || entry.boundingClientRect.top < 0;
          canvas.classList.toggle("is-hidden", atChat);
          if (atChat) {
            // Let the fade finish on screen before the loop stops.
            setTimeout(() => {
              if (canvas.classList.contains("is-hidden")) hidden = true;
            }, 700);
          } else {
            hidden = false;
            wake();
          }
        },
        // Counts as "at the chat" once it fills the lower 40% of the screen.
        { rootMargin: "0px 0px -60% 0px" }
      );
      visibility.observe(contact);
    }

    /* --- quieter behind reading: while the About copy crosses the middle
       of the screen, the globe drops back so the text stays legible. */
    const about = document.getElementById("about");
    let dimmer;
    if (about && "IntersectionObserver" in window) {
      dimmer = new IntersectionObserver(
        ([entry]) => {
          dimTarget = entry.isIntersecting ? DIM_BEHIND_TEXT : 1;
          if (reduced) {
            dim = dimTarget;
            draw();
          }
        },
        // The middle 40% of the screen.
        { rootMargin: "-30% 0px -30% 0px" }
      );
      dimmer.observe(about);
    }

    const onLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      frame = 0;
      hidden = true;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);

    resize();
    draw();
    canvas.classList.add("is-ready");
    wake();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      scheme.removeEventListener("change", onTheme);
      themeObserver.disconnect();
      if (visibility) visibility.disconnect();
      if (dimmer) dimmer.disconnect();
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="globe" aria-hidden="true" />;
}
