/**
 * Consultation Suite Widget Loader
 * Universal loader for all embeddable widgets
 */

(function() {
  'use strict';

  const WIDGET_TYPES = {
    chatbot: () => import('../widgets/chatbot/src/widget.js'),
    sitemap: () => import('../widgets/sitemap/widget.js'),
    comparison: () => import('../widgets/comparison/widget.js'),
    documents: () => import('../widgets/documents/widget.js'),
    faq: () => import('../widgets/faq/widget.js'),
    timeline: () => import('../widgets/timeline/widget.js'),
    form: () => import('../widgets/form/widget.js'),
    gallery: () => import('../widgets/gallery/widget.js'),
    stats: () => import('../widgets/stats/widget.js'),
    'interactive-map': () => import('../widgets/interactive-map/widget.js'),
    map: () => import('../widgets/interactive-map/widget.js')
  };

  class ConsultationSuite {
    constructor() {
      this.widgets = new Map();
      this.baseUrl = this.detectBaseUrl();
      this.initialized = false;
    }

    detectBaseUrl() {
      // Check for explicit base URL first
      if (window.CONSULTATION_SUITE_BASE_URL) {
        return window.CONSULTATION_SUITE_BASE_URL;
      }

      // Extract origin from script URL
      const scripts = document.querySelectorAll('script[src*="consultation-widgets"]');
      if (scripts.length > 0) {
        const src = scripts[0].src;
        try {
          const url = new URL(src);
          return url.origin;
        } catch (e) {
          // Fallback: strip path to get origin
          const match = src.match(/^(https?:\/\/[^\/]+)/);
          if (match) return match[1];
        }
      }
      return 'http://localhost:8001';
    }

    async init() {
      if (this.initialized) return;
      this.initialized = true;

      // Find all widget containers
      const containers = document.querySelectorAll('[data-consultation-widget]');

      for (const container of containers) {
        const type = container.dataset.consultationWidget;
        const widgetId = container.dataset.widgetId;
        const projectId = container.dataset.projectId;

        if (!type || !WIDGET_TYPES[type]) {
          console.error(`[ConsultationSuite] Unknown widget type: ${type}`);
          continue;
        }

        try {
          await this.loadWidget(container, type, widgetId, projectId);
        } catch (error) {
          console.error(`[ConsultationSuite] Failed to load ${type} widget:`, error);
        }
      }
    }

    async loadWidget(container, type, widgetId, projectId) {
      // Create shadow DOM for style isolation
      const shadow = container.attachShadow({ mode: 'open' });

      // Load widget module
      const module = await WIDGET_TYPES[type]();
      const Widget = module.default;

      // Fetch widget config from API
      const config = await this.fetchConfig(type, widgetId, projectId);

      // Initialize widget
      const widget = new Widget({
        container: shadow,
        config,
        widgetId,
        projectId,
        baseUrl: this.baseUrl
      });

      await widget.init();
      this.widgets.set(widgetId || container.id, widget);

      return widget;
    }

    async fetchConfig(type, widgetId, projectId) {
      if (!widgetId && !projectId) {
        return {}; // Use default config
      }

      try {
        const endpoint = widgetId
          ? `/api/widgets/${widgetId}/config`
          : `/api/projects/${projectId}/widgets/${type}/config`;

        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch config');
        return await response.json();
      } catch (error) {
        console.warn(`[ConsultationSuite] Using default config for ${type}:`, error.message);
        return {};
      }
    }

    getWidget(id) {
      return this.widgets.get(id);
    }

    destroy(id) {
      const widget = this.widgets.get(id);
      if (widget && widget.destroy) {
        widget.destroy();
      }
      this.widgets.delete(id);
    }

    destroyAll() {
      for (const [id] of this.widgets) {
        this.destroy(id);
      }
    }
  }

  // Global instance
  window.ConsultationSuite = new ConsultationSuite();

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ConsultationSuite.init());
  } else {
    window.ConsultationSuite.init();
  }
})();
