/**
 * FAQ Accordion Widget
 * Expandable Q&A sections with search and analytics
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class FAQWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.faqs = [];
    this.categories = [];
    this.filteredFaqs = [];
    this.openItems = new Set();
  }

  getStyles() {
    return super.getStyles() + `
      .cs-faq {
        max-width: 800px;
        margin: 0 auto;
      }
      .cs-faq-search {
        position: relative;
        margin-bottom: 1.5rem;
      }
      .cs-faq-search input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .cs-faq-search input:focus {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
      .cs-faq-search-icon {
        position: absolute;
        left: 0.875rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
      }
      .cs-faq-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .cs-faq-category {
        padding: 0.375rem 0.875rem;
        border: 1px solid #e5e7eb;
        border-radius: 9999px;
        font-size: 0.875rem;
        background: white;
        cursor: pointer;
        transition: all 0.15s;
      }
      .cs-faq-category:hover {
        border-color: var(--cs-primary, #7c3aed);
        color: var(--cs-primary, #7c3aed);
      }
      .cs-faq-category.active {
        background: var(--cs-primary, #7c3aed);
        border-color: var(--cs-primary, #7c3aed);
        color: white;
      }
      .cs-faq-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .cs-faq-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        background: white;
      }
      .cs-faq-question {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        cursor: pointer;
        font-weight: 500;
        background: #f9fafb;
        transition: background 0.15s;
      }
      .cs-faq-question:hover {
        background: #f3f4f6;
      }
      .cs-faq-chevron {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        color: #6b7280;
        transition: transform 0.2s;
      }
      .cs-faq-item.open .cs-faq-chevron {
        transform: rotate(180deg);
      }
      .cs-faq-answer {
        display: none;
        padding: 1rem 1.25rem;
        border-top: 1px solid #e5e7eb;
        color: #4b5563;
        line-height: 1.7;
      }
      .cs-faq-item.open .cs-faq-answer {
        display: block;
      }
      .cs-faq-empty {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
      }
      .cs-faq-count {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-faq');
    wrapper.innerHTML = `
      <div class="cs-faq-search">
        <svg class="cs-faq-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search FAQs..." class="cs-faq-search-input">
      </div>
      <div class="cs-faq-categories"></div>
      <div class="cs-faq-count"></div>
      <div class="cs-faq-list">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    // Search input
    const searchInput = this.$('.cs-faq-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Category filter (delegated)
    const categoriesEl = this.$('.cs-faq-categories');
    if (categoriesEl) {
      categoriesEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('cs-faq-category')) {
          this.handleCategoryClick(e.target.dataset.category);
        }
      });
    }

    // FAQ item toggle (delegated)
    const listEl = this.$('.cs-faq-list');
    if (listEl) {
      listEl.addEventListener('click', (e) => {
        const question = e.target.closest('.cs-faq-question');
        if (question) {
          this.handleToggle(question.dataset.id);
        }
      });
    }
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/widgets/${this.widgetId}/faqs`
        : `/api/projects/${this.projectId}/faqs`;

      const data = await this.api(endpoint);
      this.faqs = data.faqs || [];
      this.categories = [...new Set(this.faqs.map(f => f.category).filter(Boolean))];
      this.filteredFaqs = [...this.faqs];

      this.renderCategories();
      this.renderFAQs();
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      // Use demo data for testing
      this.faqs = this.getDemoData();
      this.categories = [...new Set(this.faqs.map(f => f.category).filter(Boolean))];
      this.filteredFaqs = [...this.faqs];
      this.renderCategories();
      this.renderFAQs();
    }
  }

  getDemoData() {
    return [
      {
        id: '1',
        question: 'What is the purpose of this consultation?',
        answer: 'This consultation aims to gather community feedback on the proposed development plans for the area. Your input helps shape decisions that affect the local community.',
        category: 'General'
      },
      {
        id: '2',
        question: 'How long will the consultation period last?',
        answer: 'The consultation period runs for 6 weeks, giving residents and stakeholders ample time to review materials and submit their feedback.',
        category: 'General'
      },
      {
        id: '3',
        question: 'How many homes are being proposed?',
        answer: 'The development proposes approximately 450 new homes, including a mix of 1-4 bedroom properties with 35% designated as affordable housing.',
        category: 'Housing'
      },
      {
        id: '4',
        question: 'What about traffic impact?',
        answer: 'A full transport assessment has been conducted. Improvements include a new roundabout, upgraded pedestrian crossings, and enhanced cycle routes.',
        category: 'Transport'
      },
      {
        id: '5',
        question: 'Will there be community facilities?',
        answer: 'Yes, the plans include a new community centre, children\'s play areas, public open spaces, and contributions towards local school places and healthcare.',
        category: 'Facilities'
      }
    ];
  }

  renderCategories() {
    const container = this.$('.cs-faq-categories');
    if (!container || this.categories.length === 0) return;

    container.innerHTML = `
      <button class="cs-faq-category active" data-category="all">All</button>
      ${this.categories.map(cat => `
        <button class="cs-faq-category" data-category="${cat}">${cat}</button>
      `).join('')}
    `;
  }

  renderFAQs() {
    const container = this.$('.cs-faq-list');
    const countEl = this.$('.cs-faq-count');

    if (this.filteredFaqs.length === 0) {
      container.innerHTML = `
        <div class="cs-faq-empty">
          <p>No FAQs found matching your search.</p>
        </div>
      `;
      countEl.textContent = '';
      return;
    }

    countEl.textContent = `Showing ${this.filteredFaqs.length} of ${this.faqs.length} questions`;

    container.innerHTML = this.filteredFaqs.map(faq => `
      <div class="cs-faq-item ${this.openItems.has(faq.id) ? 'open' : ''}" data-id="${faq.id}">
        <div class="cs-faq-question" data-id="${faq.id}">
          <span>${this.escapeHtml(faq.question)}</span>
          <svg class="cs-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div class="cs-faq-answer">
          ${this.escapeHtml(faq.answer)}
        </div>
      </div>
    `).join('');
  }

  handleSearch(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
      this.filteredFaqs = [...this.faqs];
    } else {
      this.filteredFaqs = this.faqs.filter(faq =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
      );
    }

    this.renderFAQs();
    this.trackAnalytics('search', { query });
  }

  handleCategoryClick(category) {
    // Update active state
    this.$$('.cs-faq-category').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Filter FAQs
    if (category === 'all') {
      this.filteredFaqs = [...this.faqs];
    } else {
      this.filteredFaqs = this.faqs.filter(faq => faq.category === category);
    }

    this.renderFAQs();
    this.trackAnalytics('filter', { category });
  }

  handleToggle(id) {
    if (this.openItems.has(id)) {
      this.openItems.delete(id);
    } else {
      this.openItems.add(id);
      this.trackAnalytics('view', { faqId: id });
    }

    const item = this.$(`[data-id="${id}"].cs-faq-item`);
    if (item) {
      item.classList.toggle('open', this.openItems.has(id));
    }
  }

  trackAnalytics(action, data) {
    // Send to backend if tracking enabled
    if (this.config.trackAnalytics !== false) {
      try {
        this.api(`/api/widgets/${this.widgetId}/analytics`, {
          method: 'POST',
          body: JSON.stringify({ action, data, timestamp: new Date().toISOString() })
        }).catch(() => {}); // Silent fail for analytics
      } catch (e) {
        // Ignore analytics errors
      }
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default FAQWidget;
