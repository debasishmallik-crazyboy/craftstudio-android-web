/**
 * CraftStudio ChatGPT Generative AI Bridge
 * Reverse-engineered from Canva's ChatGPT integration:
 * Decodes incoming URL hash (#design=...), validates layer schemas,
 * enables bidirectional JSON import/export, and generates mobile QR transfer links.
 */

export class ChatGPTBridge {
  constructor(vectorEngine, onDocumentLoaded) {
    this.engine = vectorEngine;
    this.onDocumentLoaded = onDocumentLoaded;
    this.initHashListener();
  }

  initHashListener() {
    window.addEventListener('hashchange', () => this.checkUrlHash());
    // Check initial hash on load
    setTimeout(() => this.checkUrlHash(), 100);
  }

  checkUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#design=')) {
      const payloadBase64 = hash.replace('#design=', '');
      this.importFromBase64(payloadBase64);
    }
  }

  /**
   * Safely decodes UTF-8 Base64 string from ChatGPT into editable document
   */
  importFromBase64(base64Str) {
    try {
      const jsonStr = decodeURIComponent(
        atob(base64Str)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const designData = JSON.parse(jsonStr);
      this.loadDesign(designData);
      return { success: true, data: designData };
    } catch (err) {
      console.error('Failed to parse design from Base64:', err);
      // Fallback direct atob
      try {
        const directStr = atob(base64Str);
        const designData = JSON.parse(directStr);
        this.loadDesign(designData);
        return { success: true, data: designData };
      } catch (err2) {
        alert('Invalid design payload from ChatGPT link. Please check formatting.');
        return { success: false, error: err };
      }
    }
  }

  /**
   * Encodes active document into a Base64 URL parameter
   */
  exportToBase64() {
    const jsonStr = JSON.stringify(this.engine.doc);
    const base64Str = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      })
    );
    return base64Str;
  }

  /**
   * Generates a direct 1-click launch URL that opens this design in CraftStudio
   */
  generateShareUrl() {
    const base64 = this.exportToBase64();
    const url = new URL(window.location.href);
    url.hash = `design=${base64}`;
    return url.toString();
  }

  /**
   * Loads a structured design object into the engine
   */
  loadDesign(data) {
    if (!data || !data.layers) {
      throw new Error('Invalid CraftStudio schema: missing layers array');
    }

    if (data.title) this.engine.doc.title = data.title;
    if (data.canvas) {
      this.engine.doc.width = data.canvas.width || 1080;
      this.engine.doc.height = data.canvas.height || 1080;
      this.engine.doc.background = data.canvas.background || '#102640';
    }

    this.engine.doc.layers = [];
    for (const l of data.layers) {
      this.engine.addLayer({ ...l });
    }

    this.engine.resizeCanvas(this.engine.doc.width, this.engine.doc.height);
    if (this.onDocumentLoaded) {
      this.onDocumentLoaded(this.engine.doc);
    }
  }

  /**
   * Generate QR Code URL for instant camera-scan tablet transfer
   */
  getQrCodeUrl(targetUrl) {
    // Uses standard Google Chart QR API for zero-dependency instant generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(targetUrl)}`;
  }
}
