/**
 * Gallery Widget
 * Image/video gallery with lightbox and category filtering
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class GalleryWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.items = [];
    this.categories = [];
    this.filteredItems = [];
    this.activeCategory = 'all';
    this.lightboxOpen = false;
    this.currentIndex = 0;
  }

  getStyles() {
    return super.getStyles() + `
      .cs-gallery {
        max-width: 1200px;
        margin: 0 auto;
      }
      .cs-gallery-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .cs-gallery-filter {
        padding: 0.5rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 9999px;
        font-size: 0.875rem;
        background: white;
        cursor: pointer;
        transition: all 0.15s;
      }
      .cs-gallery-filter:hover {
        border-color: var(--cs-primary, #7c3aed);
        color: var(--cs-primary, #7c3aed);
      }
      .cs-gallery-filter.active {
        background: var(--cs-primary, #7c3aed);
        border-color: var(--cs-primary, #7c3aed);
        color: white;
      }
      .cs-gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .cs-gallery-item {
        position: relative;
        aspect-ratio: 4/3;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        background: #f3f4f6;
      }
      .cs-gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
      .cs-gallery-item:hover img {
        transform: scale(1.05);
      }
      .cs-gallery-item-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.3s;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 1rem;
      }
      .cs-gallery-item:hover .cs-gallery-item-overlay {
        opacity: 1;
      }
      .cs-gallery-item-title {
        color: white;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      .cs-gallery-item-caption {
        color: rgba(255,255,255,0.8);
        font-size: 0.875rem;
      }
      .cs-gallery-item-video-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 64px;
        height: 64px;
        background: rgba(0,0,0,0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        pointer-events: none;
      }
      .cs-gallery-item-video-icon svg {
        width: 28px;
        height: 28px;
        margin-left: 4px;
      }

      /* Lightbox */
      .cs-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      .cs-lightbox.open {
        opacity: 1;
        visibility: visible;
      }
      .cs-lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-lightbox-content img,
      .cs-lightbox-content video {
        max-width: 100%;
        max-height: 85vh;
        object-fit: contain;
      }
      .cs-lightbox-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
        z-index: 10001;
      }
      .cs-lightbox-close:hover {
        background: rgba(255,255,255,0.2);
      }
      .cs-lightbox-close svg {
        width: 24px;
        height: 24px;
      }
      .cs-lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
      }
      .cs-lightbox-nav:hover {
        background: rgba(255,255,255,0.2);
      }
      .cs-lightbox-nav svg {
        width: 24px;
        height: 24px;
      }
      .cs-lightbox-prev {
        left: 1rem;
      }
      .cs-lightbox-next {
        right: 1rem;
      }
      .cs-lightbox-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        color: white;
        text-align: center;
      }
      .cs-lightbox-title {
        font-weight: 600;
        font-size: 1.125rem;
        margin-bottom: 0.25rem;
      }
      .cs-lightbox-desc {
        opacity: 0.8;
        font-size: 0.9375rem;
      }
      .cs-lightbox-counter {
        position: absolute;
        top: 1rem;
        left: 1rem;
        color: white;
        font-size: 0.875rem;
        opacity: 0.7;
      }

      .cs-gallery-empty {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-gallery');
    wrapper.innerHTML = `
      <div class="cs-gallery-filters"></div>
      <div class="cs-gallery-grid">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-lightbox">
        <button class="cs-lightbox-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <span class="cs-lightbox-counter"></span>
        <button class="cs-lightbox-nav cs-lightbox-prev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="cs-lightbox-content"></div>
        <button class="cs-lightbox-nav cs-lightbox-next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="cs-lightbox-caption">
          <div class="cs-lightbox-title"></div>
          <div class="cs-lightbox-desc"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    // Filter clicks
    const filters = this.$('.cs-gallery-filters');
    if (filters) {
      filters.addEventListener('click', (e) => {
        if (e.target.classList.contains('cs-gallery-filter')) {
          this.setCategory(e.target.dataset.category);
        }
      });
    }

    // Gallery item clicks
    const grid = this.$('.cs-gallery-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const item = e.target.closest('.cs-gallery-item');
        if (item) {
          const index = parseInt(item.dataset.index);
          this.openLightbox(index);
        }
      });
    }

    // Lightbox controls
    const lightbox = this.$('.cs-lightbox');
    if (lightbox) {
      this.$('.cs-lightbox-close').addEventListener('click', () => this.closeLightbox());
      this.$('.cs-lightbox-prev').addEventListener('click', () => this.navigate(-1));
      this.$('.cs-lightbox-next').addEventListener('click', () => this.navigate(1));

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightboxOpen) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/embed/${this.widgetId}/gallery`
        : `/api/projects/${this.projectId}/gallery`;

      const data = await this.api(endpoint);
      this.items = data.items || [];
      this.categories = [...new Set(this.items.map(i => i.category).filter(Boolean))];
      this.filteredItems = [...this.items];

      this.renderFilters();
      this.renderGallery();
    } catch (error) {
      console.error('Failed to load gallery:', error);
      this.items = this.getDemoData();
      this.categories = [...new Set(this.items.map(i => i.category).filter(Boolean))];
      this.filteredItems = [...this.items];
      this.renderFilters();
      this.renderGallery();
    }
  }

  getDemoData() {
    return [
      { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800', title: 'Site Overview', caption: 'Aerial view of the proposed development site', category: 'Site' },
      { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800', title: 'Housing Design', caption: 'Example of proposed housing styles', category: 'Design' },
      { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', title: 'Green Spaces', caption: 'Planned community park and play areas', category: 'Landscape' },
      { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', title: 'Street View', caption: 'Artist impression of main street', category: 'Design' },
      { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'Natural Features', caption: 'Existing trees to be retained', category: 'Landscape' },
      { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800', title: 'Apartment Block', caption: 'Mixed-use building design', category: 'Design' }
    ];
  }

  renderFilters() {
    const container = this.$('.cs-gallery-filters');
    if (!container || this.categories.length === 0) {
      if (container) container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <button class="cs-gallery-filter active" data-category="all">All</button>
      ${this.categories.map(cat => `
        <button class="cs-gallery-filter" data-category="${cat}">${cat}</button>
      `).join('')}
    `;
  }

  renderGallery() {
    const container = this.$('.cs-gallery-grid');

    if (this.filteredItems.length === 0) {
      container.innerHTML = '<div class="cs-gallery-empty">No images found</div>';
      return;
    }

    container.innerHTML = this.filteredItems.map((item, index) => `
      <div class="cs-gallery-item" data-index="${index}">
        <img src="${item.thumbnail_url || item.url}" alt="${item.title || ''}" loading="lazy">
        ${item.type === 'video' ? `
          <div class="cs-gallery-item-video-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        ` : ''}
        <div class="cs-gallery-item-overlay">
          ${item.title ? `<div class="cs-gallery-item-title">${this.escapeHtml(item.title)}</div>` : ''}
          ${item.caption ? `<div class="cs-gallery-item-caption">${this.escapeHtml(item.caption)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  setCategory(category) {
    this.activeCategory = category;

    // Update filter buttons
    this.$$('.cs-gallery-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Filter items
    if (category === 'all') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item => item.category === category);
    }

    this.renderGallery();
  }

  openLightbox(index) {
    this.currentIndex = index;
    this.lightboxOpen = true;
    this.$('.cs-lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
    this.updateLightbox();
  }

  closeLightbox() {
    this.lightboxOpen = false;
    this.$('.cs-lightbox').classList.remove('open');
    document.body.style.overflow = '';

    // Stop video if playing
    const video = this.$('.cs-lightbox-content video');
    if (video) video.pause();
  }

  navigate(direction) {
    this.currentIndex = (this.currentIndex + direction + this.filteredItems.length) % this.filteredItems.length;
    this.updateLightbox();
  }

  updateLightbox() {
    const item = this.filteredItems[this.currentIndex];
    const content = this.$('.cs-lightbox-content');
    const counter = this.$('.cs-lightbox-counter');
    const title = this.$('.cs-lightbox-title');
    const desc = this.$('.cs-lightbox-desc');

    if (item.type === 'video') {
      content.innerHTML = `<video src="${item.url}" controls autoplay></video>`;
    } else {
      content.innerHTML = `<img src="${item.url}" alt="${item.title || ''}">`;
    }

    counter.textContent = `${this.currentIndex + 1} / ${this.filteredItems.length}`;
    title.textContent = item.title || '';
    desc.textContent = item.caption || '';
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default GalleryWidget;
