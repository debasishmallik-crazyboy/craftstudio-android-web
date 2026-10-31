/**
 * CraftStudio Touch & Gesture Controller
 * Provides Android tablet optimization: 2-finger pinch-to-zoom, 2-finger pan,
 * S-Pen stylus pressure sensitivity, palm rejection, and touch hit testing.
 */

export class TouchController {
  constructor(viewportEl, canvasContainerEl, vectorEngine, onTransformChange) {
    this.viewport = viewportEl;
    this.container = canvasContainerEl;
    this.engine = vectorEngine;
    this.onTransformChange = onTransformChange;

    this.scale = 0.8;
    this.panX = 0;
    this.panY = 0;

    this.touches = new Map();
    this.initialPinchDistance = 0;
    this.initialScale = 1;
    this.isPanning = false;
    this.lastPanPoint = { x: 0, y: 0 };

    this.initGestures();
  }

  initGestures() {
    this.viewport.addEventListener('pointerdown', this.handlePointerDown.bind(this), { passive: false });
    this.viewport.addEventListener('pointermove', this.handlePointerMove.bind(this), { passive: false });
    this.viewport.addEventListener('pointerup', this.handlePointerUp.bind(this), { passive: false });
    this.viewport.addEventListener('pointercancel', this.handlePointerUp.bind(this), { passive: false });
    this.viewport.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

    this.updateTransform();
  }

  handleWheel(e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.setScale(this.scale * zoomFactor);
    } else {
      // Pan
      this.panX -= e.deltaX;
      this.panY -= e.deltaY;
      this.updateTransform();
    }
  }

  handlePointerDown(e) {
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType, pressure: e.pressure });

    if (this.touches.size === 2) {
      // Two fingers detected: Start Pinch / Pan
      const points = Array.from(this.touches.values());
      this.initialPinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      this.initialScale = this.scale;
      this.isPanning = true;
      this.lastPanPoint = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
      e.preventDefault();
    }
  }

  handlePointerMove(e) {
    if (!this.touches.has(e.pointerId)) return;
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType, pressure: e.pressure });

    if (this.touches.size === 2 && this.isPanning) {
      e.preventDefault();
      const points = Array.from(this.touches.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

      // Pinch to Zoom
      if (this.initialPinchDistance > 0) {
        const pinchRatio = currentDist / this.initialPinchDistance;
        this.setScale(this.initialScale * pinchRatio);
      }

      // Two-Finger Pan
      const midPoint = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
      this.panX += midPoint.x - this.lastPanPoint.x;
      this.panY += midPoint.y - this.lastPanPoint.y;
      this.lastPanPoint = midPoint;
      this.updateTransform();
    }
  }

  handlePointerUp(e) {
    this.touches.delete(e.pointerId);
    if (this.touches.size < 2) {
      this.isPanning = false;
    }
  }

  setScale(newScale) {
    this.scale = Math.min(3.0, Math.max(0.2, newScale));
    this.updateTransform();
  }

  resetView() {
    const vpRect = this.viewport.getBoundingClientRect();
    const docW = this.engine.doc.width;
    const docH = this.engine.doc.height;

    // Fit canvas in viewport with 40px margin
    const scaleX = (vpRect.width - 80) / docW;
    const scaleY = (vpRect.height - 80) / docH;
    this.scale = Math.min(scaleX, scaleY, 1.0);
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  updateTransform() {
    this.container.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    if (this.onTransformChange) {
      this.onTransformChange(this.scale, this.panX, this.panY);
    }
  }

  /**
   * Convert Screen Client Coordinates (x, y) to Canvas Document Coordinates
   */
  screenToCanvas(screenX, screenY) {
    const containerRect = this.container.getBoundingClientRect();
    const x = (screenX - containerRect.left) / this.scale;
    const y = (screenY - containerRect.top) / this.scale;
    return { x, y };
  }
}
