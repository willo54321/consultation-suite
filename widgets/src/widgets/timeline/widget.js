/**
 * Timeline/Milestones Widget
 * Visual project timeline with status indicators
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class TimelineWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.milestones = [];
  }

  getStyles() {
    return super.getStyles() + `
      .cs-timeline {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem 0;
      }
      .cs-timeline-list {
        position: relative;
      }
      .cs-timeline-list::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e5e7eb;
      }
      .cs-timeline-item {
        position: relative;
        padding-left: 56px;
        padding-bottom: 2rem;
      }
      .cs-timeline-item:last-child {
        padding-bottom: 0;
      }
      .cs-timeline-marker {
        position: absolute;
        left: 8px;
        top: 0;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: white;
        border: 3px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-timeline-marker svg {
        width: 14px;
        height: 14px;
      }
      .cs-timeline-item.completed .cs-timeline-marker {
        background: #10b981;
        border-color: #10b981;
        color: white;
      }
      .cs-timeline-item.in-progress .cs-timeline-marker {
        background: var(--cs-primary, #7c3aed);
        border-color: var(--cs-primary, #7c3aed);
        color: white;
        animation: cs-pulse 2s infinite;
      }
      @keyframes cs-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
        50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0); }
      }
      .cs-timeline-item.upcoming .cs-timeline-marker {
        background: #f3f4f6;
        border-color: #d1d5db;
        color: #9ca3af;
      }
      .cs-timeline-content {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 1rem 1.25rem;
        transition: all 0.15s;
      }
      .cs-timeline-item.in-progress .cs-timeline-content {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .cs-timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
      .cs-timeline-title {
        font-weight: 600;
        color: #111827;
        font-size: 1rem;
      }
      .cs-timeline-date {
        font-size: 0.8125rem;
        color: #6b7280;
        white-space: nowrap;
      }
      .cs-timeline-description {
        color: #4b5563;
        font-size: 0.9375rem;
        line-height: 1.6;
      }
      .cs-timeline-status {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.75rem;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .cs-timeline-status.completed {
        background: #d1fae5;
        color: #065f46;
      }
      .cs-timeline-status.in-progress {
        background: #ede9fe;
        color: #5b21b6;
      }
      .cs-timeline-status.upcoming {
        background: #f3f4f6;
        color: #6b7280;
      }
      .cs-timeline-expand {
        display: none;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
      .cs-timeline-item.expanded .cs-timeline-expand {
        display: block;
      }
      .cs-timeline-toggle {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.75rem;
        font-size: 0.8125rem;
        color: var(--cs-primary, #7c3aed);
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }
      .cs-timeline-toggle:hover {
        text-decoration: underline;
      }
      .cs-timeline-toggle svg {
        width: 16px;
        height: 16px;
        transition: transform 0.2s;
      }
      .cs-timeline-item.expanded .cs-timeline-toggle svg {
        transform: rotate(180deg);
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-timeline');
    wrapper.innerHTML = `
      <div class="cs-timeline-list">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    const list = this.$('.cs-timeline-list');
    if (list) {
      list.addEventListener('click', (e) => {
        const toggle = e.target.closest('.cs-timeline-toggle');
        if (toggle) {
          const item = toggle.closest('.cs-timeline-item');
          if (item) {
            item.classList.toggle('expanded');
          }
        }
      });
    }
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/widgets/${this.widgetId}/timeline`
        : `/api/projects/${this.projectId}/timeline`;

      const data = await this.api(endpoint);
      this.milestones = data.milestones || [];
      this.renderTimeline();
    } catch (error) {
      console.error('Failed to load timeline:', error);
      this.milestones = this.getDemoData();
      this.renderTimeline();
    }
  }

  getDemoData() {
    return [
      {
        id: '1',
        title: 'Pre-Application Consultation',
        date: '2024-10-15',
        status: 'completed',
        description: 'Initial community engagement and feedback gathering phase.',
        details: 'Over 200 residents attended our public exhibitions. Key themes included traffic concerns, housing mix, and green spaces.'
      },
      {
        id: '2',
        title: 'Planning Application Submitted',
        date: '2024-12-01',
        status: 'completed',
        description: 'Full planning application submitted to the local authority.',
        details: 'Application reference: APP/2024/12345. All supporting documents available in the document library.'
      },
      {
        id: '3',
        title: 'Public Consultation Period',
        date: '2025-01-06',
        endDate: '2025-02-17',
        status: 'in-progress',
        description: 'Statutory consultation period for public comments and objections.',
        details: 'Submit your comments through this website or directly to the planning authority by 17th February 2025.'
      },
      {
        id: '4',
        title: 'Planning Committee Meeting',
        date: '2025-03-15',
        status: 'upcoming',
        description: 'Application to be considered by the planning committee.',
        details: 'Date to be confirmed. The meeting will be open to the public.'
      },
      {
        id: '5',
        title: 'Decision Expected',
        date: '2025-04-01',
        status: 'upcoming',
        description: 'Planning decision expected from the local authority.'
      }
    ];
  }

  renderTimeline() {
    const container = this.$('.cs-timeline-list');

    container.innerHTML = this.milestones.map(milestone => `
      <div class="cs-timeline-item ${milestone.status}">
        <div class="cs-timeline-marker">
          ${this.getStatusIcon(milestone.status)}
        </div>
        <div class="cs-timeline-content">
          <div class="cs-timeline-header">
            <span class="cs-timeline-title">${this.escapeHtml(milestone.title)}</span>
            <span class="cs-timeline-date">${this.formatDate(milestone.date)}${milestone.endDate ? ' - ' + this.formatDate(milestone.endDate) : ''}</span>
          </div>
          <p class="cs-timeline-description">${this.escapeHtml(milestone.description)}</p>
          <span class="cs-timeline-status ${milestone.status}">${this.getStatusLabel(milestone.status)}</span>
          ${milestone.details ? `
            <button class="cs-timeline-toggle">
              More details
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div class="cs-timeline-expand">
              ${this.escapeHtml(milestone.details)}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  getStatusIcon(status) {
    switch (status) {
      case 'completed':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      case 'in-progress':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/></svg>';
    }
  }

  getStatusLabel(status) {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Upcoming';
    }
  }

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default TimelineWidget;
