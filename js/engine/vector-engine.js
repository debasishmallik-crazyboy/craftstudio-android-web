/**
 * CraftStudio Vector Engine (DesignCraft & VectorCraft Core)
 * Handles object-oriented vector graphics, canvas transforms, Knuth-Plass style text blocks,
 * shapes, hit testing, bounding boxes, and SVG serialization.
 */

export class VectorEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.doc = {
      title: 'Untitled Design',
      width: 1080,
      height: 1080,
      background: '#102640',
      layers: []
    };
    this.selectedLayerId = null;
    this.isDragging = false;
    this.activeHandle = null;
    this.history = [];
    this.historyIndex = -1;
    this.dpr = window.devicePixelRatio || 1;
  }

  init(width = 1080, height = 1080, background = '#102640') {
    this.doc.width = width;
    this.doc.height = height;
    this.doc.background = background;
    this.resizeCanvas(width, height);
    this.recordState();
  }

  resizeCanvas(width, height) {
    this.doc.width = width;
    this.doc.height = height;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(this.dpr, this.dpr);
    this.render();
  }

  addLayer(layer) {
    if (!layer.id) layer.id = 'layer_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    if (layer.opacity === undefined) layer.opacity = 1.0;
    if (layer.rotation === undefined) layer.rotation = 0;
    if (layer.blendMode === undefined) layer.blendMode = 'source-over';
    this.doc.layers.push(layer);
    this.selectedLayerId = layer.id;
    this.recordState();
    this.render();
    return layer;
  }

  removeLayer(id) {
    this.doc.layers = this.doc.layers.filter(l => l.id !== id);
    if (this.selectedLayerId === id) {
      this.selectedLayerId = this.doc.layers.length > 0 ? this.doc.layers[this.doc.layers.length - 1].id : null;
    }
    this.recordState();
    this.render();
  }

  moveLayer(id, direction) {
    const idx = this.doc.layers.findIndex(l => l.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= this.doc.layers.length) return;
    const temp = this.doc.layers[idx];
    this.doc.layers[idx] = this.doc.layers[targetIdx];
    this.doc.layers[targetIdx] = temp;
    this.recordState();
    this.render();
  }

  getSelectedLayer() {
    return this.doc.layers.find(l => l.id === this.selectedLayerId) || null;
  }

  hitTest(x, y) {
    // Reverse loop to check top-most layers first
    for (let i = this.doc.layers.length - 1; i >= 0; i--) {
      const layer = this.doc.layers[i];
      if (layer.locked || layer.hidden) continue;

      if (layer.type === 'rect' || layer.type === 'badge' || layer.type === 'image') {
        if (x >= layer.x && x <= layer.x + layer.width &&
            y >= layer.y && y <= layer.y + layer.height) {
          return layer;
        }
      } else if (layer.type === 'ellipse') {
        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        const rx = layer.width / 2;
        const ry = layer.height / 2;
        if (rx > 0 && ry > 0) {
          const normX = (x - cx) / rx;
          const normY = (y - cy) / ry;
          if (normX * normX + normY * normY <= 1) return layer;
        }
      } else if (layer.type === 'text') {
        // Approximate text bounds
        const fontSize = layer.fontSize || 32;
        const width = layer.width || (layer.text ? layer.text.length * (fontSize * 0.55) : 100);
        const height = fontSize * 1.3;
        const startX = layer.align === 'center' ? layer.x - width / 2 : (layer.align === 'right' ? layer.x - width : layer.x);
        const startY = layer.y - fontSize;
        if (x >= startX && x <= startX + width && y >= startY && y <= startY + height) {
          return layer;
        }
      }
    }
    return null;
  }

  render() {
    this.ctx.clearRect(0, 0, this.doc.width, this.doc.height);

    // 1. Draw Document Canvas Background
    this.ctx.fillStyle = this.doc.background || '#ffffff';
    this.ctx.fillRect(0, 0, this.doc.width, this.doc.height);

    // 2. Render Layers in Order
    for (const layer of this.doc.layers) {
      if (layer.hidden) continue;
      this.ctx.save();
      this.ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1.0;
      this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      if (layer.rotation) {
        const cx = layer.x + (layer.width || 0) / 2;
        const cy = layer.y + (layer.height || 0) / 2;
        this.ctx.translate(cx, cy);
        this.ctx.rotate((layer.rotation * Math.PI) / 180);
        this.ctx.translate(-cx, -cy);
      }

      this.renderLayer(layer);
      this.ctx.restore();
    }
  }

  renderLayer(layer) {
    const ctx = this.ctx;
    switch (layer.type) {
      case 'rect':
      case 'badge': {
        ctx.beginPath();
        if (layer.radius && layer.radius > 0) {
          ctx.roundRect(layer.x, layer.y, layer.width, layer.height, layer.radius);
        } else {
          ctx.rect(layer.x, layer.y, layer.width, layer.height);
        }
        if (layer.fill && layer.fill !== 'none') {
          ctx.fillStyle = layer.fill;
          ctx.fill();
        }
        if (layer.stroke && layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = layer.strokeWidth;
          ctx.stroke();
        }
        break;
      }
      case 'ellipse': {
        ctx.beginPath();
        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        ctx.ellipse(cx, cy, Math.abs(layer.width / 2), Math.abs(layer.height / 2), 0, 0, Math.PI * 2);
        if (layer.fill && layer.fill !== 'none') {
          ctx.fillStyle = layer.fill;
          ctx.fill();
        }
        if (layer.stroke && layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = layer.strokeWidth;
          ctx.stroke();
        }
        break;
      }
      case 'text': {
        const fontSize = layer.fontSize || 32;
        const fontWeight = layer.fontWeight || 'normal';
        const fontFamily = layer.fontFamily || 'Georgia';
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = layer.color || '#ffffff';
        ctx.textAlign = layer.align || 'left';
        ctx.textBaseline = 'alphabetic';

        // Multi-line support
        const lines = (layer.text || '').split('\n');
        const lineHeight = fontSize * 1.35;
        lines.forEach((line, i) => {
          ctx.fillText(line, layer.x, layer.y + i * lineHeight);
        });
        break;
      }
      case 'image': {
        if (layer.imgElement) {
          ctx.drawImage(layer.imgElement, layer.x, layer.y, layer.width, layer.height);
        }
        break;
      }
    }
  }

  recordState() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.stringify(this.doc));
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.doc = JSON.parse(this.history[this.historyIndex]);
      this.render();
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.doc = JSON.parse(this.history[this.historyIndex]);
      this.render();
      return true;
    }
    return false;
  }

  toSVG() {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.doc.width} ${this.doc.height}" width="${this.doc.width}" height="${this.doc.height}">\n`;
    svg += `  <rect width="100%" height="100%" fill="${this.doc.background || '#ffffff'}"/>\n`;

    for (const layer of this.doc.layers) {
      if (layer.hidden) continue;
      const op = layer.opacity !== undefined ? `opacity="${layer.opacity}"` : '';
      if (layer.type === 'rect' || layer.type === 'badge') {
        const rx = layer.radius ? `rx="${layer.radius}"` : '';
        svg += `  <rect x="${layer.x}" y="${layer.y}" width="${layer.width}" height="${layer.height}" fill="${layer.fill || 'none'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}" ${rx} ${op}/>\n`;
      } else if (layer.type === 'ellipse') {
        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        svg += `  <ellipse cx="${cx}" cy="${cy}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${layer.fill || 'none'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}" ${op}/>\n`;
      } else if (layer.type === 'text') {
        const anchor = layer.align === 'center' ? 'middle' : (layer.align === 'right' ? 'end' : 'start');
        svg += `  <text x="${layer.x}" y="${layer.y}" font-family="${layer.fontFamily || 'Georgia'}" font-size="${layer.fontSize || 32}" font-weight="${layer.fontWeight || 'normal'}" fill="${layer.color || '#ffffff'}" text-anchor="${anchor}" ${op}>${layer.text || ''}</text>\n`;
      }
    }
    svg += `</svg>`;
    return svg;
  }
}
