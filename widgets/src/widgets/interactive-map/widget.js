/**
 * Interactive Map Widget - Engagement Hub Style
 * Matches the original WordPress plugin UI design
 */

import { BaseWidget } from '../../shared/base-widget.js';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBCaXQ3yHwCIZ_3O3wYhIKqjUdQD5LEyQo';

// SVG Icons
const icons = {
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  chevronLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>',
  chevronRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>',
  thumbsUp: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
  positive: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
  negative: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>',
  idea: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>',
  mapPin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
};

// Pin icon SVG templates
const pinIcons = {
  positive: (color) => `<svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="shadow-pos" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter></defs>
    <path d="M16 40l-1.4-1.3C6.2 31.2 1 26.1 1 19.5 1 11.5 7.8 5 16 5s15 6.5 15 14.5c0 6.6-5.2 11.7-13.6 19.2L16 40z" fill="${color}" filter="url(#shadow-pos)"/>
    <circle cx="16" cy="19" r="8" fill="white"/>
    <path d="M12.5 19l2.5 2.5 5-5" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  negative: (color) => `<svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="shadow-neg" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter></defs>
    <path d="M16 40l-1.4-1.3C6.2 31.2 1 26.1 1 19.5 1 11.5 7.8 5 16 5s15 6.5 15 14.5c0 6.6-5.2 11.7-13.6 19.2L16 40z" fill="${color}" filter="url(#shadow-neg)"/>
    <circle cx="16" cy="19" r="8" fill="white"/>
    <path d="M13 16l6 6M19 16l-6 6" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  question: (color) => `<svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="shadow-idea" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter></defs>
    <path d="M16 40l-1.4-1.3C6.2 31.2 1 26.1 1 19.5 1 11.5 7.8 5 16 5s15 6.5 15 14.5c0 6.6-5.2 11.7-13.6 19.2L16 40z" fill="${color}" filter="url(#shadow-idea)"/>
    <circle cx="16" cy="19" r="8" fill="white"/>
    <circle cx="16" cy="15" r="1.5" fill="${color}"/>
    <path d="M16 18v5" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
};

export class InteractiveMapWidget extends BaseWidget {
  constructor(options) {
    super(options);
    this.map = null;
    this.pins = [];
    this.overlays = [];
    this.markers = [];
    this.categories = {};
    this.activeCategories = [];
    this.selectedPin = null;
    this.isAddingPin = false;
    this.currentMapView = 'satellite';
    this.pendingPinLocation = null;
    this.infoWindow = null;
    this.sidebarMinimized = false;
    this.voterId = this.getOrCreateVoterId();
  }

  getOrCreateVoterId() {
    let voterId = localStorage.getItem('cs_map_voter_id');
    if (!voterId) {
      voterId = 'voter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cs_map_voter_id', voterId);
    }
    return voterId;
  }

  getStyles() {
    return super.getStyles() + `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

      /* CSS Variables */
      .fm-widget {
        --fm-white: #ffffff;
        --fm-gray-50: #f9fafb;
        --fm-gray-100: #f3f4f6;
        --fm-gray-200: #e5e7eb;
        --fm-gray-300: #d1d5db;
        --fm-gray-400: #9ca3af;
        --fm-gray-500: #6b7280;
        --fm-gray-600: #4b5563;
        --fm-gray-700: #374151;
        --fm-gray-800: #1f2937;
        --fm-gray-900: #111827;
        --fm-primary: #7c3aed;
        --fm-primary-light: #8b5cf6;
        --fm-primary-dark: #6d28d9;
        --fm-primary-50: #f5f3ff;
        --fm-positive: #059669;
        --fm-positive-light: #10b981;
        --fm-negative: #dc2626;
        --fm-negative-light: #ef4444;
        --fm-idea: #d97706;
        --fm-idea-light: #f59e0b;
        --fm-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
        --fm-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
        --fm-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        --fm-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        --fm-radius-sm: 6px;
        --fm-radius-md: 8px;
        --fm-radius-lg: 12px;
        --fm-radius-xl: 16px;
        --fm-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
        --fm-transition-slow: 250ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .fm-widget {
        width: 100%;
        height: 100%;
        min-height: 500px;
        position: relative;
        isolation: isolate;
        background: var(--fm-gray-100);
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-sizing: border-box;
      }

      .fm-widget * {
        box-sizing: border-box;
      }

      /* Sidebar */
      .fm-sidebar {
        position: absolute;
        top: 12px;
        left: 12px;
        width: 320px;
        max-height: calc(100% - 24px);
        background: var(--fm-white);
        border-radius: var(--fm-radius-xl);
        box-shadow: var(--fm-shadow-lg);
        overflow: hidden;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: width var(--fm-transition-slow), box-shadow var(--fm-transition);
        border: 1px solid var(--fm-gray-200);
      }

      .fm-sidebar:hover {
        box-shadow: var(--fm-shadow-xl);
      }

      .fm-sidebar.minimized {
        width: 48px;
        border-radius: var(--fm-radius-lg);
      }

      .fm-sidebar.minimized .fm-sidebar-content {
        display: none;
      }

      .fm-sidebar.minimized .fm-sidebar-header-text {
        display: none;
      }

      /* Sidebar Header */
      .fm-sidebar-header {
        padding: 16px 18px;
        background: var(--fm-primary);
        color: var(--fm-white);
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .fm-sidebar.minimized .fm-sidebar-header {
        padding: 0;
        background: var(--fm-white);
        justify-content: center;
      }

      .fm-sidebar-header-text {
        flex: 1;
        min-width: 0;
      }

      .fm-sidebar-header h2 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1.3;
      }

      .fm-sidebar-header p {
        margin: 4px 0 0 0;
        font-size: 12px;
        opacity: 0.6;
        font-weight: 400;
        line-height: 1.35;
      }

      /* Sidebar Toggle Button */
      .fm-sidebar-toggle {
        width: 28px;
        height: 28px;
        min-width: 28px;
        background: rgba(255, 255, 255, 0.12);
        border: none;
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--fm-transition);
        padding: 0;
        outline: none;
        flex-shrink: 0;
      }

      .fm-sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--fm-white);
      }

      .fm-sidebar-toggle svg {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        fill: none;
      }

      .fm-sidebar.minimized .fm-sidebar-toggle {
        width: 48px;
        height: 48px;
        background: transparent;
        color: var(--fm-gray-500);
        border-radius: var(--fm-radius-lg);
      }

      .fm-sidebar.minimized .fm-sidebar-toggle svg {
        width: 20px;
        height: 20px;
      }

      .fm-sidebar.minimized .fm-sidebar-toggle:hover {
        background: var(--fm-gray-100);
        color: var(--fm-gray-700);
      }

      /* Sidebar Content */
      .fm-sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .fm-sidebar-content::-webkit-scrollbar {
        width: 4px;
      }

      .fm-sidebar-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .fm-sidebar-content::-webkit-scrollbar-thumb {
        background: var(--fm-gray-200);
        border-radius: 2px;
      }

      .fm-sidebar-section h3 {
        font-size: 11px;
        font-weight: 600;
        color: var(--fm-gray-400);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0 0 12px 0;
      }

      /* Category Filters */
      .fm-category-filters {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .fm-category-filter {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        background: var(--fm-white);
        border: 1px solid var(--fm-gray-200);
        border-radius: var(--fm-radius-md);
        cursor: pointer;
        transition: all var(--fm-transition);
        position: relative;
      }

      .fm-category-filter:hover {
        border-color: var(--fm-gray-300);
        background: var(--fm-gray-50);
      }

      .fm-category-filter.active {
        background: var(--fm-white);
        border-color: var(--fm-gray-300);
      }

      .fm-category-filter:not(.active) {
        background: var(--fm-gray-50);
        border-color: transparent;
      }

      .fm-category-filter:not(.active) .fm-category-icon {
        opacity: 0.5;
      }

      .fm-category-filter:not(.active) .fm-category-name {
        color: var(--fm-gray-500);
      }

      .fm-category-filter:not(.active) .fm-category-count {
        color: var(--fm-gray-400);
      }

      .fm-category-filter:not(.active):hover {
        background: var(--fm-gray-100);
        border-color: var(--fm-gray-200);
      }

      .fm-category-filter:not(.active):hover .fm-category-icon {
        opacity: 0.7;
      }

      .fm-category-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--fm-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;
        transition: opacity var(--fm-transition);
      }

      .fm-category-icon svg {
        width: 16px;
        height: 16px;
        fill: white;
      }

      .fm-category-info {
        flex: 1;
        min-width: 0;
      }

      .fm-category-name {
        font-weight: 500;
        font-size: 13px;
        color: var(--fm-gray-800);
        transition: color var(--fm-transition);
      }

      .fm-category-count {
        font-size: 11px;
        color: var(--fm-gray-400);
        margin-top: 2px;
        transition: color var(--fm-transition);
      }

      /* Toggle indicator - pill switch */
      .fm-category-toggle {
        width: 36px;
        height: 20px;
        background: var(--fm-gray-200);
        border-radius: 10px;
        position: relative;
        flex-shrink: 0;
        transition: background var(--fm-transition);
      }

      .fm-category-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: var(--fm-white);
        border-radius: 50%;
        transition: transform var(--fm-transition);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .fm-category-filter.active .fm-category-toggle {
        background: var(--fm-primary);
      }

      .fm-category-filter.active .fm-category-toggle::after {
        transform: translateX(16px);
      }

      /* Pin Icons */
      .fm-pin-icon {
        width: 36px;
        height: 47px;
        position: relative;
        cursor: pointer;
        transition: transform var(--fm-transition), filter var(--fm-transition);
      }

      .fm-pin-icon:hover {
        transform: scale(1.15) translateY(-3px);
        filter: brightness(1.05);
      }

      .fm-pin-icon svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      /* Add Pin Button (FAB) */
      .fm-fab {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 18px;
        background: var(--fm-primary);
        border: none;
        border-radius: var(--fm-radius-md);
        color: var(--fm-white);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: var(--fm-shadow-md);
        z-index: 1000;
        transition: all var(--fm-transition);
        font-family: inherit;
        letter-spacing: -0.01em;
      }

      .fm-fab:hover {
        background: var(--fm-primary-dark);
        box-shadow: var(--fm-shadow-lg);
        transform: translateY(-1px);
      }

      .fm-fab:active {
        transform: translateY(0);
      }

      .fm-fab.active {
        padding: 0;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--fm-white);
        color: var(--fm-gray-500);
        border: 1px solid var(--fm-gray-200);
        box-shadow: var(--fm-shadow-md);
        gap: 0;
        justify-content: center;
      }

      .fm-fab.active:hover {
        background: var(--fm-gray-50);
        color: var(--fm-gray-700);
        border-color: var(--fm-gray-300);
      }

      .fm-fab.active svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .fm-fab svg {
        width: 14px;
        height: 14px;
        font-size: 14px;
      }

      .fm-fab-label {
        font-weight: 500;
      }

      /* View Toggle */
      .fm-view-toggle {
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 10px 18px;
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
      }

      .fm-view-toggle:hover {
        background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        transform: translateY(-1px);
      }

      .fm-view-toggle:active {
        transform: translateY(0);
      }

      /* Map Container */
      .fm-map-container {
        width: 100%;
        height: 100%;
        min-height: 500px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      /* Modal */
      .fm-modal {
        display: none;
        position: absolute;
        z-index: 100000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity var(--fm-transition-slow);
      }

      .fm-modal.active {
        display: flex;
        opacity: 1;
      }

      .fm-modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(17, 24, 39, 0.5);
        backdrop-filter: blur(4px);
      }

      .fm-modal-content {
        position: relative;
        background: var(--fm-white);
        border-radius: var(--fm-radius-xl);
        width: 90%;
        max-width: 440px;
        max-height: 90%;
        overflow: hidden;
        box-shadow: var(--fm-shadow-xl), 0 0 0 1px rgba(0, 0, 0, 0.05);
        z-index: 1;
        animation: modalFadeIn 0.2s ease-out;
      }

      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.98) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .fm-modal-header {
        padding: 20px 24px;
        background: var(--fm-primary);
        color: var(--fm-white);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .fm-modal-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      .fm-modal-close {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: var(--fm-radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--fm-transition);
        padding: 0;
        color: var(--fm-white);
      }

      .fm-modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .fm-modal-close svg {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
      }

      .fm-modal-body {
        padding: 24px;
        max-height: 400px;
        overflow-y: auto;
      }

      /* Form Elements */
      .fm-pin-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .fm-form-group {
        margin: 0;
      }

      .fm-form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--fm-gray-700);
      }

      .fm-form-label .required {
        color: var(--fm-negative);
        margin-left: 2px;
      }

      .fm-form-label .optional {
        color: var(--fm-gray-400);
        font-weight: 400;
        margin-left: 4px;
      }

      .fm-form-input {
        width: 100%;
        padding: 11px 14px;
        font-size: 14px;
        border: 1px solid var(--fm-gray-200);
        border-radius: var(--fm-radius-md);
        outline: none;
        transition: border-color var(--fm-transition), box-shadow var(--fm-transition);
        font-family: inherit;
        background: var(--fm-white);
        color: var(--fm-gray-900);
        box-sizing: border-box;
      }

      .fm-form-input::placeholder {
        color: var(--fm-gray-400);
      }

      .fm-form-input:hover {
        border-color: var(--fm-gray-300);
      }

      .fm-form-input:focus {
        border-color: var(--fm-primary);
        box-shadow: 0 0 0 3px var(--fm-primary-50);
      }

      .fm-form-textarea {
        resize: vertical;
        min-height: 80px;
        line-height: 1.5;
      }

      /* Category Grid */
      .fm-category-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      .fm-category-option {
        position: relative;
        margin: 0;
        cursor: pointer;
      }

      .fm-category-radio {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      .fm-category-label {
        padding: 16px 10px;
        background: var(--fm-gray-50);
        border: 2px solid transparent;
        border-radius: var(--fm-radius-md);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        transition: all var(--fm-transition);
      }

      .fm-category-label:hover {
        background: var(--fm-gray-100);
        border-color: var(--fm-gray-200);
      }

      .fm-category-radio:checked + .fm-category-label {
        background: var(--fm-white);
        border-color: var(--fm-primary);
        box-shadow: var(--fm-shadow-sm);
      }

      .fm-category-label .fm-cat-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--fm-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
      }

      .fm-category-label .fm-cat-icon svg {
        width: 18px;
        height: 18px;
        fill: white;
      }

      .fm-category-text {
        font-size: 11px;
        font-weight: 500;
        color: var(--fm-gray-600);
        text-align: center;
      }

      /* Form Actions */
      .fm-form-actions {
        display: flex;
        gap: 10px;
        padding-top: 20px;
        border-top: 1px solid var(--fm-gray-100);
        margin-top: 4px;
      }

      .fm-btn {
        flex: 1;
        padding: 12px 18px;
        border-radius: var(--fm-radius-md);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--fm-transition);
        font-family: inherit;
        border: none;
      }

      .fm-btn-primary {
        background: var(--fm-primary);
        color: white;
      }

      .fm-btn-primary:hover {
        background: var(--fm-primary-dark);
      }

      .fm-btn-secondary {
        background: var(--fm-white);
        border: 1px solid var(--fm-gray-200);
        color: var(--fm-gray-600);
      }

      .fm-btn-secondary:hover {
        background: var(--fm-gray-50);
        border-color: var(--fm-gray-300);
      }

      /* Notification */
      .fm-notification {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: var(--fm-primary);
        color: white;
        padding: 12px 20px;
        border-radius: var(--fm-radius-lg);
        font-size: 14px;
        font-weight: 500;
        z-index: 2000;
        box-shadow: var(--fm-shadow-lg);
        opacity: 0;
        transition: all var(--fm-transition-slow);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .fm-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .fm-notification.success {
        background: var(--fm-positive);
      }

      .fm-notification.error {
        background: var(--fm-negative);
      }

      /* Loading */
      .fm-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--fm-gray-50);
        z-index: 500;
      }

      .fm-loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--fm-gray-200);
        border-top-color: var(--fm-primary);
        border-radius: 50%;
        animation: fm-spin 0.8s linear infinite;
      }

      @keyframes fm-spin {
        to { transform: rotate(360deg); }
      }

      /* Dragging cursor */
      .fm-widget.fm-dragging-cursor .fm-map-container {
        cursor: crosshair !important;
      }

      /* Custom marker styling */
      .custom-pin-marker {
        background: transparent !important;
        border: none !important;
      }
    `;
  }

  render() {
    const wrapper = this.createElement('div', 'fm-widget');
    wrapper.innerHTML = `
      <div class="fm-map-container">
        <div class="fm-loading">
          <div class="fm-loading-spinner"></div>
        </div>
      </div>

      <div class="fm-sidebar">
        <div class="fm-sidebar-header">
          <div class="fm-sidebar-header-text">
            <h2>Feedback Map</h2>
            <p>Click pins to view feedback or add your own.</p>
          </div>
          <button class="fm-sidebar-toggle" aria-label="Collapse sidebar" title="Collapse sidebar">
            ${icons.chevronLeft}
          </button>
        </div>
        <div class="fm-sidebar-content">
          <div class="fm-sidebar-section">
            <h3>Categories</h3>
            <div class="fm-category-filters"></div>
          </div>
        </div>
      </div>

      <button class="fm-fab" title="Add feedback" aria-pressed="false">
        ${icons.plus}
        <span class="fm-fab-label">Add Pin</span>
      </button>
      <button class="fm-view-toggle" type="button">Map</button>

      <div class="fm-modal fm-pin-modal">
        <div class="fm-modal-overlay"></div>
        <div class="fm-modal-content">
          <div class="fm-modal-header">
            <h2 class="fm-modal-title">Add Feedback</h2>
            <button type="button" class="fm-modal-close" aria-label="Close">
              ${icons.close}
            </button>
          </div>
          <div class="fm-modal-body">
            <form class="fm-pin-form">
              <div class="fm-form-group">
                <label class="fm-form-label">
                  Title <span class="required">*</span>
                </label>
                <input type="text" class="fm-form-input fm-pin-title" placeholder="Brief summary of your feedback" required />
              </div>
              <div class="fm-form-group">
                <label class="fm-form-label">
                  Description <span class="optional">(optional)</span>
                </label>
                <textarea class="fm-form-input fm-form-textarea fm-pin-description" rows="3" placeholder="Add more details..."></textarea>
              </div>
              <div class="fm-form-group">
                <label class="fm-form-label">
                  Category <span class="required">*</span>
                </label>
                <div class="fm-category-grid"></div>
              </div>
              <div class="fm-form-actions">
                <button type="button" class="fm-btn fm-btn-secondary fm-cancel-btn">Cancel</button>
                <button type="submit" class="fm-btn fm-btn-primary fm-submit-btn">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    this.container.appendChild(wrapper);
  }

  bindEvents() {
    // Add pin button
    const fabBtn = this.$('.fm-fab');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => this.toggleAddPinMode());
    }

    // Sidebar toggle
    const sidebarToggle = this.$('.fm-sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    }

    // View toggle
    const viewToggle = this.$('.fm-view-toggle');
    if (viewToggle) {
      viewToggle.addEventListener('click', () => this.toggleMapView());
    }

    // Modal close
    const modalClose = this.$('.fm-modal-close');
    const modalOverlay = this.$('.fm-modal-overlay');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.closeModal());
    }

    // Form submit
    const form = this.$('.fm-pin-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitPin();
      });
    }

    // Cancel button
    const cancelBtn = this.$('.fm-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }
  }

  async loadData() {
    try {
      await this.loadGoogleMaps();
      const endpoint = `/api/embed/project/${this.projectId}/interactive-map`;
      const data = await this.api(endpoint);

      const config = data.config || {};
      this.pins = (config.pins || []).filter(p => p.status === 'approved');
      this.overlays = config.overlays || [];
      // Standard categories matching WordPress plugin
      this.categories = config.categories || {
        positive: { enabled: true, label: 'Positive', color: '#059669' },
        negative: { enabled: true, label: 'Negative', color: '#dc2626' },
        question: { enabled: true, label: 'An idea or question', color: '#d97706' }
      };
      this.mapCenter = config.center || [51.5074, -0.1278];
      this.mapZoom = config.zoom || 13;
      this.enableVoting = config.enableVoting !== false;
      this.requireApproval = config.requireApproval !== false; // Default to true

      // Initialize all categories as active
      this.activeCategories = Object.keys(this.categories).filter(k => this.categories[k].enabled);

      this.initMap();
      this.renderCategoryFilters();

    } catch (error) {
      console.error('Failed to load map:', error);
      this.showError('Failed to load map. Please try again.');
    }
  }

  async loadGoogleMaps() {
    if (window.google && window.google.maps) return;

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  initMap() {
    const container = this.$('.fm-map-container');
    container.innerHTML = '';

    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    container.appendChild(mapDiv);

    // Default to satellite view
    this.map = new google.maps.Map(mapDiv, {
      center: { lat: this.mapCenter[0], lng: this.mapCenter[1] },
      zoom: this.mapZoom,
      mapTypeId: 'satellite',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      }
    });

    this.infoWindow = new google.maps.InfoWindow();

    // Add overlays
    this.overlays.forEach(overlay => {
      if (overlay.visible && overlay.bounds) {
        const bounds = new google.maps.LatLngBounds(
          { lat: overlay.bounds[0][0], lng: overlay.bounds[0][1] },
          { lat: overlay.bounds[1][0], lng: overlay.bounds[1][1] }
        );
        new google.maps.GroundOverlay(overlay.imageUrl, bounds, {
          opacity: overlay.opacity || 0.7
        }).setMap(this.map);
      }
    });

    // Add pins
    this.pins.forEach(pin => this.addPinMarker(pin));

    // Map click handler for adding pins
    this.map.addListener('click', (e) => {
      if (this.isAddingPin) {
        this.pendingPinLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        this.openModal();
      }
    });
  }

  renderCategoryFilters() {
    const container = this.$('.fm-category-filters');
    if (!container) return;

    const iconMap = {
      positive: icons.positive,
      negative: icons.negative,
      question: icons.idea
    };

    // Count pins per category
    const counts = {};
    Object.keys(this.categories).forEach(key => {
      counts[key] = this.pins.filter(p => p.category === key).length;
    });

    container.innerHTML = Object.entries(this.categories)
      .filter(([_, cat]) => cat.enabled)
      .map(([key, cat]) => `
        <div class="fm-category-filter active" data-category="${key}" tabindex="0" role="checkbox" aria-checked="true">
          <div class="fm-category-icon" style="background: ${cat.color};">
            ${iconMap[key] || icons.mapPin}
          </div>
          <div class="fm-category-info">
            <div class="fm-category-name">${cat.label}</div>
            <div class="fm-category-count">${counts[key] || 0} pins</div>
          </div>
          <span class="fm-category-toggle"></span>
        </div>
      `).join('');

    // Bind click events
    container.querySelectorAll('.fm-category-filter').forEach(filter => {
      filter.addEventListener('click', () => {
        filter.classList.toggle('active');
        const isActive = filter.classList.contains('active');
        filter.setAttribute('aria-checked', isActive ? 'true' : 'false');
        this.updateActiveCategories();
      });

      filter.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          filter.click();
        }
      });
    });

    // Also render category grid in modal
    this.renderCategoryGrid();
  }

  renderCategoryGrid() {
    const grid = this.$('.fm-category-grid');
    if (!grid) return;

    const iconMap = {
      positive: icons.positive,
      negative: icons.negative,
      question: icons.idea
    };

    grid.innerHTML = Object.entries(this.categories)
      .filter(([_, cat]) => cat.enabled)
      .map(([key, cat], index) => `
        <label class="fm-category-option">
          <input type="radio" name="category-radio" value="${key}" class="fm-category-radio" ${index === 0 ? 'checked' : ''} />
          <span class="fm-category-label">
            <span class="fm-cat-icon" style="background-color: ${cat.color};">
              ${iconMap[key] || icons.mapPin}
            </span>
            <span class="fm-category-text">${cat.label}</span>
          </span>
        </label>
      `).join('');
  }

  updateActiveCategories() {
    this.activeCategories = [];

    const activeFilters = this.container.querySelectorAll('.fm-category-filter.active');
    activeFilters.forEach(filter => {
      const categorySlug = filter.getAttribute('data-category');
      if (categorySlug) {
        this.activeCategories.push(categorySlug);
      }
    });

    this.filterMarkers();
  }

  filterMarkers() {
    this.markers.forEach(({ marker, pin }) => {
      const category = pin.category;
      let shouldShow = false;

      if (this.activeCategories.length === 0) {
        shouldShow = true;
      } else if (this.activeCategories.includes(category)) {
        shouldShow = true;
      }

      marker.setVisible(shouldShow);
    });
  }

  addPinMarker(pin) {
    if (!pin.lat || !pin.lng) return;

    const category = this.categories[pin.category] || {};
    const color = category.color || '#3b82f6';
    const slug = pin.category || 'question';

    const iconHtml = pinIcons[slug] ? pinIcons[slug](color) : pinIcons.question(color);

    const marker = new google.maps.Marker({
      position: { lat: pin.lat, lng: pin.lng },
      map: this.map,
      title: pin.title,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconHtml),
        scaledSize: new google.maps.Size(36, 47),
        anchor: new google.maps.Point(18, 47)
      }
    });

    marker.addListener('click', () => {
      const hasVoted = pin.votedBy?.includes(this.voterId);
      this.infoWindow.setContent(this.createPopupContent(pin, hasVoted));
      this.infoWindow.open(this.map, marker);

      google.maps.event.addListenerOnce(this.infoWindow, 'domready', () => {
        const voteBtn = document.getElementById(`vote-btn-${pin.id}`);
        if (voteBtn && !hasVoted) {
          voteBtn.addEventListener('click', () => this.voteOnPin(pin, marker));
        }
      });
    });

    this.markers.push({ marker, pin });
  }

  createPopupContent(pin, hasVoted) {
    const category = this.categories[pin.category] || {};
    const color = category.color || '#3b82f6';

    return `
      <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; min-width: 240px; max-width: 320px;">
        <div style="display: flex; align-items: flex-start; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; background: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              ${pin.category === 'positive' ? '<path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>' :
                pin.category === 'negative' ? '<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>' :
                '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>'}
            </svg>
          </div>
          <div style="flex: 1; min-width: 0;">
            <strong style="font-size: 15px; display: block; color: #111827; margin-bottom: 4px;">${this.escapeHtml(pin.title)}</strong>
            <span style="font-size: 12px; color: ${color}; font-weight: 500;">${category.label || 'Feedback'}</span>
          </div>
        </div>
        ${pin.description ? `<p style="color: #4b5563; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">${this.escapeHtml(pin.description)}</p>` : ''}
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 5px;">
            ${icons.thumbsUp}
            <span>${pin.votes || 0} votes</span>
          </span>
          ${this.enableVoting ? `
            <button id="vote-btn-${pin.id}" style="
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 8px 14px;
              border: none;
              border-radius: 6px;
              background: ${hasVoted ? color : '#f3f4f6'};
              color: ${hasVoted ? 'white' : '#374151'};
              font-size: 13px;
              font-weight: 500;
              cursor: ${hasVoted ? 'default' : 'pointer'};
              font-family: inherit;
            " ${hasVoted ? 'disabled' : ''}>
              ${hasVoted ? 'Voted' : 'Vote'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  toggleAddPinMode() {
    this.isAddingPin = !this.isAddingPin;
    const btn = this.$('.fm-fab');
    const widget = this.$('.fm-widget');

    if (this.isAddingPin) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = icons.close;
      widget.classList.add('fm-dragging-cursor');
      this.map.setOptions({ draggableCursor: 'crosshair' });
      this.showNotification('Click anywhere on the map to place your pin');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `${icons.plus}<span class="fm-fab-label">Add Pin</span>`;
      widget.classList.remove('fm-dragging-cursor');
      this.map.setOptions({ draggableCursor: null });
    }
  }

  toggleSidebar() {
    const sidebar = this.$('.fm-sidebar');
    const toggle = this.$('.fm-sidebar-toggle');
    this.sidebarMinimized = !this.sidebarMinimized;

    if (this.sidebarMinimized) {
      sidebar.classList.add('minimized');
      toggle.innerHTML = icons.chevronRight;
    } else {
      sidebar.classList.remove('minimized');
      toggle.innerHTML = icons.chevronLeft;
    }
  }

  toggleMapView() {
    const btn = this.$('.fm-view-toggle');

    if (this.currentMapView === 'satellite') {
      this.map.setMapTypeId('roadmap');
      this.currentMapView = 'roadmap';
      btn.textContent = 'Satellite';
    } else {
      this.map.setMapTypeId('satellite');
      this.currentMapView = 'satellite';
      btn.textContent = 'Map';
    }
  }

  openModal() {
    const modal = this.$('.fm-pin-modal');
    if (modal) {
      modal.classList.add('active');
    }
    // Exit add pin mode
    if (this.isAddingPin) {
      const btn = this.$('.fm-fab');
      const widget = this.$('.fm-widget');
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `${icons.plus}<span class="fm-fab-label">Add Pin</span>`;
      widget.classList.remove('fm-dragging-cursor');
      this.map.setOptions({ draggableCursor: null });
      this.isAddingPin = false;
    }
  }

  closeModal() {
    const modal = this.$('.fm-pin-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.pendingPinLocation = null;
    // Reset form
    const titleInput = this.$('.fm-pin-title');
    const descInput = this.$('.fm-pin-description');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
  }

  async submitPin() {
    const title = this.$('.fm-pin-title')?.value.trim();
    const description = this.$('.fm-pin-description')?.value.trim();
    const categoryRadio = this.container.querySelector('.fm-category-radio:checked');
    const category = categoryRadio?.value || 'question';

    if (!title || !this.pendingPinLocation) {
      alert('Please enter a title for your pin');
      return;
    }

    try {
      const response = await this.api(`/api/embed/project/${this.projectId}/interactive-map/pin`, {
        method: 'POST',
        body: JSON.stringify({
          lat: this.pendingPinLocation.lat,
          lng: this.pendingPinLocation.lng,
          title,
          description,
          category
        })
      });

      if (response.success && response.pin) {
        if (response.pin.status === 'approved') {
          this.pins.push(response.pin);
          this.addPinMarker(response.pin);
          this.updateCategoryCount(category);
          this.showNotification('Feedback added successfully!', 'success');
        } else {
          // Pin requires approval
          this.showNotification('Thank you! Your feedback has been submitted and is pending review.', 'success');
        }
      }

      this.closeModal();

    } catch (error) {
      console.error('Failed to submit pin:', error);
      this.showNotification('Failed to submit feedback. Please try again.', 'error');
    }
  }

  updateCategoryCount(category) {
    const filter = this.container.querySelector(`.fm-category-filter[data-category="${category}"]`);
    if (filter) {
      const countEl = filter.querySelector('.fm-category-count');
      if (countEl) {
        const count = this.pins.filter(p => p.category === category).length;
        countEl.textContent = `${count} pins`;
      }
    }
  }

  async voteOnPin(pin, marker) {
    try {
      await this.api(`/api/embed/project/${this.projectId}/interactive-map/vote`, {
        method: 'POST',
        body: JSON.stringify({
          pinId: pin.id,
          voterId: this.voterId
        })
      });

      if (!pin.votedBy) pin.votedBy = [];
      if (!pin.votedBy.includes(this.voterId)) {
        pin.votedBy.push(this.voterId);
        pin.votes = (pin.votes || 0) + 1;
      }

      this.infoWindow.setContent(this.createPopupContent(pin, true));
      this.showNotification('Vote recorded! Thank you for your feedback.', 'success');

    } catch (error) {
      console.error('Failed to vote:', error);
      this.showNotification('Failed to record vote. Please try again.', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = this.container.querySelector('.fm-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `fm-notification ${type}`;
    notification.textContent = message;
    this.container.querySelector('.fm-widget').appendChild(notification);

    // Show with animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto-dismiss
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  destroy() {
    if (this.map) {
      this.markers.forEach(({ marker }) => marker.setMap(null));
      this.map = null;
    }
    super.destroy();
  }
}

export default InteractiveMapWidget;
