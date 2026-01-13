/**
 * Base Widget Class
 * All widgets extend this class for common functionality
 */

export class BaseWidget {
  constructor(options) {
    this.container = options.container;
    this.config = options.config || {};
    this.widgetId = options.widgetId;
    this.projectId = options.projectId;
    this.baseUrl = options.baseUrl || '';
    this.elements = {};
  }

  async init() {
    this.injectStyles();
    this.render();
    this.bindEvents();
    await this.loadData();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.container.appendChild(style);
  }

  getStyles() {
    return `
      :host {
        all: initial;
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #1f2937;
        box-sizing: border-box;
      }
      *, *::before, *::after {
        box-sizing: inherit;
      }
      .cs-widget {
        width: 100%;
      }
      .cs-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: #6b7280;
      }
      .cs-loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #e5e7eb;
        border-top-color: var(--cs-primary, #7c3aed);
        border-radius: 50%;
        animation: cs-spin 0.8s linear infinite;
      }
      @keyframes cs-spin {
        to { transform: rotate(360deg); }
      }
      .cs-error {
        padding: 1rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #991b1b;
      }
      .cs-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .cs-btn-primary {
        background: var(--cs-primary, #7c3aed);
        color: white;
      }
      .cs-btn-primary:hover {
        background: var(--cs-primary-dark, #6d28d9);
      }
      .cs-btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      .cs-btn-secondary:hover {
        background: #e5e7eb;
      }
    `;
  }

  render() {
    // Override in subclass
    this.container.innerHTML = '<div class="cs-widget">Widget not implemented</div>';
  }

  bindEvents() {
    // Override in subclass
  }

  async loadData() {
    // Override in subclass
  }

  async api(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  $(selector) {
    return this.container.querySelector(selector);
  }

  $$(selector) {
    return this.container.querySelectorAll(selector);
  }

  createElement(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  setLoading(loading) {
    const loader = this.$('.cs-loading');
    if (loader) {
      loader.style.display = loading ? 'flex' : 'none';
    }
  }

  showError(message) {
    const errorEl = this.$('.cs-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export default BaseWidget;
