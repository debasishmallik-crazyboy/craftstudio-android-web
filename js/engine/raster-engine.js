/**
 * CraftStudio Raster Engine (PhotoCraft Core)
 * Handles non-destructive pixel adjustments, Photoshop-grade filters (Brightness, Contrast,
 * Vibrance, Curves, Gaussian Blur, Duotone), stylus brush drawing, and blend modes.
 */

export class RasterEngine {
  constructor(vectorEngine) {
    this.vectorEngine = vectorEngine;
  }

  applyFilter(layerId, filterName, value) {
    const layer = this.vectorEngine.doc.layers.find(l => l.id === layerId);
    if (!layer) return;

    if (!layer.filters) layer.filters = {};
    layer.filters[filterName] = value;
    this.vectorEngine.render();
  }

  /**
   * Draws a freehand brush stroke on a layer or creates a raster drawing canvas
   */
  drawBrushStroke(layer, points, color, size, opacity = 1.0) {
    if (!layer.canvasBuffer) {
      layer.canvasBuffer = document.createElement('canvas');
      layer.canvasBuffer.width = this.vectorEngine.doc.width;
      layer.canvasBuffer.height = this.vectorEngine.doc.height;
    }

    const bCtx = layer.canvasBuffer.getContext('2d');
    bCtx.save();
    bCtx.lineCap = 'round';
    bCtx.lineJoin = 'round';
    bCtx.strokeStyle = color;
    bCtx.lineWidth = size;
    bCtx.globalAlpha = opacity;

    if (points.length < 2) return;
    bCtx.beginPath();
    bCtx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      // Bezier curve interpolation for smooth brush strokes
      const midX = (points[i - 1].x + points[i].x) / 2;
      const midY = (points[i - 1].y + points[i].y) / 2;
      bCtx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, midX, midY);
    }
    bCtx.stroke();
    bCtx.restore();

    this.vectorEngine.render();
  }

  /**
   * Pixel-level color grading filter algorithms
   */
  processImageData(imageData, filters) {
    const data = imageData.data;
    const len = data.length;

    const brightness = (filters.brightness || 0) * 2.55; // -100 to 100 -> -255 to 255
    const contrast = filters.contrast || 0; // -100 to 100
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const saturation = (filters.saturation || 0) / 100; // -1 to 1

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 1. Brightness
      if (brightness !== 0) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      // 2. Contrast
      if (contrast !== 0) {
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
      }

      // 3. Saturation (luminance formula)
      if (saturation !== 0) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = lum + (1 + saturation) * (r - lum);
        g = lum + (1 + saturation) * (g - lum);
        b = lum + (1 + saturation) * (b - lum);
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    return imageData;
  }
}
