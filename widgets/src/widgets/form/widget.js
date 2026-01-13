/**
 * Feedback Form Widget
 * Customisable form for collecting stakeholder feedback
 */

import { BaseWidget } from '../../shared/base-widget.js';

export class FormWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.fields = [];
    this.isSubmitting = false;
    this.submitted = false;
  }

  getStyles() {
    return super.getStyles() + `
      .cs-form {
        max-width: 600px;
        margin: 0 auto;
      }
      .cs-form-header {
        margin-bottom: 1.5rem;
      }
      .cs-form-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.5rem;
      }
      .cs-form-description {
        color: #6b7280;
        line-height: 1.6;
      }
      .cs-form-fields {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .cs-form-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .cs-form-label {
        font-weight: 500;
        font-size: 0.9375rem;
        color: #374151;
      }
      .cs-form-label .required {
        color: #dc2626;
        margin-left: 0.25rem;
      }
      .cs-form-input,
      .cs-form-textarea,
      .cs-form-select {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .cs-form-input:focus,
      .cs-form-textarea:focus,
      .cs-form-select:focus {
        border-color: var(--cs-primary, #7c3aed);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
      .cs-form-input.error,
      .cs-form-textarea.error,
      .cs-form-select.error {
        border-color: #dc2626;
      }
      .cs-form-textarea {
        min-height: 120px;
        resize: vertical;
      }
      .cs-form-error {
        color: #dc2626;
        font-size: 0.8125rem;
      }
      .cs-form-hint {
        color: #6b7280;
        font-size: 0.8125rem;
      }
      .cs-form-checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .cs-form-checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        cursor: pointer;
      }
      .cs-form-checkbox {
        width: 18px;
        height: 18px;
        margin-top: 2px;
        accent-color: var(--cs-primary, #7c3aed);
      }
      .cs-form-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .cs-form-radio-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
      .cs-form-radio {
        width: 18px;
        height: 18px;
        accent-color: var(--cs-primary, #7c3aed);
      }
      .cs-form-submit {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.875rem 1.5rem;
        background: var(--cs-primary, #7c3aed);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        margin-top: 0.5rem;
      }
      .cs-form-submit:hover:not(:disabled) {
        background: var(--cs-primary-dark, #6d28d9);
      }
      .cs-form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .cs-form-submit-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: cs-spin 0.8s linear infinite;
      }
      .cs-form-success {
        text-align: center;
        padding: 3rem 2rem;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
      }
      .cs-form-success-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        background: #22c55e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .cs-form-success-icon svg {
        width: 32px;
        height: 32px;
      }
      .cs-form-success-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #166534;
        margin-bottom: 0.5rem;
      }
      .cs-form-success-message {
        color: #15803d;
        line-height: 1.6;
      }
      .cs-form-privacy {
        font-size: 0.8125rem;
        color: #6b7280;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
      .cs-form-privacy a {
        color: var(--cs-primary, #7c3aed);
        text-decoration: none;
      }
      .cs-form-privacy a:hover {
        text-decoration: underline;
      }

      /* Honeypot field - hidden from humans */
      .cs-form-hp {
        position: absolute;
        left: -9999px;
        opacity: 0;
        height: 0;
        width: 0;
        overflow: hidden;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'cs-widget cs-form');
    wrapper.innerHTML = `
      <div class="cs-form-content">
        <div class="cs-loading">
          <div class="cs-loading-spinner"></div>
        </div>
      </div>
      <div class="cs-error" style="display:none;"></div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    const content = this.$('.cs-form-content');
    if (!content) return;

    content.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        e.preventDefault();
        this.handleSubmit(e.target);
      }
    });

    content.addEventListener('input', (e) => {
      // Clear error on input
      const input = e.target;
      if (input.classList.contains('error')) {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.cs-form-error');
        if (errorEl) errorEl.remove();
      }
    });
  }

  async loadData() {
    try {
      const endpoint = this.widgetId
        ? `/api/embed/${this.widgetId}/config`
        : `/api/projects/${this.projectId}/widgets/form/config`;

      const data = await this.api(endpoint);
      this.fields = data.config?.fields || this.getDefaultFields();
      this.formConfig = data.config || {};
      this.renderForm();
    } catch (error) {
      console.error('Failed to load form config:', error);
      this.fields = this.getDefaultFields();
      this.formConfig = {};
      this.renderForm();
    }
  }

  getDefaultFields() {
    return [
      { id: 'name', type: 'text', label: 'Your Name', required: true, placeholder: 'Enter your full name' },
      { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'your@email.com' },
      { id: 'phone', type: 'tel', label: 'Phone Number', required: false, placeholder: '(Optional)' },
      { id: 'subject', type: 'text', label: 'Subject', required: true, placeholder: 'What is your feedback about?' },
      { id: 'content', type: 'textarea', label: 'Your Feedback', required: true, placeholder: 'Please share your thoughts, questions, or concerns...', hint: 'Be as specific as possible to help us address your feedback.' }
    ];
  }

  renderForm() {
    const content = this.$('.cs-form-content');

    if (this.submitted) {
      content.innerHTML = `
        <div class="cs-form-success">
          <div class="cs-form-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="cs-form-success-title">Thank You!</h3>
          <p class="cs-form-success-message">
            ${this.formConfig.successMessage || 'Your feedback has been submitted successfully. We will review it and respond if necessary.'}
          </p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="cs-form-header">
        <h2 class="cs-form-title">${this.formConfig.title || 'Share Your Feedback'}</h2>
        <p class="cs-form-description">${this.formConfig.description || 'We value your input. Please complete this form to submit your feedback or questions.'}</p>
      </div>
      <form class="cs-form-fields" novalidate>
        ${this.fields.map(field => this.renderField(field)).join('')}

        <!-- Honeypot field for spam prevention -->
        <div class="cs-form-hp">
          <label>Leave this empty</label>
          <input type="text" name="website" tabindex="-1" autocomplete="off">
        </div>

        <button type="submit" class="cs-form-submit">
          ${this.formConfig.submitLabel || 'Submit Feedback'}
        </button>

        <div class="cs-form-privacy">
          By submitting this form, you agree to our
          <a href="${this.formConfig.privacyUrl || '#'}" target="_blank">Privacy Policy</a>.
          Your information will only be used to respond to your enquiry.
        </div>
      </form>
    `;
  }

  renderField(field) {
    const required = field.required ? '<span class="required">*</span>' : '';
    const hint = field.hint ? `<span class="cs-form-hint">${field.hint}</span>` : '';

    switch (field.type) {
      case 'textarea':
        return `
          <div class="cs-form-group">
            <label class="cs-form-label">${field.label}${required}</label>
            <textarea
              name="${field.id}"
              class="cs-form-textarea"
              placeholder="${field.placeholder || ''}"
              ${field.required ? 'required' : ''}
            ></textarea>
            ${hint}
          </div>
        `;

      case 'select':
        return `
          <div class="cs-form-group">
            <label class="cs-form-label">${field.label}${required}</label>
            <select name="${field.id}" class="cs-form-select" ${field.required ? 'required' : ''}>
              <option value="">${field.placeholder || 'Select an option'}</option>
              ${(field.options || []).map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
            ${hint}
          </div>
        `;

      case 'checkbox':
        return `
          <div class="cs-form-group">
            <label class="cs-form-label">${field.label}${required}</label>
            <div class="cs-form-checkbox-group">
              ${(field.options || []).map(opt => `
                <label class="cs-form-checkbox-label">
                  <input type="checkbox" name="${field.id}" value="${opt.value}" class="cs-form-checkbox">
                  <span>${opt.label}</span>
                </label>
              `).join('')}
            </div>
            ${hint}
          </div>
        `;

      case 'radio':
        return `
          <div class="cs-form-group">
            <label class="cs-form-label">${field.label}${required}</label>
            <div class="cs-form-radio-group">
              ${(field.options || []).map(opt => `
                <label class="cs-form-radio-label">
                  <input type="radio" name="${field.id}" value="${opt.value}" class="cs-form-radio" ${field.required ? 'required' : ''}>
                  <span>${opt.label}</span>
                </label>
              `).join('')}
            </div>
            ${hint}
          </div>
        `;

      default: // text, email, tel, etc.
        return `
          <div class="cs-form-group">
            <label class="cs-form-label">${field.label}${required}</label>
            <input
              type="${field.type}"
              name="${field.id}"
              class="cs-form-input"
              placeholder="${field.placeholder || ''}"
              ${field.required ? 'required' : ''}
            >
            ${hint}
          </div>
        `;
    }
  }

  async handleSubmit(form) {
    if (this.isSubmitting) return;

    // Check honeypot
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      // Bot detected - fake success
      this.submitted = true;
      this.renderForm();
      return;
    }

    // Validate
    const errors = this.validate(form);
    if (errors.length > 0) {
      this.showValidationErrors(errors);
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const data = {
      extra_fields: {}
    };

    // Map known fields
    const knownFields = ['name', 'email', 'phone', 'address', 'subject', 'content'];
    for (const [key, value] of formData.entries()) {
      if (key === 'website') continue; // Skip honeypot
      if (knownFields.includes(key)) {
        data[key] = value;
      } else {
        data.extra_fields[key] = value;
      }
    }

    // Handle checkboxes (multiple values)
    this.fields.filter(f => f.type === 'checkbox').forEach(field => {
      const checked = form.querySelectorAll(`input[name="${field.id}"]:checked`);
      data.extra_fields[field.id] = Array.from(checked).map(cb => cb.value);
    });

    // Submit
    this.isSubmitting = true;
    this.updateSubmitButton(true);

    try {
      const endpoint = `/api/submit/${this.widgetId}`;
      await this.api(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      this.submitted = true;
      this.renderForm();
    } catch (error) {
      console.error('Submission failed:', error);
      this.showError('Failed to submit form. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton(false);
    }
  }

  validate(form) {
    const errors = [];

    this.fields.forEach(field => {
      if (field.required) {
        const input = form.querySelector(`[name="${field.id}"]`);
        if (!input) return;

        let value = '';
        if (field.type === 'checkbox') {
          const checked = form.querySelectorAll(`input[name="${field.id}"]:checked`);
          value = checked.length > 0 ? 'checked' : '';
        } else {
          value = input.value.trim();
        }

        if (!value) {
          errors.push({ field: field.id, message: `${field.label} is required` });
        }

        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({ field: field.id, message: 'Please enter a valid email address' });
          }
        }
      }
    });

    return errors;
  }

  showValidationErrors(errors) {
    errors.forEach(error => {
      const input = this.$(`[name="${error.field}"]`);
      if (input) {
        input.classList.add('error');
        const group = input.closest('.cs-form-group');
        if (group && !group.querySelector('.cs-form-error')) {
          const errorEl = document.createElement('span');
          errorEl.className = 'cs-form-error';
          errorEl.textContent = error.message;
          group.appendChild(errorEl);
        }
      }
    });

    // Scroll to first error
    const firstError = this.$('.cs-form-input.error, .cs-form-textarea.error, .cs-form-select.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  updateSubmitButton(loading) {
    const btn = this.$('.cs-form-submit');
    if (!btn) return;

    if (loading) {
      btn.disabled = true;
      btn.innerHTML = `<span class="cs-form-submit-spinner"></span> Submitting...`;
    } else {
      btn.disabled = false;
      btn.innerHTML = this.formConfig.submitLabel || 'Submit Feedback';
    }
  }

  showError(message) {
    const errorEl = this.$('.cs-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }
  }
}

export default FormWidget;
