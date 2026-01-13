/**
 * Consultation AI Chat Widget
 * Embeddable chat widget for planning consultation websites
 */

import { getStyles } from './styles.js';
import { ChatAPI, generateSessionId } from './api.js';

class ConsultationWidget {
  constructor(config) {
    this.config = {
      projectId: config.projectId,
      baseUrl: config.baseUrl || window.location.origin,
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#1a5c3d',
      buttonSize: config.buttonSize || 60,
      chatWidth: config.chatWidth || 380,
      chatHeight: config.chatHeight || 520,
    };

    this.api = new ChatAPI(this.config.baseUrl, this.config.projectId);
    this.sessionId = this.getOrCreateSessionId();
    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;
    this.widgetConfig = null;

    this.init();
  }

  getOrCreateSessionId() {
    const storageKey = `consultation_widget_session_${this.config.projectId}`;
    let sessionId = sessionStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  async init() {
    try {
      // Load widget configuration from server
      this.widgetConfig = await this.api.getConfig();

      // Merge server config with local config
      this.config.primaryColor = this.widgetConfig.primary_color || this.config.primaryColor;
      this.config.position = this.widgetConfig.position || this.config.position;
      this.config.buttonSize = this.widgetConfig.button_size || this.config.buttonSize;
      this.config.chatWidth = this.widgetConfig.chat_width || this.config.chatWidth;
      this.config.chatHeight = this.widgetConfig.chat_height || this.config.chatHeight;

      this.render();
    } catch (error) {
      console.error('Failed to initialize consultation widget:', error);
    }
  }

  render() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'consultation-widget-container';

    // Create shadow DOM
    this.shadow = this.container.attachShadow({ mode: 'closed' });

    // Add styles
    const styleEl = document.createElement('style');
    styleEl.textContent = getStyles(this.config);
    this.shadow.appendChild(styleEl);

    // Create widget HTML
    const widget = document.createElement('div');
    widget.className = 'consultation-widget';
    widget.innerHTML = this.getWidgetHTML();
    this.shadow.appendChild(widget);

    // Add to document
    document.body.appendChild(this.container);

    // Store references
    this.widgetEl = widget;
    this.buttonEl = widget.querySelector('.widget-button');
    this.chatContainer = widget.querySelector('.chat-container');
    this.messagesContainer = widget.querySelector('.chat-messages');
    this.inputEl = widget.querySelector('.chat-input');
    this.sendBtn = widget.querySelector('.send-button');

    // Bind events
    this.bindEvents();

    // Show welcome message
    this.showWelcomeMessage();
  }

  getWidgetHTML() {
    return `
      <button class="widget-button" aria-label="Open chat">
        <svg class="chat-icon" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <div class="chat-container">
        <div class="chat-header">
          ${this.widgetConfig?.project_name || 'Consultation Assistant'}
        </div>

        <div class="chat-messages"></div>

        <div class="chat-input-container">
          <input
            type="text"
            class="chat-input"
            placeholder="Type your question..."
            maxlength="2000"
          />
          <button class="send-button" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        ${this.widgetConfig?.contact_email ? `
          <div class="contact-link">
            Need more help? <a href="mailto:${this.widgetConfig.contact_email}">Contact the team</a>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    // Toggle chat
    this.buttonEl.addEventListener('click', () => this.toggleChat());

    // Send message
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.buttonEl.classList.toggle('open', this.isOpen);
    this.chatContainer.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      this.inputEl.focus();
    }
  }

  showWelcomeMessage() {
    const welcomeMessage = this.widgetConfig?.welcome_message ||
      'Hello! How can I help you today?';

    this.addMessage({
      role: 'assistant',
      content: welcomeMessage,
      isWelcome: true,
    });
  }

  addMessage(message) {
    this.messages.push(message);

    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}${message.isWelcome ? ' welcome' : ''}`;

    let content = this.escapeHtml(message.content);

    // Add disclaimer for assistant messages
    if (message.role === 'assistant' && !message.isWelcome && this.widgetConfig?.disclaimer) {
      content += `<div class="disclaimer">${this.escapeHtml(this.widgetConfig.disclaimer)}</div>`;
    }

    // Add feedback buttons for assistant messages
    if (message.role === 'assistant' && !message.isWelcome && message.messageId) {
      content += `
        <div class="feedback-buttons" data-message-id="${message.messageId}">
          <button class="feedback-btn" data-feedback="helpful">Helpful</button>
          <button class="feedback-btn" data-feedback="not_helpful">Not helpful</button>
        </div>
      `;
    }

    messageEl.innerHTML = content;
    this.messagesContainer.appendChild(messageEl);

    // Bind feedback events
    const feedbackBtns = messageEl.querySelectorAll('.feedback-btn');
    feedbackBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFeedback(e, message.messageId));
    });

    this.scrollToBottom();
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = this.shadow.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  async sendMessage() {
    const content = this.inputEl.value.trim();

    if (!content || this.isLoading) return;

    // Add user message
    this.addMessage({ role: 'user', content });
    this.inputEl.value = '';

    // Show typing indicator
    this.isLoading = true;
    this.sendBtn.disabled = true;
    this.showTypingIndicator();

    try {
      // Build conversation history
      const conversationHistory = this.messages
        .filter(m => !m.isWelcome)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      // Send to API
      const response = await this.api.sendMessage(
        content,
        this.sessionId,
        conversationHistory
      );

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add assistant message
      this.addMessage({
        role: 'assistant',
        content: response.response,
        messageId: response.message_id,
      });
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again or contact the consultation team directly.',
      });
      console.error('Chat error:', error);
    } finally {
      this.isLoading = false;
      this.sendBtn.disabled = false;
    }
  }

  async handleFeedback(event, messageId) {
    const btn = event.target;
    const feedback = btn.dataset.feedback;
    const container = btn.parentElement;

    // Mark as selected
    container.querySelectorAll('.feedback-btn').forEach(b => {
      b.classList.remove('selected');
      b.disabled = true;
    });
    btn.classList.add('selected');

    try {
      await this.api.submitFeedback(messageId, feedback);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize from script tag
(function() {
  const currentScript = document.currentScript;

  if (currentScript) {
    const projectId = currentScript.dataset.projectId;
    const position = currentScript.dataset.position;
    const primaryColor = currentScript.dataset.primaryColor;

    if (!projectId) {
      console.error('Consultation Widget: data-project-id is required');
      return;
    }

    // Get base URL from script src
    const scriptSrc = currentScript.src;
    const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget'));

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        new ConsultationWidget({
          projectId,
          baseUrl,
          position,
          primaryColor,
        });
      });
    } else {
      new ConsultationWidget({
        projectId,
        baseUrl,
        position,
        primaryColor,
      });
    }
  }
})();

// Export for manual initialization
window.ConsultationWidget = ConsultationWidget;
