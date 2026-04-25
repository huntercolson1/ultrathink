const DRAG_THRESHOLD = 6;
const MAX_PULL_X = 28;
const MAX_PULL_Y = 10;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setRowPosition = (row, x, y) => {
  row.style.setProperty('--row-x', `${x.toFixed(2)}px`);
  row.style.setProperty('--row-y', `${y.toFixed(2)}px`);
};

const getGraphPalette = (graph) => {
  const styles = window.getComputedStyle(graph);
  return {
    line: styles.getPropertyValue('--home-graph-line').trim() || 'rgb(5 5 5 / 18%)',
    dot: styles.getPropertyValue('--home-graph-dot').trim() || 'rgb(5 5 5 / 78%)'
  };
};

const initGraph = (graph, prefersReducedMotion) => {
  const canvas = graph.querySelector('[data-home-graph-canvas]');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let pointerX = 0.58;
  let pointerY = 0.46;
  let targetX = pointerX;
  let targetY = pointerY;
  let dragging = false;
  let frameId = null;

  const resize = () => {
    const rect = graph.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(Math.floor(rect.width * scale), 1);
    canvas.height = Math.max(Math.floor(rect.height * scale), 1);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  };

  const draw = () => {
    const { width, height } = graph.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    pointerX += (targetX - pointerX) * 0.15;
    pointerY += (targetY - pointerY) * 0.15;
    const palette = getGraphPalette(graph);

    context.clearRect(0, 0, width, height);
    context.lineWidth = 0.5;
    context.strokeStyle = palette.line;
    context.fillStyle = palette.dot;

    const centerX = width * 0.46;
    const centerY = height * 0.54;
    const pullX = (pointerX - 0.5) * width * 0.18;
    const pullY = (pointerY - 0.5) * height * 0.18;

    for (let row = -10; row <= 10; row += 1) {
      context.beginPath();

      for (let col = 0; col <= 86; col += 1) {
        const t = (col / 86) * Math.PI * 2;
        const envelope = Math.sin((col / 86) * Math.PI);
        const amp = (height * 0.08 + Math.abs(row) * 5.4) * envelope;
        const x = width * 0.08 + (col / 86) * width * 0.82;
        const wave =
          Math.sin(t * 1.65 + row * 0.28 + pointerX * 2.2) * amp +
          Math.cos(t * 2.35 - pointerY * 2.8) * height * 0.022 * envelope;
        const pinch = Math.exp(-Math.pow((x - centerX - pullX) / (width * 0.14), 2));
        const y = centerY + row * 8.6 + wave * (0.66 - pinch * 0.5) + pullY * pinch;

        if (col === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
    }

    for (let i = 0; i < 26; i += 1) {
      const seed = i * 19.19;
      const x = width * (0.12 + ((Math.sin(seed) + 1) / 2) * 0.72);
      const y = height * (0.14 + ((Math.cos(seed * 1.7) + 1) / 2) * 0.68);
      const size = i % 7 === 0 ? 2.2 : 1.3;
      context.globalAlpha = i % 7 === 0 ? 0.78 : 0.38;
      context.fillRect(x, y, size, size);
    }

    context.globalAlpha = 1;

    if (!prefersReducedMotion || dragging) {
      frameId = window.requestAnimationFrame(draw);
    }
  };

  const updateTarget = (event) => {
    const rect = graph.getBoundingClientRect();
    targetX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    targetY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    if (!frameId) frameId = window.requestAnimationFrame(draw);
  };

  graph.addEventListener('pointerdown', (event) => {
    dragging = true;
    updateTarget(event);
    graph.setPointerCapture?.(event.pointerId);
  });

  graph.addEventListener('pointermove', updateTarget);

  graph.addEventListener('pointerup', (event) => {
    dragging = false;
    graph.releasePointerCapture?.(event.pointerId);
  });

  graph.addEventListener('pointercancel', () => {
    dragging = false;
  });

  window.addEventListener('resize', () => {
    resize();
    draw();
  });

  resize();
  draw();
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
