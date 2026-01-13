/**
 * API client for chat widget
 */
export class ChatAPI {
  constructor(baseUrl, projectId) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.projectId = projectId;
  }

  async getConfig() {
    const response = await fetch(
      `${this.baseUrl}/api/widget/${this.projectId}/config`
    );

    if (!response.ok) {
      throw new Error('Failed to load widget configuration');
    }

    return response.json();
  }

  async sendMessage(message, sessionId, conversationHistory = []) {
    const response = await fetch(
      `${this.baseUrl}/api/widget/${this.projectId}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          conversation_history: conversationHistory,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  }

  async submitFeedback(messageId, feedback) {
    const response = await fetch(
      `${this.baseUrl}/api/widget/${this.projectId}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          feedback,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    return response.json();
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
