/**
 * Stats Widget
 * Animated key statistics display with icons
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class StatsWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.stats = [];
    this.animated = false;
  }

  getStyles() {
    return super.getStyles() + `
      .cs-stats {
        max-width: 1200px;
        margin: 0 auto;
      }
      .cs-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }
      .cs-stats-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.2s;
      }
      .cs-stats-card:hover {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      .cs-stats-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 1rem;
        background: linear-gradient(135deg, var(--cs-primary, #7c3aed) 0%, var(--cs-primary-dark, #6d28d9) 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .cs-stats-icon svg {
        width: 28px;
        height: 28px;
      }
      .cs-stats-icon.green {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      }
      .cs-stats-icon.blue {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      .cs-stats-icon.orange {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      }
      .cs-stats-icon.pink {
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      }
      .cs-stats-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
        line-height: 1.2;
        margin-bottom: 0.25rem;
      }
      .cs-stats-prefix,
      .cs-stats-suffix {
        font-size: 1.5rem;
        font-weight: 600;
        color: #374151;
      }
      .cs-stats-label {
        font-size: 0.9375rem;
        color: #6b7280;
        font-weight: 500;
      }
      .cs-stats-description {
        font-size: 0.8125rem;
        color: #9ca3af;
        margin-top: 0.5rem;
      }

      /* Compact variant */
      .cs-stats-grid.compact {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }
      .cs-stats-grid.compact .cs-stats-card {
        padding: 1rem;
      }
      .cs-stats-grid.compact .cs-stats-icon {
        width: 44px;
        height: 44px;
        margin-bottom: 0.75rem;
      }
      .cs-stats-grid.compact .cs-stats-icon svg {
        width: 22px;
        height: 22px;
      }
      .cs-stats-grid.compact .cs-stats-value {
        font-size: 1.75rem;
      }
      .cs-stats-grid.compact .cs-stats-prefix,
      .cs-stats-grid.compact .cs-stats-suffix {
        font-size: 1.125rem;
      }

      /* Horizontal variant */
      .cs-stats-grid.horizontal .cs-stats-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        text-align: left;
        padding: 1.25rem;
      }
      .cs-stats-grid.horizontal .cs-stats-icon {
        margin: 0;
        flex-shrink: 0;
      }
      .cs-stats-grid.horizontal .cs-stats-content {
        flex: 1;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-stats');
    wrapper.innerHTML = `
      <div class="cs-stats-grid">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    // Intersection observer for animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true;
          this.animateNumbers();
        }
      });
    }, { threshold: 0.2 });

    const grid = this.$('.cs-stats-grid');
    if (grid) observer.observe(grid);
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/embed/${this.widgetId}/stats`
        : `/api/projects/${this.projectId}/stats`;

      const data = await this.api(endpoint);
      this.stats = data.stats || [];
      this.variant = data.variant || 'default';
      this.renderStats();
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats = this.getDemoData();
      this.renderStats();
    }
  }

  getDemoData() {
    return [
      { id: '1', value: 446, label: 'New Homes', description: 'Including 156 affordable', icon: 'home', color: 'purple' },
      { id: '2', value: 35, suffix: '%', label: 'Affordable Housing', description: 'Above policy requirement', icon: 'heart', color: 'pink' },
      { id: '3', value: 2.5, suffix: ' acres', label: 'Green Space', description: 'Public parks and play areas', icon: 'tree', color: 'green' },
      { id: '4', prefix: '£', value: 4.2, suffix: 'M', label: 'Community Investment', description: 'Schools, healthcare, transport', icon: 'pound', color: 'blue' }
    ];
  }

  renderStats() {
    const grid = this.$('.cs-stats-grid');
    if (this.variant) {
      grid.classList.add(this.variant);
    }

    grid.innerHTML = this.stats.map(stat => `
      <div class="cs-stats-card">
        <div class="cs-stats-icon ${stat.color || ''}">
          ${this.getIcon(stat.icon)}
        </div>
        <div class="cs-stats-content">
          <div class="cs-stats-value">
            ${stat.prefix ? `<span class="cs-stats-prefix">${stat.prefix}</span>` : ''}
            <span class="cs-stats-number" data-value="${stat.value}">0</span>
            ${stat.suffix ? `<span class="cs-stats-suffix">${stat.suffix}</span>` : ''}
          </div>
          <div class="cs-stats-label">${this.escapeHtml(stat.label)}</div>
          ${stat.description ? `<div class="cs-stats-description">${this.escapeHtml(stat.description)}</div>` : ''}
        </div>
      </div>
    `).join('');

    // Animate immediately if already in view
    if (this.animated) {
      this.animateNumbers();
    }
  }

  animateNumbers() {
    const numbers = this.$$('.cs-stats-number');
    numbers.forEach(el => {
      const target = parseFloat(el.dataset.value);
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  getIcon(name) {
    const icons = {
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-7"/><path d="M9 5H4l3 4-3 4h14l-3-4 3-4h-5l-2-3-2 3z"/></svg>',
      pound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 19H7a3 3 0 0 1 0-6h3a3 3 0 0 0 0-6H7"/><line x1="7" y1="13" x2="14" y2="13"/></svg>',
      users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
      building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
      clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
      star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    };
    return icons[name] || icons.star;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default StatsWidget;
