/**
 * Document Library Widget
 * Categorised document listings with search, filter, and download tracking
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class DocumentsWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.documents = [];
    this.categories = [];
    this.filteredDocs = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
  }

  getStyles() {
    return super.getStyles() + `
      .cs-documents {
        max-width: 900px;
        margin: 0 auto;
      }
      .cs-documents-header {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
        align-items: center;
      }
      .cs-documents-search {
        flex: 1;
        min-width: 200px;
        position: relative;
      }
      .cs-documents-search input {
        width: 100%;
        padding: 0.625rem 1rem 0.625rem 2.5rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.9375rem;
        outline: none;
      }
      .cs-documents-search input:focus {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
      .cs-documents-search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
      }
      .cs-documents-filter {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .cs-documents-filter select {
        padding: 0.625rem 2rem 0.625rem 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.9375rem;
        background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 0.5rem center;
        appearance: none;
        cursor: pointer;
      }
      .cs-documents-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .cs-document-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        transition: all 0.15s;
      }
      .cs-document-card:hover {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .cs-document-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
        border-radius: 8px;
      }
      .cs-document-icon svg {
        width: 24px;
        height: 24px;
      }
      .cs-document-icon.pdf { background: #fef2f2; color: #dc2626; }
      .cs-document-icon.doc { background: #eff6ff; color: #2563eb; }
      .cs-document-icon.xls { background: #f0fdf4; color: #16a34a; }
      .cs-document-icon.img { background: #faf5ff; color: #9333ea; }
      .cs-document-info {
        flex: 1;
        min-width: 0;
      }
      .cs-document-name {
        font-weight: 500;
        color: #111827;
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cs-document-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8125rem;
        color: #6b7280;
      }
      .cs-document-meta span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .cs-document-actions {
        display: flex;
        gap: 0.5rem;
      }
      .cs-document-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 500;
        background: white;
        color: #374151;
        cursor: pointer;
        transition: all 0.15s;
        text-decoration: none;
      }
      .cs-document-btn:hover {
        border-color: var(--cs-primary, #7c3aed);
        color: var(--cs-primary, #7c3aed);
      }
      .cs-document-btn svg {
        width: 16px;
        height: 16px;
      }
      .cs-documents-empty {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
      }
      .cs-documents-count {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 1rem;
      }
      @media (max-width: 640px) {
        .cs-document-card {
          flex-direction: column;
          align-items: flex-start;
        }
        .cs-document-actions {
          width: 100%;
          margin-top: 0.75rem;
        }
        .cs-document-btn {
          flex: 1;
          justify-content: center;
        }
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-documents');
    wrapper.innerHTML = `
      <div class="cs-documents-header">
        <div class="cs-documents-search">
          <svg class="cs-documents-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search documents...">
        </div>
        <div class="cs-documents-filter">
          <select class="cs-documents-category">
            <option value="all">All Categories</option>
          </select>
        </div>
      </div>
      <div class="cs-documents-count"></div>
      <div class="cs-documents-list">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    const searchInput = this.$('.cs-documents-search input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterDocuments();
      });
    }

    const categorySelect = this.$('.cs-documents-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.filterDocuments();
      });
    }

    // Delegate download clicks
    const list = this.$('.cs-documents-list');
    if (list) {
      list.addEventListener('click', (e) => {
        const downloadBtn = e.target.closest('[data-download]');
        if (downloadBtn) {
          this.trackDownload(downloadBtn.dataset.download);
        }
      });
    }
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/widgets/${this.widgetId}/documents`
        : `/api/projects/${this.projectId}/documents/public`;

      const data = await this.api(endpoint);
      this.documents = data.documents || [];
      this.categories = [...new Set(this.documents.map(d => d.category).filter(Boolean))];
      this.filteredDocs = [...this.documents];

      this.renderCategories();
      this.renderDocuments();
    } catch (error) {
      console.error('Failed to load documents:', error);
      this.documents = this.getDemoData();
      this.categories = [...new Set(this.documents.map(d => d.category).filter(Boolean))];
      this.filteredDocs = [...this.documents];
      this.renderCategories();
      this.renderDocuments();
    }
  }

  getDemoData() {
    return [
      { id: '1', name: 'Planning Application Overview.pdf', category: 'Planning', size: 2456000, type: 'pdf', date: '2025-01-05', downloads: 124 },
      { id: '2', name: 'Environmental Impact Assessment.pdf', category: 'Environment', size: 5890000, type: 'pdf', date: '2025-01-03', downloads: 89 },
      { id: '3', name: 'Traffic Assessment Report.pdf', category: 'Transport', size: 3200000, type: 'pdf', date: '2025-01-02', downloads: 67 },
      { id: '4', name: 'Site Layout Plans.pdf', category: 'Design', size: 8900000, type: 'pdf', date: '2024-12-28', downloads: 156 },
      { id: '5', name: 'Affordable Housing Statement.pdf', category: 'Housing', size: 1200000, type: 'pdf', date: '2024-12-20', downloads: 45 },
      { id: '6', name: 'Community Engagement Summary.docx', category: 'Consultation', size: 890000, type: 'doc', date: '2024-12-15', downloads: 32 }
    ];
  }

  renderCategories() {
    const select = this.$('.cs-documents-category');
    if (!select) return;

    select.innerHTML = `
      <option value="all">All Categories</option>
      ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
    `;
  }

  filterDocuments() {
    this.filteredDocs = this.documents.filter(doc => {
      const matchesCategory = this.activeCategory === 'all' || doc.category === this.activeCategory;
      const matchesSearch = !this.searchQuery ||
        doc.name.toLowerCase().includes(this.searchQuery) ||
        (doc.category && doc.category.toLowerCase().includes(this.searchQuery));
      return matchesCategory && matchesSearch;
    });

    this.renderDocuments();
  }

  renderDocuments() {
    const container = this.$('.cs-documents-list');
    const countEl = this.$('.cs-documents-count');

    if (this.filteredDocs.length === 0) {
      container.innerHTML = `<div class="cs-documents-empty">No documents found</div>`;
      countEl.textContent = '';
      return;
    }

    countEl.textContent = `${this.filteredDocs.length} document${this.filteredDocs.length !== 1 ? 's' : ''}`;

    container.innerHTML = this.filteredDocs.map(doc => `
      <div class="cs-document-card">
        <div class="cs-document-icon ${doc.type}">
          ${this.getFileIcon(doc.type)}
        </div>
        <div class="cs-document-info">
          <div class="cs-document-name">${this.escapeHtml(doc.name)}</div>
          <div class="cs-document-meta">
            <span>${this.formatSize(doc.size)}</span>
            <span>${this.formatDate(doc.date)}</span>
            ${doc.downloads ? `<span>${doc.downloads} downloads</span>` : ''}
          </div>
        </div>
        <div class="cs-document-actions">
          <a href="${doc.url || '#'}" class="cs-document-btn" target="_blank" data-download="${doc.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </a>
        </div>
      </div>
    `).join('');
  }

  getFileIcon(type) {
    const icons = {
      pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      xls: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
      img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    };
    return icons[type] || icons.pdf;
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  trackDownload(docId) {
    try {
      this.api(`/api/widgets/${this.widgetId}/documents/${docId}/download`, {
        method: 'POST'
      }).catch(() => {});
    } catch (e) {}
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default DocumentsWidget;
