/**
 * Interactive Sitemap Widget
 * Custom site plan images with clickable hotspots and popups
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class SitemapWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.hotspots = [];
    this.activeHotspot = null;
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  getStyles() {
    return super.getStyles() + `
      .cs-sitemap {
        max-width: 100%;
        margin: 0 auto;
      }
      .cs-sitemap-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .cs-sitemap-zoom {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .cs-sitemap-zoom-btn {
        width: 36px;
        height: 36px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .cs-sitemap-zoom-btn:hover {
        border-color: var(--cs-primary, #7c3aed);
        color: var(--cs-primary, #7c3aed);
      }
      .cs-sitemap-zoom-btn svg {
        width: 18px;
        height: 18px;
      }
      .cs-sitemap-zoom-level {
        font-size: 0.875rem;
        color: #6b7280;
        min-width: 50px;
        text-align: center;
      }
      .cs-sitemap-legend {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .cs-sitemap-legend-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: #6b7280;
      }
      .cs-sitemap-legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .cs-sitemap-container {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 12px;
        background: #f3f4f6;
        cursor: grab;
        min-height: 400px;
      }
      .cs-sitemap-container.dragging {
        cursor: grabbing;
      }
      .cs-sitemap-viewport {
        transform-origin: center center;
        transition: transform 0.1s ease-out;
      }
      .cs-sitemap-image {
        display: block;
        max-width: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .cs-sitemap-hotspot {
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--cs-primary, #7c3aed);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform 0.2s, background 0.2s;
        z-index: 10;
      }
      .cs-sitemap-hotspot:hover {
        transform: translate(-50%, -50%) scale(1.15);
      }
      .cs-sitemap-hotspot.active {
        background: #059669;
        transform: translate(-50%, -50%) scale(1.2);
      }
      .cs-sitemap-hotspot-pulse {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: var(--cs-primary, #7c3aed);
        opacity: 0;
        animation: cs-pulse-ring 2s infinite;
      }
      @keyframes cs-pulse-ring {
        0% { transform: scale(0.8); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      .cs-sitemap-hotspot-icon {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.875rem;
      }
      .cs-sitemap-hotspot.housing { background: #3b82f6; }
      .cs-sitemap-hotspot.green { background: #22c55e; }
      .cs-sitemap-hotspot.transport { background: #f97316; }
      .cs-sitemap-hotspot.amenity { background: #ec4899; }
      .cs-sitemap-hotspot.info { background: #8b5cf6; }

      /* Popup */
      .cs-sitemap-popup {
        position: absolute;
        width: 300px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 100;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.2s;
      }
      .cs-sitemap-popup.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .cs-sitemap-popup-arrow {
        position: absolute;
        width: 12px;
        height: 12px;
        background: white;
        transform: rotate(45deg);
        left: 50%;
        margin-left: -6px;
      }
      .cs-sitemap-popup.top .cs-sitemap-popup-arrow {
        bottom: -6px;
      }
      .cs-sitemap-popup.bottom .cs-sitemap-popup-arrow {
        top: -6px;
      }
      .cs-sitemap-popup-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 12px 12px 0 0;
      }
      .cs-sitemap-popup-content {
        padding: 1rem;
      }
      .cs-sitemap-popup-title {
        font-weight: 600;
        font-size: 1rem;
        color: #111827;
        margin-bottom: 0.5rem;
      }
      .cs-sitemap-popup-description {
        font-size: 0.9375rem;
        color: #4b5563;
        line-height: 1.6;
      }
      .cs-sitemap-popup-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 50%;
        background: rgba(0,0,0,0.5);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-sitemap-popup-close svg {
        width: 16px;
        height: 16px;
      }
      .cs-sitemap-popup-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.75rem;
        color: var(--cs-primary, #7c3aed);
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
      }
      .cs-sitemap-popup-link:hover {
        text-decoration: underline;
      }
      .cs-sitemap-popup-link svg {
        width: 14px;
        height: 14px;
      }

      .cs-sitemap-instructions {
        text-align: center;
        padding: 0.75rem;
        background: #f3f4f6;
        border-radius: 8px;
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-sitemap');
    wrapper.innerHTML = `
      <div class="cs-sitemap-controls">
        <div class="cs-sitemap-zoom">
          <button class="cs-sitemap-zoom-btn" data-zoom="out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <span class="cs-sitemap-zoom-level">100%</span>
          <button class="cs-sitemap-zoom-btn" data-zoom="in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button class="cs-sitemap-zoom-btn" data-zoom="reset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>
        <div class="cs-sitemap-legend"></div>
      </div>
      <div class="cs-sitemap-container">
        <div class="cs-sitemap-viewport">
          <div class="cs-loading">
            <div class="cs-loading-spinner"></div>
          </div>
        </div>
        <div class="cs-sitemap-popup top">
          <div class="cs-sitemap-popup-arrow"></div>
          <button class="cs-sitemap-popup-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <img class="cs-sitemap-popup-image" src="" alt="">
          <div class="cs-sitemap-popup-content">
            <h3 class="cs-sitemap-popup-title"></h3>
            <p class="cs-sitemap-popup-description"></p>
            <a class="cs-sitemap-popup-link" href="#" target="_blank">
              Learn more
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div class="cs-sitemap-instructions">
        Click on markers to learn more. Drag to pan, scroll or use buttons to zoom.
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    const container = this.$('.cs-sitemap-container');
    const viewport = this.$('.cs-sitemap-viewport');

    // Zoom controls
    this.$$('.cs-sitemap-zoom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.zoom;
        if (action === 'in') this.zoom(0.2);
        else if (action === 'out') this.zoom(-0.2);
        else if (action === 'reset') this.resetView();
      });
    });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoom(delta);
    }, { passive: false });

    // Drag to pan
    container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.cs-sitemap-hotspot') || e.target.closest('.cs-sitemap-popup')) return;
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      container.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.translateX += dx;
      this.translateY += dy;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.updateTransform();
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      container.classList.remove('dragging');
    });

    // Touch support
    let touchStartX, touchStartY;
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        this.translateX += dx;
        this.translateY += dy;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.updateTransform();
      }
    }, { passive: true });

    // Hotspot clicks
    viewport.addEventListener('click', (e) => {
      const hotspot = e.target.closest('.cs-sitemap-hotspot');
      if (hotspot) {
        const id = hotspot.dataset.id;
        this.showPopup(id, hotspot);
      }
    });

    // Popup close
    this.$('.cs-sitemap-popup-close').addEventListener('click', () => this.hidePopup());

    // Click outside popup
    container.addEventListener('click', (e) => {
      if (!e.target.closest('.cs-sitemap-popup') && !e.target.closest('.cs-sitemap-hotspot')) {
        this.hidePopup();
      }
    });
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/embed/${this.widgetId}/sitemap`
        : `/api/projects/${this.projectId}/sitemap`;

      const data = await this.api(endpoint);
      this.imageUrl = data.imageUrl;
      this.hotspots = data.hotspots || [];
      this.renderSitemap();
    } catch (error) {
      console.error('Failed to load sitemap:', error);
      this.imageUrl = 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1200';
      this.hotspots = this.getDemoData();
      this.renderSitemap();
    }
  }

  getDemoData() {
    return [
      { id: '1', x: 25, y: 30, type: 'housing', title: 'Phase 1 Housing', description: 'First phase of 120 homes including 42 affordable units. Mix of 2-4 bedroom family homes.', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400', link: '#' },
      { id: '2', x: 60, y: 25, type: 'housing', title: 'Phase 2 Housing', description: 'Second phase of 180 homes with varied designs and tenures.', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', link: '#' },
      { id: '3', x: 45, y: 55, type: 'green', title: 'Central Park', description: 'Main public open space with play areas, seating, and walking paths.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', link: '#' },
      { id: '4', x: 80, y: 45, type: 'amenity', title: 'Community Centre', description: 'New community facility with meeting rooms, cafe, and flexible event space.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', link: '#' },
      { id: '5', x: 15, y: 70, type: 'transport', title: 'Site Access', description: 'New roundabout providing vehicular access with pedestrian crossing facilities.', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400', link: '#' }
    ];
  }

  renderSitemap() {
    const viewport = this.$('.cs-sitemap-viewport');

    viewport.innerHTML = `
      <img class="cs-sitemap-image" src="${this.imageUrl}" alt="Site Plan" draggable="false">
      ${this.hotspots.map(h => `
        <div class="cs-sitemap-hotspot ${h.type}" data-id="${h.id}" style="left: ${h.x}%; top: ${h.y}%;">
          <div class="cs-sitemap-hotspot-pulse"></div>
          <span class="cs-sitemap-hotspot-icon">${h.label || ''}</span>
        </div>
      `).join('')}
    `;

    this.renderLegend();
  }

  renderLegend() {
    const legend = this.$('.cs-sitemap-legend');
    const types = [...new Set(this.hotspots.map(h => h.type))];

    const typeLabels = {
      housing: { label: 'Housing', color: '#3b82f6' },
      green: { label: 'Green Space', color: '#22c55e' },
      transport: { label: 'Transport', color: '#f97316' },
      amenity: { label: 'Amenity', color: '#ec4899' },
      info: { label: 'Information', color: '#8b5cf6' }
    };

    legend.innerHTML = types.map(type => {
      const info = typeLabels[type] || { label: type, color: '#7c3aed' };
      return `
        <div class="cs-sitemap-legend-item">
          <span class="cs-sitemap-legend-dot" style="background: ${info.color}"></span>
          ${info.label}
        </div>
      `;
    }).join('');
  }

  zoom(delta) {
    this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
    this.updateTransform();
    this.$('.cs-sitemap-zoom-level').textContent = Math.round(this.scale * 100) + '%';
  }

  resetView() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
    this.$('.cs-sitemap-zoom-level').textContent = '100%';
  }

  updateTransform() {
    const viewport = this.$('.cs-sitemap-viewport');
    viewport.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  showPopup(id, hotspotEl) {
    const hotspot = this.hotspots.find(h => h.id === id);
    if (!hotspot) return;

    // Update active state
    this.$$('.cs-sitemap-hotspot').forEach(el => el.classList.remove('active'));
    hotspotEl.classList.add('active');
    this.activeHotspot = id;

    // Update popup content
    const popup = this.$('.cs-sitemap-popup');
    const imgEl = popup.querySelector('.cs-sitemap-popup-image');
    const titleEl = popup.querySelector('.cs-sitemap-popup-title');
    const descEl = popup.querySelector('.cs-sitemap-popup-description');
    const linkEl = popup.querySelector('.cs-sitemap-popup-link');

    if (hotspot.image) {
      imgEl.src = hotspot.image;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }

    titleEl.textContent = hotspot.title;
    descEl.textContent = hotspot.description;

    if (hotspot.link && hotspot.link !== '#') {
      linkEl.href = hotspot.link;
      linkEl.style.display = 'inline-flex';
    } else {
      linkEl.style.display = 'none';
    }

    // Position popup
    const container = this.$('.cs-sitemap-container');
    const rect = hotspotEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    let left = rect.left - containerRect.left + rect.width / 2 - 150;
    left = Math.max(10, Math.min(containerRect.width - 310, left));

    const showAbove = rect.top - containerRect.top > 250;
    popup.classList.toggle('top', showAbove);
    popup.classList.toggle('bottom', !showAbove);

    popup.style.left = left + 'px';
    if (showAbove) {
      popup.style.top = 'auto';
      popup.style.bottom = (containerRect.bottom - rect.top + 10) + 'px';
    } else {
      popup.style.top = (rect.bottom - containerRect.top + 10) + 'px';
      popup.style.bottom = 'auto';
    }

    popup.classList.add('visible');
  }

  hidePopup() {
    this.$('.cs-sitemap-popup').classList.remove('visible');
    this.$$('.cs-sitemap-hotspot').forEach(el => el.classList.remove('active'));
    this.activeHotspot = null;
  }
}

export default SitemapWidget;
