/**
 * CraftStudio Main Application Orchestrator
 * Unifies DesignCraft, VectorCraft & PhotoCraft workflows for Android Tablet & Web,
 * connected via the ChatGPT Generative AI transfer bridge.
 */

import { VectorEngine } from './engine/vector-engine.js';
import { RasterEngine } from './engine/raster-engine.js';
import { TouchController } from './engine/touch-controller.js';
import { ChatGPTBridge } from './engine/chatgpt-bridge.js';
import { ExportEngine } from './engine/export-engine.js';

class CraftStudioApp {
  constructor() {
    this.canvas = document.getElementById('paint-canvas');
    this.container = document.getElementById('canvas-container');
    this.viewport = document.getElementById('canvas-viewport');
    this.overlay = document.getElementById('selection-overlay');

    this.activeMode = 'vector'; // 'vector' or 'raster'
    this.activeTool = 'select';  // select, text, rect, ellipse, brush, hand

    this.vectorEngine = new VectorEngine(this.canvas);
    this.rasterEngine = new RasterEngine(this.vectorEngine);
    this.exportEngine = new ExportEngine(this.vectorEngine);

    this.touchController = new TouchController(
      this.viewport,
      this.container,
      this.vectorEngine,
      (scale) => this.updateZoomDisplay(scale)
    );

    this.chatBridge = new ChatGPTBridge(this.vectorEngine, (doc) => this.onDocumentUpdated(doc));

    this.isPointerDown = false;
    this.dragStart = { x: 0, y: 0 };
    this.layerStartPos = { x: 0, y: 0, width: 0, height: 0 };
    this.activeHandle = null;

    this.init();
  }

  init() {
    // 1. Initialize default canvas (1080x1350 Flyer)
    this.vectorEngine.init(1080, 1350, '#0b192c');
    this.touchController.resetView();

    // 2. Setup UI event bindings
    this.bindHeaderControls();
    this.bindToolbar();
    this.bindPropertyBar();
    this.bindCanvasInteractions();
    this.bindInspector();
    this.bindModals();

    // 3. Load default sample design if no hash present
    if (!window.location.hash) {
      this.loadSampleTemplate();
    }
  }

  bindHeaderControls() {
    // Mode Switcher (DesignCraft / VectorCraft vs PhotoCraft)
    const btnVector = document.getElementById('mode-vector');
    const btnRaster = document.getElementById('mode-raster');

    btnVector.addEventListener('click', () => {
      this.activeMode = 'vector';
      btnVector.classList.add('active');
      btnRaster.classList.remove('active');
      document.body.classList.remove('raster-active');
      this.updateInspectorTabs();
    });

    btnRaster.addEventListener('click', () => {
      this.activeMode = 'raster';
      btnRaster.classList.add('active');
      btnVector.classList.remove('active');
      document.body.classList.add('raster-active');
      this.updateInspectorTabs();
    });

    // Preset Selector
    const presetSelect = document.getElementById('preset-select');
    presetSelect.addEventListener('change', (e) => {
      const [w, h] = e.target.value.split('x').map(Number);
      if (w && h) {
        this.vectorEngine.resizeCanvas(w, h);
        this.touchController.resetView();
        this.updateSelectionOverlay();
      }
    });

    // Doc title
    const titleInput = document.getElementById('doc-title');
    titleInput.addEventListener('input', (e) => {
      this.vectorEngine.doc.title = e.target.value;
    });

    // Action Buttons
    document.getElementById('btn-import-ai').addEventListener('click', () => {
      document.getElementById('modal-import').style.display = 'flex';
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      document.getElementById('modal-export').style.display = 'flex';
    });

    document.getElementById('btn-qr-sync').addEventListener('click', () => {
      this.showQrSyncModal();
    });
  }

  bindToolbar() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        toolButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTool = btn.dataset.tool;
      });
    });
  }

  bindPropertyBar() {
    // Color Fill
    document.getElementById('prop-fill').addEventListener('input', (e) => {
      const layer = this.vectorEngine.getSelectedLayer();
      if (layer) {
        if (layer.type === 'text') layer.color = e.target.value;
        else layer.fill = e.target.value;
        this.vectorEngine.render();
      }
    });

    // Font Family
    document.getElementById('prop-font-family').addEventListener('change', (e) => {
      const layer = this.vectorEngine.getSelectedLayer();
      if (layer && layer.type === 'text') {
        layer.fontFamily = e.target.value;
        this.vectorEngine.render();
      }
    });

    // Font Size
    document.getElementById('prop-font-size').addEventListener('input', (e) => {
      const layer = this.vectorEngine.getSelectedLayer();
      if (layer && layer.type === 'text') {
        layer.fontSize = parseInt(e.target.value, 10) || 24;
        this.vectorEngine.render();
      }
    });

    // Bold / Italic
    document.getElementById('prop-bold').addEventListener('click', () => {
      const layer = this.vectorEngine.getSelectedLayer();
      if (layer && layer.type === 'text') {
        layer.fontWeight = layer.fontWeight === 'bold' ? 'normal' : 'bold';
        this.vectorEngine.render();
      }
    });

    // Opacity
    document.getElementById('prop-opacity').addEventListener('input', (e) => {
      const layer = this.vectorEngine.getSelectedLayer();
      if (layer) {
        layer.opacity = parseFloat(e.target.value);
        this.vectorEngine.render();
      }
    });
  }

  bindCanvasInteractions() {
    this.canvas.addEventListener('pointerdown', (e) => {
      const pt = this.touchController.screenToCanvas(e.clientX, e.clientY);
      this.dragStart = pt;
      this.isPointerDown = true;

      if (this.activeTool === 'select') {
        const hit = this.vectorEngine.hitTest(pt.x, pt.y);
        if (hit) {
          this.vectorEngine.selectedLayerId = hit.id;
          this.layerStartPos = { x: hit.x, y: hit.y, width: hit.width, height: hit.height };
        } else {
          this.vectorEngine.selectedLayerId = null;
        }
        this.updateSelectionOverlay();
        this.syncPropertyBar();
        this.renderLayerList();
      } else if (this.activeTool === 'rect') {
        const newLayer = this.vectorEngine.addLayer({
          type: 'rect',
          name: 'Rectangle',
          x: pt.x,
          y: pt.y,
          width: 200,
          height: 120,
          fill: '#38bdf8',
          radius: 8
        });
        this.updateSelectionOverlay();
        this.renderLayerList();
      } else if (this.activeTool === 'text') {
        const newLayer = this.vectorEngine.addLayer({
          type: 'text',
          name: 'Text Layer',
          x: pt.x,
          y: pt.y,
          text: 'Double click to edit',
          fontFamily: 'Georgia',
          fontSize: 36,
          fontWeight: 'bold',
          color: '#ffffff'
        });
        this.updateSelectionOverlay();
        this.renderLayerList();
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const pt = this.touchController.screenToCanvas(e.clientX, e.clientY);
      const layer = this.vectorEngine.getSelectedLayer();

      if (this.activeTool === 'select' && layer && !layer.locked) {
        const dx = pt.x - this.dragStart.x;
        const dy = pt.y - this.dragStart.y;
        layer.x = this.layerStartPos.x + dx;
        layer.y = this.layerStartPos.y + dy;
        this.vectorEngine.render();
        this.updateSelectionOverlay();
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isPointerDown) {
        this.isPointerDown = false;
        this.vectorEngine.recordState();
      }
    });

    // Double tap text to edit inline
    this.canvas.addEventListener('dblclick', (e) => {
      const pt = this.touchController.screenToCanvas(e.clientX, e.clientY);
      const hit = this.vectorEngine.hitTest(pt.x, pt.y);
      if (hit && hit.type === 'text') {
        const newText = prompt('Edit Text:', hit.text);
        if (newText !== null) {
          hit.text = newText;
          this.vectorEngine.render();
          this.updateSelectionOverlay();
        }
      }
    });
  }

  updateSelectionOverlay() {
    const layer = this.vectorEngine.getSelectedLayer();
    if (!layer || layer.hidden) {
      this.overlay.style.display = 'none';
      return;
    }

    const scale = this.touchController.scale;
    let x = layer.x;
    let y = layer.y;
    let w = layer.width || 200;
    let h = layer.height || 60;

    if (layer.type === 'text') {
      const fs = layer.fontSize || 32;
      w = (layer.text ? layer.text.length * (fs * 0.55) : 100);
      h = fs * 1.35;
      y = layer.y - fs;
      if (layer.align === 'center') x -= w / 2;
      else if (layer.align === 'right') x -= w;
    }

    this.overlay.style.display = 'block';
    this.overlay.style.left = `${x}px`;
    this.overlay.style.top = `${y}px`;
    this.overlay.style.width = `${w}px`;
    this.overlay.style.height = `${h}px`;
  }

  syncPropertyBar() {
    const layer = this.vectorEngine.getSelectedLayer();
    if (!layer) return;

    if (layer.type === 'text') {
      document.getElementById('prop-font-size').value = layer.fontSize || 32;
      document.getElementById('prop-fill').value = layer.color || '#ffffff';
    } else {
      document.getElementById('prop-fill').value = layer.fill || '#38bdf8';
    }
    document.getElementById('prop-opacity').value = layer.opacity !== undefined ? layer.opacity : 1.0;
  }

  bindInspector() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    // Zoom Bar Controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      this.touchController.setScale(this.touchController.scale * 1.15);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      this.touchController.setScale(this.touchController.scale * 0.85);
    });

    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      this.touchController.resetView();
    });

    // ChatGPT Sample Template Buttons
    document.getElementById('btn-load-sample-1').addEventListener('click', () => {
      this.loadSampleTemplate();
    });

    document.getElementById('btn-load-sample-2').addEventListener('click', () => {
      this.loadYoutubeSampleTemplate();
    });
  }

  loadYoutubeSampleTemplate() {
    const ytSample = {
      title: "Reverse Engineering Canva for Android",
      canvas: { width: 1280, height: 720, background: "#090d16" },
      layers: [
        {
          id: "glow_card",
          name: "Neon Card",
          type: "rect",
          x: 60,
          y: 60,
          width: 1160,
          height: 600,
          radius: 24,
          fill: "#131b2e",
          stroke: "#00f0ff",
          strokeWidth: 3
        },
        {
          id: "pill_tag",
          name: "Tag Pill",
          type: "rect",
          x: 100,
          y: 110,
          width: 380,
          height: 60,
          radius: 30,
          fill: "#f43f5e"
        },
        {
          id: "tag_label",
          name: "Tag Text",
          type: "text",
          x: 290,
          y: 150,
          text: "🔥 100% FREE NO SUBSCRIPTION",
          fontFamily: "Arial",
          fontSize: 20,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        },
        {
          id: "hook_1",
          name: "Headline",
          type: "text",
          x: 100,
          y: 270,
          text: "REPLACE COREL & ADOBE",
          fontFamily: "Georgia",
          fontSize: 68,
          fontWeight: "bold",
          color: "#ffffff",
          align: "left"
        },
        {
          id: "hook_2",
          name: "Sub Headline",
          type: "text",
          x: 100,
          y: 370,
          text: "ON YOUR ANDROID TABLET",
          fontFamily: "Georgia",
          fontSize: 64,
          fontWeight: "bold",
          color: "#00f0ff",
          align: "left"
        },
        {
          id: "ai_pill",
          name: "AI Bridge Pill",
          type: "rect",
          x: 100,
          y: 470,
          width: 640,
          height: 90,
          radius: 18,
          fill: "#10a37f"
        },
        {
          id: "ai_label",
          name: "AI Label",
          type: "text",
          x: 420,
          y: 528,
          text: "🤖 DIRECT CHATGPT TO CANVAS EXPORT",
          fontFamily: "Arial",
          fontSize: 26,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        }
      ]
    };
    this.chatBridge.loadDesign(ytSample);
  }

  renderLayerList() {
    const listEl = document.getElementById('layer-list');
    listEl.innerHTML = '';

    // Render layers top-to-bottom
    const layers = [...this.vectorEngine.doc.layers].reverse();
    layers.forEach(layer => {
      const item = document.createElement('div');
      item.className = `layer-item ${layer.id === this.vectorEngine.selectedLayerId ? 'selected' : ''}`;

      const icon = layer.type === 'text' ? '🔤' : (layer.type === 'rect' ? '⬛' : '🎨');
      item.innerHTML = `
        <div class="layer-info">
          <span>${icon}</span>
          <span>${layer.name || layer.id}</span>
        </div>
        <div class="layer-actions">
          <button class="icon-btn btn-vis" title="Toggle Visibility">${layer.hidden ? '👁️‍🗨️' : '👁️'}</button>
          <button class="icon-btn btn-del" title="Delete Layer">🗑️</button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('icon-btn')) {
          this.vectorEngine.selectedLayerId = layer.id;
          this.updateSelectionOverlay();
          this.syncPropertyBar();
          this.renderLayerList();
        }
      });

      item.querySelector('.btn-vis').addEventListener('click', (e) => {
        e.stopPropagation();
        layer.hidden = !layer.hidden;
        this.vectorEngine.render();
        this.updateSelectionOverlay();
        this.renderLayerList();
      });

      item.querySelector('.btn-del').addEventListener('click', (e) => {
        e.stopPropagation();
        this.vectorEngine.removeLayer(layer.id);
        this.updateSelectionOverlay();
        this.renderLayerList();
      });

      listEl.appendChild(item);
    });
  }

  bindModals() {
    // Close modal handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      });
    });

    // Import AI JSON button
    document.getElementById('btn-do-import').addEventListener('click', () => {
      const jsonText = document.getElementById('import-json-text').value;
      try {
        const parsed = JSON.parse(jsonText);
        this.chatBridge.loadDesign(parsed);
        document.getElementById('modal-import').style.display = 'none';
        alert('Design imported successfully!');
      } catch (err) {
        alert('Invalid JSON: ' + err.message);
      }
    });

    // Export Options
    document.getElementById('btn-export-png').addEventListener('click', () => {
      this.exportEngine.exportPNG(1);
    });
    document.getElementById('btn-export-png2x').addEventListener('click', () => {
      this.exportEngine.exportPNG(2);
    });
    document.getElementById('btn-export-svg').addEventListener('click', () => {
      this.exportEngine.exportSVG();
    });
    document.getElementById('btn-export-json').addEventListener('click', () => {
      this.exportEngine.exportJSON();
    });
  }

  showQrSyncModal() {
    const shareUrl = this.chatBridge.generateShareUrl();
    const qrUrl = this.chatBridge.getQrCodeUrl(shareUrl);

    document.getElementById('qr-img').src = qrUrl;
    document.getElementById('qr-link-input').value = shareUrl;
    document.getElementById('modal-qr').style.display = 'flex';
  }

  updateZoomDisplay(scale) {
    document.getElementById('zoom-val').textContent = `${Math.round(scale * 100)}%`;
  }

  onDocumentUpdated(doc) {
    document.getElementById('doc-title').value = doc.title || 'Untitled Design';
    this.renderLayerList();
    this.updateSelectionOverlay();
    this.touchController.resetView();
  }

  loadSampleTemplate() {
    // Load Medical Camp default template
    const sample = {
      title: "Medical Service Centre - Health Camp",
      canvas: { width: 1080, height: 1350, background: "#0b192c" },
      layers: [
        {
          id: "header_box",
          name: "Header Banner",
          type: "rect",
          x: 40,
          y: 40,
          width: 1000,
          height: 250,
          radius: 16,
          fill: "#1e3e62",
          stroke: "#f59e0b",
          strokeWidth: 3
        },
        {
          id: "org_name",
          name: "Organization Title",
          type: "text",
          x: 540,
          y: 110,
          text: "MEDICAL SERVICE CENTRE",
          fontFamily: "Georgia",
          fontSize: 42,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        },
        {
          id: "motto",
          name: "Motto",
          type: "text",
          x: 540,
          y: 160,
          text: "HOLD HIGH THE NOBLE BANNER OF MEDICAL ETHICS",
          fontFamily: "Georgia",
          fontSize: 20,
          fontWeight: "bold",
          color: "#f87171",
          align: "center"
        },
        {
          id: "camp_title",
          name: "Camp Title",
          type: "text",
          x: 540,
          y: 235,
          text: "MEGA FREE HEALTH & EYE CHECK-UP CAMP",
          fontFamily: "Georgia",
          fontSize: 34,
          fontWeight: "bold",
          color: "#facc15",
          align: "center"
        },
        {
          id: "date_badge",
          name: "Date Pill",
          type: "rect",
          x: 100,
          y: 350,
          width: 420,
          height: 80,
          radius: 40,
          fill: "#dc2626"
        },
        {
          id: "date_text",
          name: "Date Text",
          type: "text",
          x: 310,
          y: 402,
          text: "📅 SUNDAY, 15 NOV 2026",
          fontFamily: "Arial",
          fontSize: 24,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        },
        {
          id: "time_badge",
          name: "Time Pill",
          type: "rect",
          x: 560,
          y: 350,
          width: 420,
          height: 80,
          radius: 40,
          fill: "#0284c7"
        },
        {
          id: "time_text",
          name: "Time Text",
          type: "text",
          x: 770,
          y: 402,
          text: "⏰ 9:00 AM TO 4:00 PM",
          fontFamily: "Arial",
          fontSize: 24,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        },
        {
          id: "services_box",
          name: "Services Card",
          type: "rect",
          x: 80,
          y: 480,
          width: 920,
          height: 440,
          radius: 20,
          fill: "#172033",
          stroke: "#38bdf8",
          strokeWidth: 2
        },
        {
          id: "service_head",
          name: "Services Heading",
          type: "text",
          x: 540,
          y: 540,
          text: "🩺 COMPREHENSIVE CLINICAL SERVICES",
          fontFamily: "Georgia",
          fontSize: 28,
          fontWeight: "bold",
          color: "#38bdf8",
          align: "center"
        },
        {
          id: "serv_1",
          name: "Service 1",
          type: "text",
          x: 140,
          y: 620,
          text: "• General Medicine & Cardiology Consultation",
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffffff",
          align: "left"
        },
        {
          id: "serv_2",
          name: "Service 2",
          type: "text",
          x: 140,
          y: 690,
          text: "• Pediatric & Child Healthcare Screening",
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffffff",
          align: "left"
        },
        {
          id: "serv_3",
          name: "Service 3",
          type: "text",
          x: 140,
          y: 760,
          text: "• Free Random Blood Sugar (RBS) & ECG",
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffffff",
          align: "left"
        },
        {
          id: "serv_4",
          name: "Service 4",
          type: "text",
          x: 140,
          y: 830,
          text: "• Eye Refraction & Free Spectacle Distribution",
          fontFamily: "Arial",
          fontSize: 24,
          color: "#ffffff",
          align: "left"
        },
        {
          id: "footer_bar",
          name: "Footer Strip",
          type: "rect",
          x: 0,
          y: 1220,
          width: 1080,
          height: 130,
          fill: "#b91c1c"
        },
        {
          id: "footer_text",
          name: "Footer Text",
          type: "text",
          x: 540,
          y: 1295,
          text: "ALL ARE WELCOME • FREE MEDICINE DISTRIBUTION",
          fontFamily: "Georgia",
          fontSize: 28,
          fontWeight: "bold",
          color: "#ffffff",
          align: "center"
        }
      ]
    };
    this.chatBridge.loadDesign(sample);
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.craftStudio = new CraftStudioApp();
});
