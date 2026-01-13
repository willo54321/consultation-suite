/**
 * Image Comparison Slider Widget
 * Before/After image comparison with draggable slider
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class ComparisonWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.isDragging = false;
    this.sliderPosition = 50;
  }

  getStyles() {
    return super.getStyles() + `
      .cs-comparison {
        max-width: 900px;
        margin: 0 auto;
      }
      .cs-comparison-container {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        cursor: ew-resize;
        user-select: none;
        -webkit-user-select: none;
      }
      .cs-comparison-image {
        display: block;
        width: 100%;
        height: auto;
      }
      .cs-comparison-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .cs-comparison-overlay img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cs-comparison-slider {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 4px;
        background: white;
        cursor: ew-resize;
        z-index: 10;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      }
      .cs-comparison-handle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 44px;
        height: 44px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .cs-comparison-handle svg {
        width: 24px;
        height: 24px;
        color: #374151;
      }
      .cs-comparison-label {
        position: absolute;
        bottom: 16px;
        padding: 6px 12px;
        background: rgba(0,0,0,0.7);
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 6px;
        pointer-events: none;
      }
      .cs-comparison-label-before {
        left: 16px;
      }
      .cs-comparison-label-after {
        right: 16px;
      }
      .cs-comparison-caption {
        margin-top: 1rem;
        text-align: center;
        color: #6b7280;
        font-size: 0.875rem;
      }
      .cs-comparison-instructions {
        text-align: center;
        padding: 0.75rem;
        background: #f3f4f6;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-comparison');
    wrapper.innerHTML = `
      <div class="cs-comparison-instructions">
        Drag the slider to compare before and after views
      </div>
      <div class="cs-comparison-container">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-comparison-caption"></div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    const container = this.$('.cs-comparison-container');
    if (!container) return;

    // Mouse events
    container.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());

    // Touch events
    container.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: true });
    document.addEventListener('touchend', () => this.endDrag());

    // Keyboard accessibility
    container.addEventListener('keydown', (e) => this.onKeydown(e));
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/widgets/${this.widgetId}/comparison`
        : `/api/projects/${this.projectId}/widgets/comparison/config`;

      const data = await this.api(endpoint);
      this.renderComparison(data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
      // Use demo images for testing
      this.renderComparison({
        beforeImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
        afterImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
        beforeLabel: 'Before',
        afterLabel: 'After',
        caption: 'Proposed development view comparison'
      });
    }
  }

  renderComparison(data) {
    const container = this.$('.cs-comparison-container');
    const caption = this.$('.cs-comparison-caption');

    container.innerHTML = `
      <img class="cs-comparison-image" src="${data.afterImage}" alt="${data.afterLabel || 'After'}" draggable="false">
      <div class="cs-comparison-overlay" style="width: ${this.sliderPosition}%">
        <img src="${data.beforeImage}" alt="${data.beforeLabel || 'Before'}" draggable="false">
      </div>
      <div class="cs-comparison-slider" style="left: ${this.sliderPosition}%">
        <div class="cs-comparison-handle" tabindex="0" role="slider" aria-valuenow="${this.sliderPosition}" aria-valuemin="0" aria-valuemax="100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8L22 12L18 16"/>
            <path d="M6 8L2 12L6 16"/>
          </svg>
        </div>
      </div>
      <span class="cs-comparison-label cs-comparison-label-before">${data.beforeLabel || 'Before'}</span>
      <span class="cs-comparison-label cs-comparison-label-after">${data.afterLabel || 'After'}</span>
    `;

    if (data.caption) {
      caption.textContent = data.caption;
    }
  }

  startDrag(e) {
    this.isDragging = true;
    this.updateSlider(e);
  }

  onDrag(e) {
    if (!this.isDragging) return;
    this.updateSlider(e);
  }

  endDrag() {
    this.isDragging = false;
  }

  updateSlider(e) {
    const container = this.$('.cs-comparison-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

    this.sliderPosition = percentage;

    const slider = this.$('.cs-comparison-slider');
    const overlay = this.$('.cs-comparison-overlay');
    const handle = this.$('.cs-comparison-handle');

    if (slider) slider.style.left = `${percentage}%`;
    if (overlay) overlay.style.width = `${percentage}%`;
    if (handle) handle.setAttribute('aria-valuenow', Math.round(percentage));
  }

  onKeydown(e) {
    const step = e.shiftKey ? 10 : 2;
    let newPosition = this.sliderPosition;

    switch (e.key) {
      case 'ArrowLeft':
        newPosition = Math.max(0, this.sliderPosition - step);
        break;
      case 'ArrowRight':
        newPosition = Math.min(100, this.sliderPosition + step);
        break;
      default:
        return;
    }

    e.preventDefault();
    this.sliderPosition = newPosition;

    const slider = this.$('.cs-comparison-slider');
    const overlay = this.$('.cs-comparison-overlay');
    const handle = this.$('.cs-comparison-handle');

    if (slider) slider.style.left = `${newPosition}%`;
    if (overlay) overlay.style.width = `${newPosition}%`;
    if (handle) handle.setAttribute('aria-valuenow', Math.round(newPosition));
  }
}

export default ComparisonWidget;
