/**
 * Widget styles - injected into Shadow DOM
 */
export function getStyles(config) {
  const primaryColor = config.primaryColor || '#1a5c3d';
  const position = config.position || 'bottom-right';
  const buttonSize = config.buttonSize || 60;
  const chatWidth = config.chatWidth || 380;
  const chatHeight = config.chatHeight || 520;

  const positionStyles = position === 'bottom-left'
    ? 'left: 20px; right: auto;'
    : 'right: 20px; left: auto;';

  return `
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .consultation-widget {
      position: fixed;
      bottom: 20px;
      ${positionStyles}
      z-index: 999999;
    }

    .widget-button {
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .widget-button.open svg.chat-icon {
      display: none;
    }

    .widget-button:not(.open) svg.close-icon {
      display: none;
    }

    .chat-container {
      position: absolute;
      bottom: ${buttonSize + 16}px;
      ${position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
      width: ${chatWidth}px;
      height: ${chatHeight}px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-container.open {
      display: flex;
    }

    .chat-header {
      background: ${primaryColor};
      color: white;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .message.user {
      background: ${primaryColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .message.assistant {
      background: #f0f0f0;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .message.welcome {
      background: #e8f5e9;
      color: #2e7d32;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .disclaimer {
      font-size: 11px;
      color: #666;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid #ddd;
      font-style: italic;
    }

    .feedback-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .feedback-btn {
      background: transparent;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .feedback-btn:hover {
      background: #f5f5f5;
    }

    .feedback-btn.selected {
      background: ${primaryColor};
      color: white;
      border-color: ${primaryColor};
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: #f0f0f0;
      border-radius: 12px;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    .chat-input-container {
      padding: 12px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: ${primaryColor};
    }

    .chat-input::placeholder {
      color: #999;
    }

    .send-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-button svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .contact-link {
      text-align: center;
      padding: 8px;
      border-top: 1px solid #eee;
      font-size: 12px;
    }

    .contact-link a {
      color: ${primaryColor};
      text-decoration: none;
    }

    .contact-link a:hover {
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .chat-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        max-height: 600px;
      }
    }
  `;
}
