const DRAG_THRESHOLD = 6;
const MAX_PULL_X = 28;
const MAX_PULL_Y = 10;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
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

/* ------------------------------------------------------------------ */
/*  Interactive loss landscape: projected surface + descent traces     */
/* ------------------------------------------------------------------ */

const initGraph = (graph, prefersReducedMotion) => {
  const canvas = graph.querySelector('[data-home-graph-canvas]');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const roughnessInput = graph.querySelector('[data-home-graph-roughness]');
  const rateInput = graph.querySelector('[data-home-graph-rate]');
  const startInput = graph.querySelector('[data-home-graph-start]');

  const grid = 72;
  let descentTime = 0;
  let lastFrameTime = null;
  let viewYaw = -0.42;
  let viewPitch = 0.78;
  let targetYaw = viewYaw;
  let targetPitch = viewPitch;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let frameId = null;
  let cachedPalette = null;
  let cachedPaletteKey = '';

  const scheduleFrame = () => {
    if (frameId != null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      draw();
    });
  };

  const restartDescent = () => {
    descentTime = -0.18;
    lastFrameTime = performance.now();
    scheduleFrame();
  };

  const readControl = (input, fallback) => {
    if (!input) return fallback;
    const value = Number.parseFloat(input.value);
    if (Number.isNaN(value)) return fallback;
    return clamp(value / 100, 0, 1);
  };

  const currentSettings = () => ({
    roughness: (readControl(roughnessInput, 0.58) ** 0.72) * 1.45,
    rate: 0.003 + (readControl(rateInput, 0.3) ** 1.55) * 0.32,
    start: readControl(startInput, 0.65)
  });

  const lossAt = (x, y, roughness) => {
    const curvedValley = y - 0.46 * x * x + 0.11 * Math.sin(x * 2.1);
    const bowl = 0.12 * x * x + 0.78 * curvedValley * curvedValley;
    const broadMin = -1.18 * Math.exp(-((x + 0.14) ** 2 * 1.25 + (y - 0.02) ** 2 * 1.7));
    const localMin = -0.46 * Math.exp(-((x - 1.24) ** 2 * 2.4 + (y + 0.72) ** 2 * 2));
    const leftRidge = 0.62 * Math.exp(-((x + 1.44) ** 2 * 1.65 + (y - 1.04) ** 2 * 2.2));
    const backRidge = 0.34 * Math.exp(-((x - 0.42) ** 2 * 2 + (y - 1.34) ** 2 * 2.8));
    const island = 0.28 * Math.exp(-((x - 0.74) ** 2 * 7.8 + (y - 0.68) ** 2 * 5.6));
    const crater = -0.26 * Math.exp(-((x + 1.12) ** 2 * 5.4 + (y + 0.42) ** 2 * 6.2));
    const ring = roughness * 0.12 * Math.sin(Math.hypot(x + 0.25, y - 0.12) * 13);
    const roughEnvelope = 0.75 + 0.25 * Math.exp(-(x * x + y * y) * 0.18);
    const roughScale = roughness ** 1.04;
    const jaggedScale = Math.max(roughness - 0.62, 0) ** 1.18;
    const localBumps =
      0.22 * Math.exp(-((x - 0.58) ** 2 * 11 + (y - 0.42) ** 2 * 8)) -
      0.18 * Math.exp(-((x + 0.72) ** 2 * 8.5 + (y + 0.25) ** 2 * 10)) +
      0.16 * Math.exp(-((x - 1.18) ** 2 * 10 + (y + 0.92) ** 2 * 7.5));
    const ripples =
      roughScale * roughEnvelope * (
        0.38 * Math.sin(x * 5.1 + y * 2.8) +
        0.28 * Math.cos(x * 8.4 - y * 5.7) +
        0.19 * Math.sin((x + y) * 12.6) +
        0.16 * Math.cos(x * 19.2 - y * 14.4) +
        0.11 * Math.sin(x * 31.1 + y * 24.2) +
        0.07 * Math.cos(x * 45.3 - y * 36.8) +
        jaggedScale * (
          0.075 * Math.sin(x * 62.4 + y * 43.8) +
          0.06 * Math.cos(x * 78.2 - y * 57.1)
        ) +
        localBumps
      );

    return bowl + broadMin + localMin + leftRidge + backRidge + island + crater + ring + ripples;
  };

  const gradientAt = (x, y, roughness) => {
    const h = 0.035;
    const dx = lossAt(x + h, y, roughness) - lossAt(x - h, y, roughness);
    const dy = lossAt(x, y + h, roughness) - lossAt(x, y - h, roughness);
    return [dx / (h * 2), dy / (h * 2)];
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
    const horizontalScale = width < 580 ? 0.165 : 0.245;
    const verticalScale = width < 580 ? 0.175 : 0.23;
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
      ? { r: 30, g: 121, b: 119 }
      : { r: 42, g: 157, b: 146 };
    const high = palette.dark
      ? { r: 189, g: 244, b: 70 }
      : { r: 185, g: 195, b: 23 };
    const low = palette.dark
      ? { r: 74, g: 84, b: 165 }
      : { r: 63, g: 67, b: 120 };

    const curved = Math.pow(clamp(level, 0, 1), 0.82);
    const mixA = curved < 0.45
      ? mixRgb(low, middle, curved / 0.45)
      : mixRgb(middle, high, (curved - 0.45) / 0.55);
    const mixed = mixRgb(base, mixA, palette.dark ? 0.74 : 0.66);
    const lit = mixRgb(mixed, palette.dark ? { r: 245, g: 245, b: 245 } : { r: 255, g: 255, b: 255 }, shade);
    return rgbString(lit, palette.dark ? 0.9 : 0.86);
  };

  const descentStart = (start) => {
    const x = lerp(-1.35, 1.35, start);
    return {
      x,
      y: 1.36 + Math.sin(start * Math.PI) * 0.18
    };
  };

  const descentPath = (roughness, learningRate, start) => {
    let { x, y } = descentStart(start);
    const path = [];

    for (let step = 0; step < 78; step += 1) {
      const z = lossAt(x, y, roughness);
      path.push({ x, y, z });

      const [gx, gy] = gradientAt(x, y, roughness);
      const magnitude = Math.hypot(gx, gy);
      if (magnitude < 0.012) break;

      let stepSize = learningRate;
      let nextX = x;
      let nextY = y;
      let nextLoss = z;
      let accepted = false;

      for (let attempt = 0; attempt < 10; attempt += 1) {
        nextX = clamp(x - gx * stepSize, -1.84, 1.84);
        nextY = clamp(y - gy * stepSize, -1.84, 1.84);
        nextLoss = lossAt(nextX, nextY, roughness);

        if (nextLoss < z - 0.000001) {
          accepted = true;
          break;
        }

        stepSize *= 0.5;
      }

      if (!accepted) break;
      if (Math.abs(nextLoss - z) < 0.00002) break;

      x = nextX;
      y = nextY;
    }

    return path;
  };

  const drawSmoothPath = (path) => {
    if (path.length < 2) return;
    context.beginPath();
    context.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length - 1; i += 1) {
      const midX = (path[i].x + path[i + 1].x) * 0.5;
      const midY = (path[i].y + path[i + 1].y) * 0.5;
      context.quadraticCurveTo(path[i].x, path[i].y, midX, midY);
    }
    const last = path[path.length - 1];
    context.lineTo(last.x, last.y);
  };

  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const now = performance.now();
    const dt = lastFrameTime == null ? 16 : Math.min(now - lastFrameTime, 48);
    lastFrameTime = now;

    if (!prefersReducedMotion) {
      descentTime += dt / 1000;
    }

    if (!dragging && !prefersReducedMotion) {
      targetYaw += 0.08 * (dt / 1000);
    }

    viewYaw += (targetYaw - viewYaw) * 0.08;
    viewPitch += (targetPitch - viewPitch) * 0.08;

    const palette = getPalette();
    const settings = currentSettings();
    context.clearRect(0, 0, width, height);

    const domain = 3.9;
    const points = [];
    let zMin = Infinity;
    let zMax = -Infinity;
    const influenceX = 0;
    const influenceY = 0;

    for (let j = 0; j <= grid; j += 1) {
      for (let i = 0; i <= grid; i += 1) {
        const x = (i / grid - 0.5) * domain + influenceX;
        const y = (j / grid - 0.5) * domain + influenceY;
        const z = lossAt(x, y, settings.roughness);
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

    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const path = descentPath(settings.roughness, settings.rate, settings.start).map((point) => ({
      ...point,
      ...project(point.x, point.y, point.z)
    }));
    const cycleTime = descentTime % 5.4;
    const revealDelay = 0.62;
    const revealDuration = 4.35;
    const visiblePath = [];

    if (path.length > 0) {
      if (prefersReducedMotion || cycleTime >= revealDelay + revealDuration) {
        visiblePath.push(...path);
      } else if (cycleTime < revealDelay || path.length === 1) {
        visiblePath.push(path[0]);
      } else {
        const progress = clamp((cycleTime - revealDelay) / revealDuration, 0, 1);
        const stepProgress = progress * (path.length - 1);
        const fullSteps = Math.floor(stepProgress);
        const partialStep = stepProgress - fullSteps;

        if (fullSteps === 0 && path[1]) {
          visiblePath.push({
            x: lerp(path[0].x, path[1].x, partialStep),
            y: lerp(path[0].y, path[1].y, partialStep),
            z: lerp(path[0].z, path[1].z, partialStep)
          });
        } else {
          visiblePath.push(...path.slice(0, fullSteps + 1));
        }

        if (fullSteps > 0 && path[fullSteps + 1]) {
          const from = path[fullSteps];
          const to = path[fullSteps + 1];
          visiblePath.push({
            x: lerp(from.x, to.x, partialStep),
            y: lerp(from.y, to.y, partialStep),
            z: lerp(from.z, to.z, partialStep)
          });
        }
      }
    }

    if (visiblePath.length > 1) {
      drawSmoothPath(visiblePath);
      context.shadowColor = palette.dark ? 'rgb(0 0 0 / 0.5)' : 'rgb(255 255 255 / 0.52)';
      context.shadowBlur = 4;
      context.strokeStyle = palette.dark ? 'rgb(248 248 238 / 0.96)' : 'rgb(5 5 5 / 0.78)';
      context.lineWidth = 1.85;
      context.stroke();
      context.shadowBlur = 0;

      const head = visiblePath[visiblePath.length - 1];
      context.beginPath();
      context.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
      context.fillStyle = palette.dark ? 'rgb(248 248 238 / 0.98)' : 'rgb(5 5 5 / 0.9)';
      context.fill();
    } else if (visiblePath.length === 1) {
      const head = visiblePath[0];
      context.beginPath();
      context.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
      context.fillStyle = palette.dark ? 'rgb(248 248 238 / 0.98)' : 'rgb(5 5 5 / 0.9)';
      context.fill();
    }
    context.restore();

    if (!prefersReducedMotion || dragging) {
      scheduleFrame();
    }
  };

  const updateTarget = (event) => {
    if (!event.isPrimary) return;
    scheduleFrame();
  };

  graph.addEventListener(
    'pointerdown',
    (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      if (event.target.closest('[data-home-graph-control]')) return;
      event.preventDefault();
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      graph.setPointerCapture?.(event.pointerId);
      graph.classList.add('is-grabbing');
      updateTarget(event);
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
      updateTarget(event);
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

  [roughnessInput, rateInput, startInput].forEach((input) => {
    input?.addEventListener('input', restartDescent);
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
