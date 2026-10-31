/**
 * CraftStudio Export Engine
 * Handles high-resolution print exports (PNG 1x/2x/4x), vector SVG,
 * and project JSON serialization with zero server dependencies.
 */

export class ExportEngine {
  constructor(vectorEngine) {
    this.engine = vectorEngine;
  }

  exportPNG(scale = 1) {
    const originalWidth = this.engine.doc.width;
    const originalHeight = this.engine.doc.height;

    // Create high-res offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = originalWidth * scale;
    offscreen.height = originalHeight * scale;
    const offCtx = offscreen.getContext('2d');

    offCtx.scale(scale, scale);

    // Render background
    offCtx.fillStyle = this.engine.doc.background || '#ffffff';
    offCtx.fillRect(0, 0, originalWidth, originalHeight);

    // Temporarily swap context to render high-res
    const origCtx = this.engine.ctx;
    this.engine.ctx = offCtx;
    for (const layer of this.engine.doc.layers) {
      if (layer.hidden) continue;
      offCtx.save();
      offCtx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1.0;
      offCtx.globalCompositeOperation = layer.blendMode || 'source-over';
      this.engine.renderLayer(layer);
      offCtx.restore();
    }
    this.engine.ctx = origCtx;

    // Download PNG
    const dataUrl = offscreen.toDataURL('image/png');
    this.downloadFile(dataUrl, `${this.getSanitizedTitle()}_${scale}x.png`);
  }

  exportSVG() {
    const svgStr = this.engine.toSVG();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, `${this.getSanitizedTitle()}.svg`);
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    const jsonStr = JSON.stringify(this.engine.doc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, `${this.getSanitizedTitle()}.craft.json`);
    URL.revokeObjectURL(url);
  }

  getSanitizedTitle() {
    return (this.engine.doc.title || 'craft_design').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  }

  downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
