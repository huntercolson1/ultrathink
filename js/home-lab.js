const PARTICLE_COUNT = 68000;
const MOBILE_PARTICLE_COUNT = 30000;
const LOOP_SECONDS = 14.5;
const DRAG_THRESHOLD = 6;
const MAX_PULL_X = 28;
const MAX_PULL_Y = 10;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const fract = (value) => value - Math.floor(value);
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};

const setRowPosition = (row, x, y) => {
  row.style.setProperty('--row-x', `${x.toFixed(2)}px`);
  row.style.setProperty('--row-y', `${y.toFixed(2)}px`);
};

const hash = (value) => fract(Math.sin(value * 127.1) * 43758.5453123);

const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

const getInkColor = (element) => {
  const styles = window.getComputedStyle(element);
  const fallback = document.documentElement.dataset.theme === 'dark' ? [0.94, 0.94, 0.94] : [0.02, 0.02, 0.02];
  const color = styles.getPropertyValue('--text-primary').trim();
  const match = color.match(/rgba?\(([^)]+)\)/);

  if (color.startsWith('#')) {
    const clean = color.slice(1);
    if (clean.length === 3 || clean.length === 6) {
      const normalized = clean.length === 3
        ? clean.split('').map((char) => char + char).join('')
        : clean;
      const value = Number.parseInt(normalized, 16);
      return [
        ((value >> 16) & 255) / 255,
        ((value >> 8) & 255) / 255,
        (value & 255) / 255
      ];
    }
  }

  if (!match) return fallback;

  const channels = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => Number.parseFloat(part) / 255);

  return channels.length === 3 && channels.every(Number.isFinite) ? channels : fallback;
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Particle shader failed: ${info}`);
  }

  return shader;
};

const createProgram = (gl, vertexSource, fragmentSource) => {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Particle program failed: ${info}`);
  }

  return program;
};

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new window.Image();
  image.decoding = 'async';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`Could not load particle target image: ${src}`));
  image.src = src;
});

const sampleMarkPoints = async (count) => {
  const assetUrl = new window.URL('../assets/icons/ultrathink-mobius.png', import.meta.url);
  const image = await loadImage(assetUrl.href);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const size = 360;
  const samples = [];

  canvas.width = size;
  canvas.height = size;
  context.drawImage(image, 0, 0, size, size);

  const pixels = context.getImageData(0, 0, size, size).data;
  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const alpha = pixels[index + 3] / 255;
      const luminance = (pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722) / 255;
      if (alpha < 0.2 || luminance < 0.12) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      const toneContrast = Math.abs(luminance - 0.62) * 1.75;
      const density = 0.34 + Math.pow(clamp(toneContrast, 0, 1), 0.7) * 0.48 + alpha * 0.1;
      if (hash2(x, y) < clamp(density, 0.3, 0.96)) {
        samples.push([x, y, luminance]);
      }
    }
  }

  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const points = new Float32Array(count * 3);
  const luma = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const sample = samples[Math.floor(hash(i + 4.7) * samples.length)] || [size / 2, size / 2, 1];
    const nx = ((sample[0] - minX) / boundsWidth - 0.5) * 1.74;
    const ny = (0.5 - (sample[1] - minY) / boundsHeight) * 0.94;
    const shadow = clamp((0.88 - sample[2]) / 0.72, 0, 1);
    const highlight = smoothstep(0.56, 0.94, sample[2]);
    const localWave = Math.sin(nx * 5.4 + ny * 2.2) * 0.075 + Math.cos(nx * 3.1 - ny * 7.1) * 0.06;
    const brightnessDepth = (highlight - shadow) * 0.15;
    const ribbonDepth = localWave + brightnessDepth;

    points[i * 3] = nx + (hash(i + 59.4) - 0.5) * 0.011;
    points[i * 3 + 1] = ny + (hash(i + 71.5) - 0.5) * 0.011;
    points[i * 3 + 2] = ribbonDepth + (hash(i + 91.3) - 0.5) * 0.05;
    luma[i] = sample[2];
  }

  return { points, luma };
};

const makeParticleData = async (count) => {
  const base = new Float32Array(count * 3);
  const logoSample = await sampleMarkPoints(count);
  const logo = logoSample.points;
  const luma = logoSample.luma;
  const seed = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const angle = hash(i + 1.1) * Math.PI * 2;
    const radius = Math.sqrt(-2 * Math.log(Math.max(hash(i + 2.2), 0.0001))) * 0.36;
    const vertical = (hash(i + 3.3) + hash(i + 13.7) + hash(i + 29.4) - 1.5) * 0.42;
    const depth = (hash(i + 4.4) + hash(i + 14.8) + hash(i + 39.2) - 1.5) * 0.72;
    const wisp = Math.max(0, hash(i + 87.1) - 0.82) * 2.8;

    base[i * 3] = Math.cos(angle) * (radius + wisp * 0.18) + Math.sin(depth * 2.4) * 0.18;
    base[i * 3 + 1] = vertical + Math.sin(angle * 1.7) * (0.11 + wisp * 0.08);
    base[i * 3 + 2] = depth + Math.sin(angle) * radius * 0.34 + wisp * (hash(i + 43.2) - 0.5);

    seed[i] = hash(i + 17.17);
  }

  return { base, logo, luma, seed };
};

const bindAttribute = (gl, program, name, data, size) => {
  const location = gl.getAttribLocation(program, name);
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

  return buffer;
};

const vertexShader = `
  precision highp float;

  attribute vec3 aBase;
  attribute vec3 aLogo;
  attribute float aSeed;
  attribute float aLuma;

  uniform float uLoopTheta;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2 uFieldScale;
  uniform float uPointerActive;
  uniform vec2 uPointer;
  uniform float uLogoWeight;
  uniform float uStarWeight;
  uniform float uExplosionWeight;
  uniform float uFlow;
  uniform float uSettle;
  uniform vec2 uTilt;
  uniform float uDarkTheme;

  varying float vAlpha;
  varying float vDepth;
  varying float vLuma;
  varying float vTonalMass;

  vec3 rotateX(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
  }

  vec3 rotateY(vec3 p, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
  }

  float rand(float value) {
    return fract(sin(value) * 43758.5453123);
  }

  void main() {
    float slow = uLoopTheta + aSeed * 6.2831853;
    float shadow = clamp((0.88 - aLuma) / 0.72, 0.0, 1.0);
    float highlight = smoothstep(0.54, 0.96, aLuma);
    float tonalMass = mix(shadow, 0.42 + highlight * 0.58, uDarkTheme);
    float starAngle = rand(aSeed * 91.17 + 2.31) * 6.2831853;
    float starZ = rand(aSeed * 63.31 + 4.19) * 2.0 - 1.0;
    float starSlice = sqrt(max(0.0, 1.0 - starZ * starZ));
    float starJitter = sin(uLoopTheta * 9.0 + aSeed * 18.0);
    float starOrbit = uLoopTheta * 7.0 + aSeed * 19.0;
    float starRadius = pow(rand(aSeed * 117.71 + 8.43), 0.3333333) * (0.043 + tonalMass * 0.026);
    vec3 starDirection = vec3(
      cos(starAngle) * starSlice,
      sin(starAngle) * starSlice,
      starZ
    );
    vec3 star = vec3(
      starDirection.x * uAspect * (0.82 + tonalMass * 0.1),
      starDirection.y * (0.9 + rand(aSeed * 53.2 + 1.4) * 0.16),
      starDirection.z * (0.86 + tonalMass * 0.18)
    ) * starRadius;
    vec3 starTangent = normalize(vec3(-starDirection.y, starDirection.x, starDirection.z * 0.26) + vec3(0.0001));
    star += starTangent * starJitter * uStarWeight * 0.012;
    star += vec3(
      cos(starOrbit) * 0.007,
      sin(starOrbit * 1.17) * 0.006,
      sin(starOrbit * 0.83) * 0.011
    ) * uStarWeight;
    vec3 burstDirection = normalize(vec3(
      aLogo.x * 1.15 + cos(starAngle) * 0.35,
      aLogo.y * 1.2 + sin(starAngle) * 0.35,
      aLogo.z + (aSeed - 0.5) * 0.75
    ));
    vec3 explosionTarget = star + burstDirection * (0.58 + aSeed * 0.82 + tonalMass * 0.22);
    explosionTarget.y -= uExplosionWeight * (0.11 + aSeed * 0.14);

    vec3 target = mix(aBase, aLogo, uLogoWeight);
    vec3 p = mix(target, star, uStarWeight);
    p = mix(p, explosionTarget, uExplosionWeight);
    float collapseCurve = uStarWeight * (1.0 - uStarWeight) * (1.0 - uExplosionWeight);
    vec3 collapseDirection = normalize(vec3(aLogo.xy, aLogo.z * 0.7) + vec3(0.0001));
    vec3 collapseTangent = normalize(vec3(-collapseDirection.y, collapseDirection.x, 0.34 * sin(aSeed * 13.0)) + vec3(0.0001));
    p += collapseTangent * collapseCurve * (0.16 + aSeed * 0.12);
    p.z += sin(uLoopTheta * 4.0 + aSeed * 12.0) * collapseCurve * 0.26;
    float logoPresence = uLogoWeight * (1.0 - uExplosionWeight) * (1.0 - uStarWeight);
    float travel = uLoopTheta * 3.0 + aLogo.x * 5.2 - aLogo.y * 2.8 + aSeed * 6.2831853;
    float shimmer = sin(travel);
    p.x += cos(travel) * uFlow * (0.024 + aSeed * 0.032);
    p.y += shimmer * uFlow * (0.018 + tonalMass * 0.018);
    p.z += sin(travel * 2.0) * uFlow * (0.14 + aSeed * 0.12);
    p.z += sin(uLoopTheta * 2.0 + aLogo.x * 3.8 + aSeed * 5.0) * logoPresence * (0.048 + uSettle * 0.035);
    p.xy += vec2(
      sin(uLoopTheta * 3.0 + aSeed * 9.0),
      cos(uLoopTheta * 2.0 + aSeed * 8.0)
    ) * uSettle * (0.012 + aSeed * 0.018);
    float burstSpin = uExplosionWeight * (0.1 + aSeed * 0.24);
    p.x += sin(uLoopTheta * 2.0 + aSeed * 14.0 + p.y * 4.1) * burstSpin;
    p.y += cos(uLoopTheta * 2.0 + aSeed * 11.0 + p.x * 3.4) * burstSpin * 0.55;
    p.z += uExplosionWeight * (aSeed - 0.5) * 1.42;
    p.z += (highlight - shadow) * 0.08 * uLogoWeight;
    p += vec3(
      sin(slow * 2.0) * 0.016,
      cos(slow) * 0.014,
      sin(slow + p.x * 3.0) * 0.025
    );

    float pitch = mix(-0.54, -0.08, uLogoWeight);
    float yaw = mix(0.4, 0.015, uLogoWeight);
    float tiltStrength = mix(1.0, 0.44, uLogoWeight);
    p = rotateX(p, pitch + uTilt.y * 0.26 * tiltStrength + sin(uLoopTheta) * 0.045);
    p = rotateY(p, yaw + uTilt.x * 0.34 * tiltStrength + sin(uLoopTheta + 1.2) * 0.08);

    vec2 screen = vec2(p.x / uAspect, p.y);
    vec2 pointerDelta = screen - uPointer;
    float pointerDistance = length(pointerDelta);
    float influence = smoothstep(0.42, 0.0, pointerDistance) * uPointerActive;
    vec2 direction = normalize(pointerDelta + vec2(0.0001));
    vec2 tangent = vec2(-direction.y, direction.x);
    float orbit = sin(uLoopTheta * 5.0 + aSeed * 12.5663706 + pointerDistance * 10.0);
    screen += direction * influence * (0.045 + aSeed * 0.08);
    screen += tangent * influence * orbit * (0.03 + aSeed * 0.04);
    p.z += influence * (0.38 + aSeed * 0.7 + tonalMass * 0.12);

    float cameraDistance = 1.88;
    float perspective = cameraDistance / (cameraDistance + p.z * 0.72);
    vec2 clip = screen * perspective * vec2(1.02, 1.2) * uFieldScale;

    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = (0.56 + aSeed * 0.82 + tonalMass * 0.58 + uDarkTheme * 0.16 + influence * 1.68) * uPixelRatio * perspective;
    vAlpha = 0.28 + aSeed * 0.3 + tonalMass * 0.46 + uDarkTheme * 0.13 + influence * 0.18;
    vDepth = clamp(p.z * 0.72 + 0.5, 0.0, 1.0);
    vLuma = aLuma;
    vTonalMass = tonalMass;
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec3 uInk;
  uniform float uDarkTheme;
  varying float vAlpha;
  varying float vDepth;
  varying float vLuma;
  varying float vTonalMass;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(centered);
    float dot = smoothstep(0.5, 0.08, distanceFromCenter);

    if (dot < 0.02) discard;

    float rim = smoothstep(0.42, 0.92, vLuma) * smoothstep(0.08, 0.55, vDepth);
    float depthLift = 0.68 + vDepth * 0.22 + vTonalMass * 0.2 + rim * 0.12 + uDarkTheme * 0.18;
    float alpha = dot * vAlpha * mix(0.84, 1.1 + uDarkTheme * 0.2, vTonalMass) * mix(1.32, 1.0, uDarkTheme);
    gl_FragColor = vec4(uInk * depthLift, alpha);
  }
`;

const initParticleGraph = async (graph, prefersReducedMotion) => {
  const canvas = graph.querySelector('[data-home-graph-canvas]');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: false,
    powerPreference: 'high-performance',
    premultipliedAlpha: false
  });

  if (!gl) {
    graph.classList.add('home-graph--fallback');
    return;
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  const particleCount = prefersReducedMotion
    ? 12000
    : (window.matchMedia?.('(width <= 600px)').matches ? MOBILE_PARTICLE_COUNT : PARTICLE_COUNT);
  const data = await makeParticleData(particleCount);
  const buffers = [
    bindAttribute(gl, program, 'aBase', data.base, 3),
    bindAttribute(gl, program, 'aLogo', data.logo, 3),
    bindAttribute(gl, program, 'aLuma', data.luma, 1),
    bindAttribute(gl, program, 'aSeed', data.seed, 1)
  ];

  const uniforms = {
    loopTheta: gl.getUniformLocation(program, 'uLoopTheta'),
    pixelRatio: gl.getUniformLocation(program, 'uPixelRatio'),
    aspect: gl.getUniformLocation(program, 'uAspect'),
    fieldScale: gl.getUniformLocation(program, 'uFieldScale'),
    pointerActive: gl.getUniformLocation(program, 'uPointerActive'),
    pointer: gl.getUniformLocation(program, 'uPointer'),
    logoWeight: gl.getUniformLocation(program, 'uLogoWeight'),
    starWeight: gl.getUniformLocation(program, 'uStarWeight'),
    explosionWeight: gl.getUniformLocation(program, 'uExplosionWeight'),
    flow: gl.getUniformLocation(program, 'uFlow'),
    settle: gl.getUniformLocation(program, 'uSettle'),
    tilt: gl.getUniformLocation(program, 'uTilt'),
    darkTheme: gl.getUniformLocation(program, 'uDarkTheme'),
    ink: gl.getUniformLocation(program, 'uInk')
  };

  const pointer = {
    active: 0,
    targetActive: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0
  };
  let frameId = null;
  let start = performance.now();
  let lastTheme = '';

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(Math.floor(rect.width * pixelRatio), 1);
    const nextHeight = Math.max(Math.floor(rect.height * pixelRatio), 1);

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  };

  const getPhaseWeights = (elapsed) => {
    if (prefersReducedMotion) {
      return { logo: 0.95, star: 0, explosion: 0, flow: 0, settle: 0, theta: 0 };
    }

    const phase = (elapsed % LOOP_SECONDS) / LOOP_SECONDS;
    const theta = phase * Math.PI * 2;
    const star = smoothstep(0.12, 0.24, phase) * (1 - smoothstep(0.25, 0.31, phase));
    const explosion = smoothstep(0.26, 0.38, phase) * (1 - smoothstep(0.48, 0.7, phase));
    const logoBefore = 1 - smoothstep(0.12, 0.25, phase);
    const logoReturn = smoothstep(0.48, 0.78, phase);
    const logo = clamp(Math.max(logoBefore, logoReturn), 0, 1);
    const assembleEnergy = smoothstep(0.46, 0.68, phase) * (1 - smoothstep(0.82, 0.98, phase));
    const settle = smoothstep(0.62, 0.78, phase) * (1 - smoothstep(0.88, 1, phase));

    return {
      logo,
      star: clamp(star, 0, 1),
      explosion: clamp(explosion, 0, 1),
      flow: clamp(0.12 + star * 0.7 + explosion * 1.0 + assembleEnergy * 0.7, 0, 1),
      settle: clamp(settle, 0, 1),
      theta
    };
  };

  const render = (now) => {
    frameId = null;
    resize();

    pointer.active += (pointer.targetActive - pointer.active) * 0.08;
    pointer.x += (pointer.targetX - pointer.x) * 0.12;
    pointer.y += (pointer.targetY - pointer.y) * 0.12;
    pointer.tiltX += (pointer.targetTiltX - pointer.tiltX) * 0.08;
    pointer.tiltY += (pointer.targetTiltY - pointer.tiltY) * 0.08;

    const elapsed = (now - start) / 1000;
    const themeKey = document.documentElement.dataset.theme || 'light';
    const ink = getInkColor(graph);
    const phase = getPhaseWeights(elapsed);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uniforms.loopTheta, phase.theta);
    gl.uniform1f(uniforms.pixelRatio, Math.min(window.devicePixelRatio || 1, 2));
    gl.uniform1f(uniforms.aspect, canvas.width / Math.max(canvas.height, 1));
    {
      const graphRect = graph.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      gl.uniform2f(
        uniforms.fieldScale,
        graphRect.width / Math.max(canvasRect.width, 1),
        graphRect.height / Math.max(canvasRect.height, 1)
      );
    }
    gl.uniform1f(uniforms.pointerActive, pointer.active);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    gl.uniform1f(uniforms.logoWeight, phase.logo);
    gl.uniform1f(uniforms.starWeight, phase.star);
    gl.uniform1f(uniforms.explosionWeight, phase.explosion);
    gl.uniform1f(uniforms.flow, clamp(phase.flow + pointer.active * 0.12, 0, 1));
    gl.uniform1f(uniforms.settle, phase.settle);
    gl.uniform2f(uniforms.tilt, pointer.tiltX, pointer.tiltY);
    gl.uniform1f(uniforms.darkTheme, themeKey === 'dark' ? 1 : 0);
    gl.uniform3f(uniforms.ink, ink[0], ink[1], ink[2]);

    if (themeKey !== lastTheme) {
      lastTheme = themeKey;
      graph.dataset.particleTheme = themeKey;
    }

    gl.drawArrays(gl.POINTS, 0, data.seed.length);

    if (!prefersReducedMotion || pointer.active > 0.01) {
      frameId = window.requestAnimationFrame(render);
    }
  };

  const schedule = () => {
    if (frameId == null) frameId = window.requestAnimationFrame(render);
  };

  const updatePointer = (event) => {
    const rect = graph.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const cssX = ((event.clientX - rect.left) / rect.width) * 100;
    const cssY = ((event.clientY - rect.top) / rect.height) * 100;

    pointer.targetX = x;
    pointer.targetY = y;
    pointer.targetTiltX = clamp(x, -1, 1);
    pointer.targetTiltY = clamp(y, -1, 1);
    pointer.targetActive = 1;
    graph.style.setProperty('--home-cursor-x', `${cssX.toFixed(2)}%`);
    graph.style.setProperty('--home-cursor-y', `${cssY.toFixed(2)}%`);
    graph.classList.add('is-influencing');
    schedule();
  };

  graph.addEventListener('pointermove', updatePointer);
  graph.addEventListener('pointerenter', updatePointer);
  graph.addEventListener('pointerleave', () => {
    pointer.targetActive = 0;
    pointer.targetTiltX = 0;
    pointer.targetTiltY = 0;
    graph.classList.remove('is-influencing');
    schedule();
  });

  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      start = performance.now() - performance.now() % 1000;
      schedule();
    }
  });

  graph.addEventListener('home-lab:destroy', () => {
    if (frameId != null) window.cancelAnimationFrame(frameId);
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteProgram(program);
  }, { once: true });

  schedule();
};

export const initHomeLab = () => {
  const lab = document.querySelector('[data-home-lab]');
  const feed = document.querySelector('[data-home-feed]');
  if (!lab || !feed || lab.dataset.homeLabReady === 'true') return;

  lab.dataset.homeLabReady = 'true';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const graph = document.querySelector('[data-home-graph]');
  const rows = Array.from(feed.querySelectorAll('.listing-entry, .home-feed-list__item'));
  let activeRow = null;
  let startX = 0;
  let startY = 0;
  let hasDragged = false;

  const resetRow = (row) => {
    row.classList.remove('is-dragging');
    row.style.removeProperty('--row-x');
    row.style.removeProperty('--row-y');
  };

  const releaseActiveRow = () => {
    if (!activeRow) return;
    resetRow(activeRow);
    activeRow = null;
  };

  if (!prefersReducedMotion) {
    lab.addEventListener('pointermove', (event) => {
      const rect = lab.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      lab.style.setProperty('--home-cursor-x', `${x.toFixed(2)}%`);
      lab.style.setProperty('--home-cursor-y', `${y.toFixed(2)}%`);
      lab.style.setProperty('--home-field-x', `${((x - 50) * 0.08).toFixed(2)}px`);
      lab.style.setProperty('--home-field-y', `${((y - 50) * 0.08).toFixed(2)}px`);
    });
  }

  if (graph) {
    initParticleGraph(graph, prefersReducedMotion).catch((error) => {
      console.error('Particle field failed to initialize', error);
      graph.classList.add('home-graph--fallback');
    });
  }

  rows.forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;

    link.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || prefersReducedMotion) return;
      activeRow = row;
      startX = event.clientX;
      startY = event.clientY;
      hasDragged = false;
      row.classList.add('is-dragging');
      link.setPointerCapture?.(event.pointerId);
    });

    link.addEventListener('pointermove', (event) => {
      if (activeRow !== row || prefersReducedMotion) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
        hasDragged = true;
      }

      setRowPosition(
        row,
        clamp(deltaX * 0.42, -MAX_PULL_X, MAX_PULL_X),
        clamp(deltaY * 0.3, -MAX_PULL_Y, MAX_PULL_Y)
      );
    });

    link.addEventListener('pointerup', (event) => {
      if (activeRow !== row) return;
      link.releasePointerCapture?.(event.pointerId);
      window.setTimeout(releaseActiveRow, 80);
    });

    link.addEventListener('pointercancel', releaseActiveRow);

    link.addEventListener('click', (event) => {
      if (!hasDragged) return;
      event.preventDefault();
      hasDragged = false;
    });
  });
};
