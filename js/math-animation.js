/**
 * Math Animation Variants
 * - BloomAnimation: superformula-based organic bloom
 * - RibbonAnimation: parametric ribbon inspired by flow fields
 */

const TAU = Math.PI * 2;

function vecAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vecSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vecScale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function vecLength(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function vecNormalize(v) {
  const length = vecLength(v) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function vecCross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

class BloomAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: false,
      willReadFrequently: false
    });

    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.offsetWidth;
    this.height = canvas.offsetHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;

    this.uSegments = 140;
    this.vSegments = 70;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.scale = Math.min(this.width, this.height) * 0.012;

    this.params = {
      m1: 8,
      n11: 0.2,
      n12: 1.6,
      n13: 1.6,
      m2: 4,
      n21: 0.4,
      n22: 1.2,
      n23: 1.2
    };

    this.animate();
    this.handleResize();
  }

  project3D(x, y, z) {
    const distance = 4.2;
    const fov = 220;
    const scale = fov / (distance + z);

    return {
      x: this.centerX + x * scale * this.scale,
      y: this.centerY + y * scale * this.scale,
      z
    };
  }

  rotateX(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x,
      y: y * cos - z * sin,
      z: y * sin + z * cos
    };
  }

  rotateY(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos + z * sin,
      y,
      z: -x * sin + z * cos
    };
  }

  rotateZ(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
      z
    };
  }

  superformula(angle, m, n1, n2, n3) {
    const a = 1;
    const b = 1;
    const part1 = Math.pow(Math.abs(Math.cos((m * angle) / 4) / a), n2);
    const part2 = Math.pow(Math.abs(Math.sin((m * angle) / 4) / b), n3);
    const denom = Math.pow(part1 + part2, 1 / n1);
    return denom === 0 ? 0 : 1 / denom;
  }

  generatePoints() {
    const points = [];

    for (let i = 0; i <= this.uSegments; i++) {
      const u = (i / this.uSegments) * TAU;
      const ring = [];

      const r1 = this.superformula(
        u,
        this.params.m1,
        this.params.n11,
        this.params.n12,
        this.params.n13
      );

      for (let j = 0; j <= this.vSegments; j++) {
        const v = -Math.PI / 2 + (j / this.vSegments) * Math.PI;
        const r2 = this.superformula(
          v * 2,
          this.params.m2,
          this.params.n21,
          this.params.n22,
          this.params.n23
        );

        const bloom = 0.8 + 0.2 * Math.sin(6 * u + 4 * v);
        const radius = 1.2 * r1 * r2 * bloom;

        let x = radius * Math.cos(u) * Math.cos(v);
        let y = radius * Math.sin(u) * Math.cos(v);
        let z = radius * Math.sin(v) * 0.75;

        const ripple = 0.12 * Math.sin(5 * u + 3 * v);
        x += ripple * Math.cos(u);
        y += ripple * Math.sin(u);
        z += ripple * 0.6;

        let rotated = this.rotateX(x, y, z, this.rotationX);
        rotated = this.rotateY(rotated.x, rotated.y, rotated.z, this.rotationY);
        rotated = this.rotateZ(rotated.x, rotated.y, rotated.z, this.rotationZ);

        ring.push(this.project3D(rotated.x, rotated.y, rotated.z));
      }

      points.push(ring);
    }

    return points;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const points = this.generatePoints();

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 0.9;

    for (let i = 0; i < points.length; i++) {
      const ring = points[i];
      this.ctx.beginPath();

      for (let j = 0; j < ring.length; j++) {
        const point = ring[j];
        const depth = Math.max(0, Math.min(1, (point.z + 2) / 4));
        this.ctx.globalAlpha = 0.18 + depth * 0.3;

        if (j === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      }

      this.ctx.stroke();
    }

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 0.7;

    for (let j = 0; j <= this.vSegments; j++) {
      this.ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const point = points[i][j];
        const depth = Math.max(0, Math.min(1, (point.z + 2) / 4));
        this.ctx.globalAlpha = 0.12 + depth * 0.2;

        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      }

      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < points.length; i += 5) {
      for (let j = 0; j < points[i].length; j += 5) {
        const point = points[i][j];
        const depth = Math.max(0, Math.min(1, (point.z + 2) / 4));
        if (depth > 0.6) {
          this.ctx.globalAlpha = (depth - 0.6) * 0.4;
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, 0.8, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    const radialGradient = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      30
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.fillStyle = radialGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 28, 0, Math.PI * 2);
    this.ctx.fill();
  }

  animate() {
    this.rotationX += 0.0012;
    this.rotationY += 0.0017;
    this.rotationZ += 0.0009;

    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const dpr = window.devicePixelRatio || 1;
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = Math.min(this.width, this.height) * 0.012;
      }, 250);
    });
  }
}

class RibbonAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: false,
      willReadFrequently: false
    });

    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.offsetWidth;
    this.height = canvas.offsetHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.targetRotationZ = 0;

    this.lengthSegments = 280;
    this.widthSegments = 45;
    this.ribbonWidth = 0.55;
    this.turns = Math.PI * 4; // Two full rotations for closed loop with visual interest

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.scale = Math.min(this.width, this.height) * 0.006;

    this.animate();
    this.handleResize();
  }

  basePoint(t) {
    const radius = 1.35 + 0.3 * Math.sin(1.4 * t) + 0.15 * Math.sin(3.3 * t);
    const x = radius * Math.cos(t);
    const y = radius * Math.sin(t);
    const z = 0.45 * Math.sin(1.1 * t) + 0.18 * Math.cos(2.8 * t);
    return { x, y, z };
  }

  project3D(point) {
    const distance = 7.5;
    const fov = 240;
    const scale = fov / (distance + point.z);
    return {
      x: this.centerX + point.x * scale * this.scale,
      y: this.centerY + point.y * scale * this.scale,
      z: point.z
    };
  }

  generatePoints() {
    const points = [];
    const epsilon = 0.0025;
    const up = { x: 0, y: 0, z: 1 };

    for (let i = 0; i <= this.widthSegments; i++) {
      const widthFactor = i / this.widthSegments - 0.5; // -0.5 to 0.5
      const spread = widthFactor * this.ribbonWidth * 2;
      const ribbonLine = [];

      for (let j = 0; j <= this.lengthSegments; j++) {
        const t = (j / this.lengthSegments) * this.turns;
        const base = this.basePoint(t);
        const next = this.basePoint(t + epsilon);
        const tangent = vecNormalize(vecSub(next, base));

        let normal = vecCross(up, tangent);
        if (vecLength(normal) < 0.001) {
          normal = { x: 1, y: 0, z: 0 };
        } else {
          normal = vecNormalize(normal);
        }
        let binormal = vecCross(tangent, normal);
        binormal = vecNormalize(binormal);

        const twist = 0.8 * Math.sin(t * 0.45) + widthFactor * 0.8;
        const offsetDir = vecNormalize(
          vecAdd(vecScale(normal, Math.cos(twist)), vecScale(binormal, Math.sin(twist)))
        );

        let point = vecAdd(base, vecScale(offsetDir, spread));

        const wave = 0.12 * Math.sin(2.3 * t + widthFactor * 3.2);
        point = vecAdd(point, vecScale(binormal, wave));

        const rotatedX = Math.cos(this.rotationX) * point.x + Math.sin(this.rotationX) * point.z;
        const rotatedZx = -Math.sin(this.rotationX) * point.x + Math.cos(this.rotationX) * point.z;
        point.x = rotatedX;
        point.z = rotatedZx;

        const rotatedY = Math.cos(this.rotationY) * point.y - Math.sin(this.rotationY) * point.z;
        const rotatedZy = Math.sin(this.rotationY) * point.y + Math.cos(this.rotationY) * point.z;
        point.y = rotatedY;
        point.z = rotatedZy;

        const rotatedZ =
          Math.cos(this.rotationZ) * point.x - Math.sin(this.rotationZ) * point.y;
        const rotatedYz =
          Math.sin(this.rotationZ) * point.x + Math.cos(this.rotationZ) * point.y;
        point.x = rotatedZ;
        point.y = rotatedYz;

        const projected = this.project3D(point);
        // Store both 3D position and projected position for depth calculations
        ribbonLine.push({
          x: projected.x,
          y: projected.y,
          z: projected.z,
          z3d: point.z // Store original 3D z for depth calculations
        });
      }

      points.push(ribbonLine);
    }

    return points;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const points = this.generatePoints();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 0; i < points.length; i++) {
      const ribbon = points[i];
      const widthFactor = i / this.widthSegments;
      
      // Calculate average depth for this ribbon
      let avgDepth = 0;
      for (let j = 0; j < ribbon.length; j++) {
        avgDepth += ribbon[j].z3d;
      }
      avgDepth /= ribbon.length;
      
      // Depth-based opacity and line weight (closer = brighter/thicker)
      const depthFactor = Math.max(0, Math.min(1, (avgDepth + 2.5) / 5));
      const baseOpacity = 0.2 + 0.25 * Math.cos(Math.PI * (widthFactor - 0.5));
      const depthOpacity = baseOpacity * (0.6 + 0.4 * depthFactor);
      const lineWeight = 0.8 + 0.6 * depthFactor; // Thicker in front
      
      // Only draw if facing camera (selective rendering)
      if (avgDepth > -1.5) { // Only draw front-facing ribbons
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
        this.ctx.lineWidth = lineWeight;
        this.ctx.globalAlpha = depthOpacity;

        this.ctx.beginPath();
        for (let j = 0; j < ribbon.length; j++) {
          const point = ribbon[j];
          if (j === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        }
        // Close the loop smoothly
        this.ctx.lineTo(ribbon[0].x, ribbon[0].y);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.lineWidth = 0.8;

    for (let j = 0; j <= this.lengthSegments; j += 8) {
      // Calculate average depth for this cross-section
      let avgDepth = 0;
      for (let i = 0; i < points.length; i++) {
        avgDepth += points[i][j].z3d;
      }
      avgDepth /= points.length;
      
      // Only draw front-facing cross-sections
      if (avgDepth > -1.5) {
        const depth = Math.max(0, Math.min(1, (avgDepth + 2.5) / 5));
        const lineWeight = 0.6 + 0.4 * depth; // Thicker in front
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.lineWidth = lineWeight;
        this.ctx.globalAlpha = 0.08 + depth * 0.15;

        this.ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const point = points[i][j];
          if (i === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        }
        // Close the cross-section loop smoothly
        this.ctx.lineTo(points[0][j].x, points[0][j].y);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }

    // Subtle center highlight (reduced)
    this.ctx.globalAlpha = 1;
    const highlight = this.ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      0,
      this.centerX,
      this.centerY,
      18
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = highlight;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 16, 0, TAU);
    this.ctx.fill();
  }

  animate() {
    // Smooth rotation with easing
    this.targetRotationX += 0.001;
    this.targetRotationY += 0.0016;
    this.targetRotationZ += 0.0008;
    
    // Ease towards target rotation for smoother motion
    const easeFactor = 0.15;
    this.rotationX += (this.targetRotationX - this.rotationX) * easeFactor;
    this.rotationY += (this.targetRotationY - this.rotationY) * easeFactor;
    this.rotationZ += (this.targetRotationZ - this.rotationZ) * easeFactor;

    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const dpr = window.devicePixelRatio || 1;
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = Math.min(this.width, this.height) * 0.006;
      }, 250);
    });
  }
}

class TorusKnotAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: false,
      willReadFrequently: false
    });

    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.offsetWidth;
    this.height = canvas.offsetHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.targetRotationZ = 0;

    // Torus knot parameters (3,2) for trefoil knot
    this.p = 3;
    this.q = 2;
    this.majorRadius = 1.2;
    this.minorRadius = 0.4;
    this.tubeRadius = 0.22;

    this.lengthSegments = 280;
    this.circleSegments = 20;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.scale = Math.min(this.width, this.height) * 0.005;

    this.animate();
    this.handleResize();
  }

  project3D(point) {
    const distance = 6;
    const fov = 200;
    const scale = fov / (distance + point.z);
    return {
      x: this.centerX + point.x * scale * this.scale,
      y: this.centerY + point.y * scale * this.scale,
      z: point.z
    };
  }

  rotateX(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x,
      y: y * cos - z * sin,
      z: y * sin + z * cos
    };
  }

  rotateY(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos + z * sin,
      y,
      z: -x * sin + z * cos
    };
  }

  rotateZ(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
      z
    };
  }

  // Generate torus knot centerline
  knotPoint(t) {
    const R = this.majorRadius;
    const r = this.minorRadius;
    const x = (R + r * Math.cos(this.q * t)) * Math.cos(this.p * t);
    const y = (R + r * Math.cos(this.q * t)) * Math.sin(this.p * t);
    const z = r * Math.sin(this.q * t);
    return { x, y, z };
  }

  generatePoints() {
    const points = [];
    const epsilon = 0.001;

    for (let i = 0; i <= this.lengthSegments; i++) {
      const t = (i / this.lengthSegments) * TAU;
      const center = this.knotPoint(t);
      const next = this.knotPoint(t + epsilon);
      
      // Calculate tangent
      const tangent = vecNormalize(vecSub(next, center));
      
      // Calculate normal (perpendicular to tangent)
      const up = { x: 0, y: 0, z: 1 };
      let normal = vecCross(up, tangent);
      if (vecLength(normal) < 0.001) {
        normal = { x: 1, y: 0, z: 0 };
      } else {
        normal = vecNormalize(normal);
      }
      
      // Calculate binormal
      let binormal = vecCross(tangent, normal);
      binormal = vecNormalize(binormal);

      const ring = [];
      for (let j = 0; j <= this.circleSegments; j++) {
        const angle = (j / this.circleSegments) * TAU;
        const offset = vecAdd(
          vecScale(normal, Math.cos(angle) * this.tubeRadius),
          vecScale(binormal, Math.sin(angle) * this.tubeRadius)
        );
        
        let point = vecAdd(center, offset);
        
        // Apply rotations
        let rotated = this.rotateX(point.x, point.y, point.z, this.rotationX);
        rotated = this.rotateY(rotated.x, rotated.y, rotated.z, this.rotationY);
        rotated = this.rotateZ(rotated.x, rotated.y, rotated.z, this.rotationZ);
        
        const projected = this.project3D(rotated);
        ring.push({
          x: projected.x,
          y: projected.y,
          z: projected.z,
          z3d: rotated.z
        });
      }
      points.push(ring);
    }

    return points;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const points = this.generatePoints();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Create surface patches with proper depth sorting for over/under crossings
    const patches = [];
    
    // Generate surface patches between adjacent rings
    for (let i = 0; i < points.length - 1; i++) {
      const ring1 = points[i];
      const ring2 = points[i + 1];
      
      for (let j = 0; j < ring1.length - 1; j++) {
        const p1 = ring1[j];
        const p2 = ring1[j + 1];
        const p3 = ring2[j + 1];
        const p4 = ring2[j];
        
        // Use minimum depth (closest point) for proper occlusion
        const minZ = Math.min(p1.z3d, p2.z3d, p3.z3d, p4.z3d);
        const avgZ = (p1.z3d + p2.z3d + p3.z3d + p4.z3d) / 4;
        
        // Enhanced lighting calculation
        const lightDir = { x: -0.4, y: -0.6, z: 0.8 };
        const lightLen = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
        const normalizedLight = { x: lightDir.x / lightLen, y: lightDir.y / lightLen, z: lightDir.z / lightLen };
        const normal = this.calculateNormal(p1, p2, p3);
        const dotProduct = normal.x * normalizedLight.x + normal.y * normalizedLight.y + normal.z * normalizedLight.z;
        const lightIntensity = Math.max(0.3, Math.min(1, dotProduct + 0.6));
        
        patches.push({
          points: [p1, p2, p3, p4],
          depth: minZ, // Use minimum for proper depth sorting
          avgDepth: avgZ,
          light: lightIntensity
        });
      }
    }
    
    // Sort patches by minimum depth (back to front) for proper occlusion
    patches.sort((a, b) => a.depth - b.depth);
    
    // Draw patches with proper over/under handling
    for (const patch of patches) {
      if (patch.depth > -4) {
        const depthFactor = Math.max(0, Math.min(1, (patch.avgDepth + 3.5) / 7));
        const baseOpacity = 0.3 + 0.4 * depthFactor;
        const lightFactor = 0.5 + 0.5 * patch.light;
        const finalOpacity = Math.min(0.8, baseOpacity * lightFactor);
        
        // Fill the patch - this creates the solid appearance
        this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(patch.points[0].x, patch.points[0].y);
        this.ctx.lineTo(patch.points[1].x, patch.points[1].y);
        this.ctx.lineTo(patch.points[2].x, patch.points[2].y);
        this.ctx.lineTo(patch.points[3].x, patch.points[3].y);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
    
    // Draw outline edges for definition - showing the continuous knot structure
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1.2;
    
    // Draw the centerline of the knot (the actual knot path)
    const centerline = [];
    for (let i = 0; i < points.length; i++) {
      const ring = points[i];
      let centerX = 0, centerY = 0, centerZ = 0;
      for (let j = 0; j < ring.length; j++) {
        centerX += ring[j].x;
        centerY += ring[j].y;
        centerZ += ring[j].z3d;
      }
      centerX /= ring.length;
      centerY /= ring.length;
      centerZ /= ring.length;
      centerline.push({ x: centerX, y: centerY, z: centerZ });
    }
    
    // Draw centerline with depth-based opacity
    for (let i = 0; i < centerline.length - 1; i++) {
      const p1 = centerline[i];
      const p2 = centerline[i + 1];
      const avgZ = (p1.z + p2.z) / 2;
      
      if (avgZ > -3) {
        const depthFactor = Math.max(0, Math.min(1, (avgZ + 3) / 6));
        this.ctx.globalAlpha = 0.4 + 0.4 * depthFactor;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    }
  }
  
  calculateNormal(p1, p2, p3) {
    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z3d - p1.z3d };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z3d - p2.z3d };
    const normal = vecCross(v1, v2);
    return vecNormalize(normal);
  }

  animate() {
    // Smooth rotation with easing
    this.targetRotationX += 0.001;
    this.targetRotationY += 0.0016;
    this.targetRotationZ += 0.0008;
    
    const easeFactor = 0.15;
    this.rotationX += (this.targetRotationX - this.rotationX) * easeFactor;
    this.rotationY += (this.targetRotationY - this.rotationY) * easeFactor;
    this.rotationZ += (this.targetRotationZ - this.rotationZ) * easeFactor;

    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const dpr = window.devicePixelRatio || 1;
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = Math.min(this.width, this.height) * 0.005;
      }, 250);
    });
  }
}

export function initMathAnimation() {
  const canvases = document.querySelectorAll('[data-math-animation]');
  canvases.forEach((canvas) => {
    const variant = (canvas.dataset.mathAnimation || 'bloom').toLowerCase();
    let AnimationClass;
    if (variant === 'ribbon') {
      AnimationClass = RibbonAnimation;
    } else if (variant === 'knot') {
      AnimationClass = TorusKnotAnimation;
    } else {
      AnimationClass = BloomAnimation;
    }
    new AnimationClass(canvas);
  });
}
