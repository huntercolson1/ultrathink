const DRAG_THRESHOLD = 6;
const MAX_PULL_X = 28;
const MAX_PULL_Y = 10;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const fract = (value) => value - Math.floor(value);
const lerp = (a, b, t) => a + (b - a) * t;

const setRowPosition = (row, x, y) => {
  row.style.setProperty('--row-x', `${x.toFixed(2)}px`);
  row.style.setProperty('--row-y', `${y.toFixed(2)}px`);
};

const getGraphPalette = (graph) => {
  const styles = window.getComputedStyle(graph);
  const dark = document.documentElement.dataset.theme === 'dark';

  return {
    dark,
    paper: styles.getPropertyValue('--bg-color').trim() || (dark ? '#0a0a0a' : '#fff'),
    ink: styles.getPropertyValue('--text-primary').trim() || (dark ? '#f0f0f0' : '#050505'),
    muted: styles.getPropertyValue('--text-secondary').trim() || (dark ? '#888' : '#333'),
    ridge: styles.getPropertyValue('--home-graph-ridge').trim() || (dark ? '210 100% 72%' : '189 96% 31%'),
    basin: styles.getPropertyValue('--home-graph-basin').trim() || (dark ? '145 100% 61%' : '159 96% 29%'),
    summit: styles.getPropertyValue('--home-graph-summit').trim() || (dark ? '68 100% 63%' : '63 94% 41%')
  };
};

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 3 && clean.length !== 6) return null;
  const normalized = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
};

const colorToRgb = (cssColor) => {
  if (cssColor.startsWith('#')) return hexToRgb(cssColor);

  const match = cssColor.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => Number.parseFloat(part));

  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return { r: parts[0], g: parts[1], b: parts[2] };
};

const rgbString = ({ r, g, b }, alpha = 1) => `rgb(${r} ${g} ${b} / ${alpha})`;

const mixRgb = (a, b, amount) => ({
  r: Math.round(lerp(a.r, b.r, amount)),
  g: Math.round(lerp(a.g, b.g, amount)),
  b: Math.round(lerp(a.b, b.b, amount))
});

const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

const valueNoise = (x, y) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fract(x);
  const fy = fract(y);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
};

const ridgeNoise = (x, y) => 1 - Math.abs(valueNoise(x, y));

const fbmNoise = (x, y) => (
  0.56 * valueNoise(x, y) +
  0.28 * valueNoise(x * 2.03 + 11.2, y * 2.03 - 4.7) +
  0.13 * valueNoise(x * 4.07 - 5.4, y * 4.07 + 8.9) +
  0.07 * valueNoise(x * 8.11 + 2.1, y * 8.11 + 6.3)
);

const spikeNoise = (x, y, frequency) => {
  const gx = Math.floor(x * frequency);
  const gy = Math.floor(y * frequency);
  let total = 0;

  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const cellX = gx + ox;
      const cellY = gy + oy;
      const px = (cellX + hash2(cellX + 19.17, cellY - 31.81)) / frequency;
      const py = (cellY + hash2(cellX - 47.53, cellY + 13.29)) / frequency;
      const height = hash2(cellX + 71.3, cellY - 5.9);
      const polarity = height > 0.31 ? 1 : -0.72;
      const distance = Math.hypot((x - px) * frequency, (y - py) * frequency);
      const influence = Math.max(0, 1 - distance * 1.45);
      total += polarity * (0.18 + height * 0.82) * influence ** 3.2;
    }
  }

  return total;
};

/* ------------------------------------------------------------------ */
/*  Loss landscape: projected surface with drag-to-rotate             */
/* ------------------------------------------------------------------ */

const initGraph = (graph, prefersReducedMotion) => {
  const canvas = graph.querySelector('[data-home-graph-canvas]');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const grid = 96;
  let viewYaw = -0.42;
  let viewPitch = 0.78;
  let targetYaw = viewYaw;
  let targetPitch = viewPitch;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastFrameTime = null;
  let frameId = null;
  let cachedPalette = null;
  let cachedPaletteKey = '';

  const roughness = 1.38;

  const scheduleFrame = () => {
    if (frameId != null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      draw();
    });
  };

  const lossAt = (x, y) => {
    const curvedValley = y - 0.46 * x * x + 0.11 * Math.sin(x * 2.1);
    const bowl = 0.13 * x * x + 0.82 * curvedValley * curvedValley;
    const broadMin = -1.28 * Math.exp(-((x + 0.14) ** 2 * 1.25 + (y - 0.02) ** 2 * 1.7));
    const localMin = -0.5 * Math.exp(-((x - 1.24) ** 2 * 2.4 + (y + 0.72) ** 2 * 2));
    const leftRidge = 0.7 * Math.exp(-((x + 1.44) ** 2 * 1.65 + (y - 1.04) ** 2 * 2.2));
    const backRidge = 0.4 * Math.exp(-((x - 0.42) ** 2 * 2 + (y - 1.34) ** 2 * 2.8));
    const island = 0.34 * Math.exp(-((x - 0.74) ** 2 * 7.8 + (y - 0.68) ** 2 * 5.6));
    const crater = -0.3 * Math.exp(-((x + 1.12) ** 2 * 5.4 + (y + 0.42) ** 2 * 6.2));
    const ring = roughness * 0.15 * Math.sin(Math.hypot(x + 0.25, y - 0.12) * 13.8);
    const roughEnvelope = 0.82 + 0.28 * Math.exp(-(x * x + y * y) * 0.18);
    const roughScale = roughness ** 1.04;
    const jaggedScale = Math.max(roughness - 0.62, 0) ** 1.18;
    const noiseWarpX = x + 0.24 * valueNoise(x * 1.9 + 9.1, y * 1.9 - 2.6);
    const noiseWarpY = y + 0.24 * valueNoise(x * 1.7 - 4.4, y * 1.7 + 7.8);

    const saddleA = 0.23 * Math.exp(-((x - 0.35) ** 2 * 3.2 + (y + 0.48) ** 2 * 2.8));
    const saddleB = -0.18 * Math.exp(-((x + 0.88) ** 2 * 4.1 + (y - 0.62) ** 2 * 3.5));
    const plateau = 0.26 * Math.exp(-((x + 0.52) ** 2 * 1.8 + (y + 1.05) ** 2 * 1.6));
    const sharpMin = -0.38 * Math.exp(-((x - 0.18) ** 2 * 9.5 + (y - 0.92) ** 2 * 8.2));

    const localBumps =
      0.27 * Math.exp(-((x - 0.58) ** 2 * 11 + (y - 0.42) ** 2 * 8)) -
      0.22 * Math.exp(-((x + 0.72) ** 2 * 8.5 + (y + 0.25) ** 2 * 10)) +
      0.2 * Math.exp(-((x - 1.18) ** 2 * 10 + (y + 0.92) ** 2 * 7.5));
    const microPeaks = jaggedScale * (
      0.18 * Math.max(0, Math.sin(x * 18.4 + y * 27.1)) ** 3 -
      0.14 * Math.max(0, Math.cos(x * 24.6 - y * 16.8)) ** 3 +
      0.13 * Math.max(0, Math.sin(x * 38.5 - y * 29.2)) ** 4
    );
    const fracturedField = jaggedScale * (
      0.62 * fbmNoise(noiseWarpX * 5.2, noiseWarpY * 5.2) +
      0.42 * ridgeNoise(noiseWarpX * 8.4 + 3.1, noiseWarpY * 8.4 - 5.8) +
      0.28 * spikeNoise(noiseWarpX + 8.6, noiseWarpY - 3.2, 5.4) +
      0.18 * spikeNoise(noiseWarpX - 2.1, noiseWarpY + 6.7, 9.2)
    );
    const ripples =
      roughScale * roughEnvelope * (
        0.43 * Math.sin(x * 5.1 + y * 2.8) +
        0.32 * Math.cos(x * 8.4 - y * 5.7) +
        0.22 * Math.sin((x + y) * 12.6) +
        0.19 * Math.cos(x * 19.2 - y * 14.4) +
        0.13 * Math.sin(x * 31.1 + y * 24.2) +
        0.09 * Math.cos(x * 45.3 - y * 36.8) +
        jaggedScale * (
          0.09 * Math.sin(x * 62.4 + y * 43.8) +
          0.075 * Math.cos(x * 78.2 - y * 57.1)
        ) +
        microPeaks +
        fracturedField +
        localBumps
      );

    return bowl + broadMin + localMin + leftRidge + backRidge + island + crater + ring
      + saddleA + saddleB + plateau + sharpMin + ripples;
  };

  const getPalette = () => {
    const palette = getGraphPalette(graph);
    const key = `${palette.paper}|${palette.ink}|${palette.muted}|${palette.dark}`;
    if (key === cachedPaletteKey && cachedPalette) return cachedPalette;

    const paperRgb = colorToRgb(palette.paper) || (palette.dark ? { r: 10, g: 10, b: 10 } : { r: 255, g: 255, b: 255 });
    const inkRgb = colorToRgb(palette.ink) || (palette.dark ? { r: 240, g: 240, b: 240 } : { r: 5, g: 5, b: 5 });
    const mutedRgb = colorToRgb(palette.muted) || (palette.dark ? { r: 136, g: 136, b: 136 } : { r: 51, g: 51, b: 51 });

    cachedPaletteKey = key;
    cachedPalette = {
      ...palette,
      paperRgb,
      inkRgb,
      mutedRgb
    };
    return cachedPalette;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(Math.floor(rect.width * scale), 1);
    canvas.height = Math.max(Math.floor(rect.height * scale), 1);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };

  const projectFactory = (width, height, zMin, zMax) => {
    const size = Math.min(width, height);
    const horizontalScale = width < 580 ? 0.18 : 0.265;
    const verticalScale = width < 580 ? 0.19 : 0.255;
    const scale = size * horizontalScale;
    const zScale = size * verticalScale;
    const cx = width * 0.51;
    const cy = height * 0.56;
    const cosYaw = Math.cos(viewYaw);
    const sinYaw = Math.sin(viewYaw);
    const cosPitch = Math.cos(viewPitch);
    const sinPitch = Math.sin(viewPitch);

    return (x, y, z) => {
      const nx = x * cosYaw - y * sinYaw;
      const ny = x * sinYaw + y * cosYaw;
      const nz = (z - zMin) / Math.max(zMax - zMin, 0.0001) - 0.5;
      const py = ny * cosPitch - nz * sinPitch * 1.45;
      const depth = ny * sinPitch + nz * cosPitch;

      return {
        x: cx + nx * scale,
        y: cy + py * scale * 0.78 - nz * zScale,
        depth
      };
    };
  };

  const surfaceColor = (level, shade, palette) => {
    const base = palette.dark
      ? { r: 15, g: 22, b: 23 }
      : { r: 236, g: 242, b: 239 };
    const middle = palette.dark
      ? { r: 29, g: 144, b: 139 }
      : { r: 42, g: 157, b: 146 };
    const high = palette.dark
      ? { r: 218, g: 248, b: 68 }
      : { r: 185, g: 195, b: 23 };
    const low = palette.dark
      ? { r: 58, g: 84, b: 174 }
      : { r: 63, g: 67, b: 120 };

    const curved = Math.pow(clamp(level, 0, 1), 0.82);
    const mixA = curved < 0.45
      ? mixRgb(low, middle, curved / 0.45)
      : mixRgb(middle, high, (curved - 0.45) / 0.55);
    const mixed = mixRgb(base, mixA, palette.dark ? 0.82 : 0.7);
    const lit = mixRgb(mixed, palette.dark ? { r: 245, g: 245, b: 245 } : { r: 255, g: 255, b: 255 }, shade);
    return rgbString(lit, palette.dark ? 0.94 : 0.88);
  };

  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const now = performance.now();
    const dt = lastFrameTime == null ? 16 : Math.min(now - lastFrameTime, 48);
    lastFrameTime = now;

    if (!dragging && !prefersReducedMotion) {
      targetYaw += 0.08 * (dt / 1000);
    }

    viewYaw += (targetYaw - viewYaw) * 0.08;
    viewPitch += (targetPitch - viewPitch) * 0.08;

    const palette = getPalette();
    context.clearRect(0, 0, width, height);

    const domain = 3.9;
    const points = [];
    let zMin = Infinity;
    let zMax = -Infinity;

    for (let j = 0; j <= grid; j += 1) {
      for (let i = 0; i <= grid; i += 1) {
        const x = (i / grid - 0.5) * domain;
        const y = (j / grid - 0.5) * domain;
        const z = lossAt(x, y);
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
        points.push({ x, y, z });
      }
    }

    const project = projectFactory(width, height, zMin, zMax);
    const projected = points.map((point) => ({
      ...point,
      ...project(point.x, point.y, point.z)
    }));

    const cells = [];
    for (let j = 0; j < grid; j += 1) {
      for (let i = 0; i < grid; i += 1) {
        const a = projected[j * (grid + 1) + i];
        const b = projected[j * (grid + 1) + i + 1];
        const c = projected[(j + 1) * (grid + 1) + i + 1];
        const d = projected[(j + 1) * (grid + 1) + i];
        const z = (a.z + b.z + c.z + d.z) / 4;
        const depth = (a.depth + b.depth + c.depth + d.depth) / 4;
        cells.push({ a, b, c, d, z, depth });
      }
    }

    cells.sort((a, b) => a.depth - b.depth);

    context.save();
    context.lineJoin = 'round';
    context.lineCap = 'round';
    for (const cell of cells) {
      const level = (cell.z - zMin) / Math.max(zMax - zMin, 0.0001);
      const shade = clamp((cell.depth + 1.4) * 0.05, 0.02, 0.16);
      context.beginPath();
      context.moveTo(cell.a.x, cell.a.y);
      context.lineTo(cell.b.x, cell.b.y);
      context.lineTo(cell.c.x, cell.c.y);
      context.lineTo(cell.d.x, cell.d.y);
      context.closePath();
      context.fillStyle = surfaceColor(level, shade, palette);
      context.fill();
    }

    const meshAlpha = palette.dark ? 0.18 : 0.2;
    context.strokeStyle = rgbString(palette.inkRgb, meshAlpha);
    context.lineWidth = 0.35;
    for (let j = 0; j <= grid; j += 3) {
      context.beginPath();
      for (let i = 0; i <= grid; i += 1) {
        const point = projected[j * (grid + 1) + i];
        if (i === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }

    for (let i = 0; i <= grid; i += 3) {
      context.beginPath();
      for (let j = 0; j <= grid; j += 1) {
        const point = projected[j * (grid + 1) + i];
        if (j === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }
    context.restore();

    if (!prefersReducedMotion || dragging) {
      scheduleFrame();
    }
  };

  graph.addEventListener(
    'pointerdown',
    (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      graph.setPointerCapture?.(event.pointerId);
      graph.classList.add('is-grabbing');
      scheduleFrame();
    },
    { passive: false }
  );

  graph.addEventListener(
    'pointermove',
    (event) => {
      if (!event.isPrimary) return;
      if (dragging) {
        event.preventDefault();
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        targetYaw += dx * 0.006;
        targetPitch = clamp(targetPitch + dy * 0.0035, 0.58, 1.18);
      }
      scheduleFrame();
    },
    { passive: false }
  );

  const endDrag = (event) => {
    if (!event.isPrimary || !dragging) return;
    dragging = false;
    graph.releasePointerCapture?.(event.pointerId);
    graph.classList.remove('is-grabbing');
    scheduleFrame();
  };

  graph.addEventListener('pointerup', endDrag);
  graph.addEventListener('pointercancel', endDrag);
  graph.addEventListener('lostpointercapture', () => {
    dragging = false;
    graph.classList.remove('is-grabbing');
  });

  window.addEventListener('resize', () => {
    resize();
    scheduleFrame();
  });

  resize();
  scheduleFrame();
};

export const initHomeLab = () => {
  const lab = document.querySelector('[data-home-lab]');
  const feed = document.querySelector('[data-home-feed]');
  if (!lab || !feed || lab.dataset.homeLabReady === 'true') return;

  lab.dataset.homeLabReady = 'true';

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const graph = document.querySelector('[data-home-graph]');
  const rows = Array.from(feed.querySelectorAll('.home-feed-list__item'));
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
    initGraph(graph, prefersReducedMotion);
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
