/**
 * Element Inspector for Static HTML
 *
 * A vanilla JavaScript element inspector that provides rich context
 * for AI code assistants. Tracks source locations, computed styles,
 * DOM hierarchy, and more.
 *
 * Usage:
 *   Include this script and element-inspector.css in your HTML:
 *   <script src="/inspector/element-inspector.js"></script>
 *   <link rel="stylesheet" href="/inspector/element-inspector.css">
 */

(function() {
  'use strict';

  class ElementInspector {
    constructor() {
      // State
      this.active = false;
      this.hoveredElement = null;
      this.lockedElement = null;
      this.isLocked = false;
      this.info = null;

      // WeakMap to store original styles
      this.originalStyles = new WeakMap();

      // UI elements
      this.container = null;
      this.toggleBtn = null;
      this.contentPanel = null;

      // Bind methods
      this.handleMouseOver = this.handleMouseOver.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.toggle = this.toggle.bind(this);
      this.copyToClipboard = this.copyToClipboard.bind(this);
      this.handleKeyPress = this.handleKeyPress.bind(this);

      // Initialize
      this.init();
    }

    /**
     * Initialize the inspector
     */
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    /**
     * Setup the inspector UI and event listeners
     */
    setup() {
      this.injectStyles();
      this.createUI();
      this.attachEventListeners();
      this.loadState();
    }

    /**
     * Inject keyframe animations
     */
    injectStyles() {
      if (document.getElementById('element-inspector-keyframes')) return;

      const style = document.createElement('style');
      style.id = 'element-inspector-keyframes';
      style.textContent = `
        @keyframes ei-inspector-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ei-fade-in {
          from { opacity: 0; transform: translateX(1rem); }
          to { opacity: 1; transform: translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * Create the inspector UI
     */
    createUI() {
      this.container = document.createElement('div');
      this.container.className = 'ei-container';
      this.container.innerHTML = `
        <div class="ei-header">
          <div class="ei-header-left" style="display: none;">
            <span class="ei-tag-name"></span>
            <button class="ei-copy-btn" title="Copy info to clipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <button class="ei-toggle-btn" title="Toggle Inspector (Alt+I)">
            <svg class="ei-icon-active" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg class="ei-icon-inactive" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <div class="ei-content" style="display: none;"></div>
      `;

      document.body.appendChild(this.container);

      // Store references
      this.toggleBtn = this.container.querySelector('.ei-toggle-btn');
      this.contentPanel = this.container.querySelector('.ei-content');
      this.headerLeft = this.container.querySelector('.ei-header-left');
      this.copyBtn = this.container.querySelector('.ei-copy-btn');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
      this.toggleBtn.addEventListener('click', this.toggle);
      this.copyBtn.addEventListener('click', this.copyToClipboard);
      document.addEventListener('keydown', this.handleKeyPress);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyPress(e) {
      // Alt+I to toggle
      if (e.altKey && e.key === 'i') {
        e.preventDefault();
        this.toggle();
      }
      // Escape to unlock
      if (e.key === 'Escape' && this.isLocked) {
        this.unlockElement();
      }
    }

    /**
     * Load saved state from localStorage
     */
    loadState() {
      try {
        const saved = localStorage.getItem('element-inspector-active');
        if (saved === 'true') {
          this.active = true;
          this.updateUI();
          this.enableInspection();
        }
      } catch (e) {
        // localStorage might not be available
      }
    }

    /**
     * Save state to localStorage
     */
    saveState() {
      try {
        localStorage.setItem('element-inspector-active', this.active);
      } catch (e) {
        // localStorage might not be available
      }
    }

    /**
     * Toggle inspector on/off
     */
    toggle() {
      this.active = !this.active;
      this.saveState();

      if (this.active) {
        this.enableInspection();
      } else {
        this.disableInspection();
      }

      this.updateUI();
    }

    /**
     * Enable inspection mode
     */
    enableInspection() {
      document.addEventListener('mouseover', this.handleMouseOver, { passive: true });
      document.addEventListener('click', this.handleClick, { capture: true });
    }

    /**
     * Disable inspection mode
     */
    disableInspection() {
      document.removeEventListener('mouseover', this.handleMouseOver);
      document.removeEventListener('click', this.handleClick, { capture: true });

      // Clean up
      if (this.hoveredElement) {
        this.removeInspectorStyles(this.hoveredElement);
        this.hoveredElement = null;
      }
      if (this.lockedElement) {
        this.removeInspectorStyles(this.lockedElement);
        this.lockedElement = null;
      }
      this.info = null;
      this.isLocked = false;
    }

    /**
     * Update UI to reflect current state
     */
    updateUI() {
      const iconActive = this.container.querySelector('.ei-icon-active');
      const iconInactive = this.container.querySelector('.ei-icon-inactive');

      if (this.active) {
        this.toggleBtn.classList.add('active');
        iconActive.style.display = 'block';
        iconInactive.style.display = 'none';
      } else {
        this.toggleBtn.classList.remove('active');
        iconActive.style.display = 'none';
        iconInactive.style.display = 'block';
      }

      // Show/hide content panel
      const hasInfo = this.active && this.info;
      this.container.classList.toggle('ei-expanded', hasInfo);
      this.contentPanel.style.display = hasInfo ? 'block' : 'none';
      this.headerLeft.style.display = hasInfo ? 'flex' : 'none';

      if (hasInfo) {
        this.renderInfo();
      }
    }

    /**
     * Handle mouseover event
     */
    handleMouseOver(e) {
      if (!this.active || this.isLocked) return;

      // Skip inspector UI itself
      if (e.target.closest('.ei-container')) return;

      // Find closest element with source data
      const target = e.target.closest('[data-source-file]');

      if (target && target !== this.hoveredElement) {
        // Remove styles from previous element
        if (this.hoveredElement) {
          this.removeInspectorStyles(this.hoveredElement);
        }

        // Apply styles to new element
        this.hoveredElement = target;
        this.applyInspectorStyles(target);
        this.updateInfo(target);
        this.updateUI();
      } else if (!target && this.hoveredElement) {
        // Unhover - remove styles
        this.removeInspectorStyles(this.hoveredElement);
        this.hoveredElement = null;
        this.info = null;
        this.updateUI();
      }
    }

    /**
     * Handle click event
     */
    handleClick(e) {
      if (!this.active) return;

      // Skip inspector UI itself
      if (e.target.closest('.ei-container')) return;

      // Find closest element with source data
      const target = e.target.closest('[data-source-file]');

      if (target) {
        e.preventDefault();
        e.stopPropagation();

        // If clicking the same locked element, unlock it
        if (this.isLocked && this.lockedElement === target) {
          this.unlockElement();
          return;
        }

        // Lock the new element
        this.lockElement(target);
      }
    }

    /**
     * Lock an element for inspection
     */
    lockElement(element) {
      // Clear previous lock
      if (this.lockedElement && this.lockedElement !== element) {
        this.removeInspectorStyles(this.lockedElement);
      }

      // Clear hover state
      if (this.hoveredElement && this.hoveredElement !== element) {
        this.removeInspectorStyles(this.hoveredElement);
      }

      this.isLocked = true;
      this.lockedElement = element;
      this.hoveredElement = null;
      this.applyInspectorStyles(element, true);
      this.updateInfo(element);
      this.updateUI();
    }

    /**
     * Unlock the currently locked element
     */
    unlockElement() {
      if (this.lockedElement) {
        this.removeInspectorStyles(this.lockedElement);
        this.lockedElement = null;
      }
      this.isLocked = false;
      this.info = null;
      this.updateUI();
    }

    /**
     * Apply inspector visual styles to an element
     */
    applyInspectorStyles(element, locked = false) {
      // Store original styles
      if (!this.originalStyles.has(element)) {
        this.originalStyles.set(element, {
          boxShadow: element.style.boxShadow,
          cursor: element.style.cursor,
          outline: element.style.outline,
          outlineOffset: element.style.outlineOffset,
          position: element.style.position,
          zIndex: element.style.zIndex
        });
      }

      // Apply animated gradient outline
      const color = locked ? '#10b981' : '#ff0080';
      element.style.setProperty('outline', `3px solid ${color}`, 'important');
      element.style.setProperty('outline-offset', '2px', 'important');
      element.style.setProperty('box-shadow', `0 0 0 2px rgba(255, 255, 255, 0.1), 0 0 20px rgba(${locked ? '16, 185, 129' : '255, 0, 128'}, 0.5)`, 'important');
      element.style.setProperty('cursor', 'pointer', 'important');

      // Ensure element is visible if it has z-index issues
      const computedZIndex = window.getComputedStyle(element).zIndex;
      if (computedZIndex !== 'auto' && parseInt(computedZIndex) < 1000) {
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('z-index', '1000', 'important');
      }
    }

    /**
     * Remove inspector visual styles from an element
     */
    removeInspectorStyles(element) {
      const original = this.originalStyles.get(element);
      if (!original) return;

      // Restore original values
      const props = ['boxShadow', 'cursor', 'outline', 'outlineOffset', 'position', 'zIndex'];
      const stylePropNames = ['box-shadow', 'cursor', 'outline', 'outline-offset', 'position', 'z-index'];

      props.forEach((prop, idx) => {
        if (original[prop]) {
          element.style[prop] = original[prop];
        } else {
          element.style.removeProperty(stylePropNames[idx]);
        }
      });

      // Clean up WeakMap entry
      this.originalStyles.delete(element);
    }

    /**
     * Update info about the current element
     */
    updateInfo(element) {
      if (!element) return;

      const computed = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      // Get CSS selector path
      const selectorPath = this.getCSSPath(element);

      // Get parent hierarchy
      const hierarchy = this.getHierarchy(element);

      // Get classes and ID
      const classes = element.className ?
        (typeof element.className === 'string' ? element.className : element.className.baseVal || '') : '';
      const id = element.id || '';

      // Get text content (truncated)
      let textContent = element.textContent?.trim() || '';
      if (textContent.length > 100) {
        textContent = textContent.substring(0, 100) + '...';
      }

      // Get important attributes
      const attrs = this.getImportantAttributes(element);

      // Get computed styles (AI-relevant)
      const styles = {
        display: computed.display,
        position: computed.position,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight,
        width: `${rect.width.toFixed(1)}px`,
        height: `${rect.height.toFixed(1)}px`,
        margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
        padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
        border: computed.border,
        borderRadius: computed.borderRadius,
        zIndex: computed.zIndex
      };

      this.info = {
        sourceFile: element.getAttribute('data-source-file'),
        sourceLine: element.getAttribute('data-source-line'),
        tag: element.tagName.toLowerCase(),
        id: id,
        classes: classes,
        selectorPath: selectorPath,
        hierarchy: hierarchy,
        textContent: textContent,
        attributes: attrs,
        styles: styles,
        rect: {
          x: rect.x.toFixed(1),
          y: rect.y.toFixed(1),
          width: rect.width.toFixed(1),
          height: rect.height.toFixed(1)
        }
      };
    }

    /**
     * Get CSS selector path for an element
     */
    getCSSPath(element) {
      const path = [];
      let current = element;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.tagName.toLowerCase();

        if (current.id) {
          selector += `#${current.id}`;
          path.unshift(selector);
          break; // ID is unique, stop here
        } else if (current.className && typeof current.className === 'string') {
          const classes = current.className.trim().split(/\s+/).filter(c => !c.startsWith('ei-'));
          if (classes.length > 0) {
            selector += `.${classes.join('.')}`;
          }
        }

        // Add nth-child if needed for specificity
        if (current.parentElement) {
          const siblings = Array.from(current.parentElement.children);
          const index = siblings.indexOf(current) + 1;
          if (siblings.length > 1) {
            selector += `:nth-child(${index})`;
          }
        }

        path.unshift(selector);
        current = current.parentElement;

        // Limit depth to avoid huge selectors
        if (path.length >= 5) break;
      }

      return path.join(' > ');
    }

    /**
     * Get parent hierarchy
     */
    getHierarchy(element) {
      const hierarchy = [];
      let current = element.parentElement;
      let depth = 0;

      while (current && depth < 5) {
        let label = current.tagName.toLowerCase();
        if (current.id) label += `#${current.id}`;
        else if (current.className && typeof current.className === 'string') {
          const classes = current.className.trim().split(/\s+/).slice(0, 2).filter(c => !c.startsWith('ei-'));
          if (classes.length > 0) label += `.${classes.join('.')}`;
        }
        hierarchy.push(label);
        current = current.parentElement;
        depth++;
      }

      return hierarchy;
    }

    /**
     * Get important element attributes
     */
    getImportantAttributes(element) {
      const important = ['href', 'src', 'alt', 'title', 'type', 'value', 'placeholder', 'name', 'action', 'method'];
      const attrs = {};

      important.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) attrs[attr] = value;
      });

      return attrs;
    }

    /**
     * Render the info panel (minimal view)
     */
    renderInfo() {
      if (!this.info) return;

      const { tag, sourceFile, sourceLine, id, classes, selectorPath, hierarchy, textContent, attributes } = this.info;

      // Update tag name in header
      this.container.querySelector('.ei-tag-name').textContent = `<${tag}>`;

      // Build content HTML - minimal view
      let html = '';

      // Source location (essential)
      html += `
        <div class="ei-section">
          <div class="ei-section-title">Source Location</div>
          <div class="ei-row">
            <span class="ei-label">File</span>
            <span class="ei-value ei-value-file">${this.escapeHTML(sourceFile)}</span>
          </div>
          <div class="ei-row">
            <span class="ei-label">Line</span>
            <span class="ei-value-highlight ei-text-yellow">${sourceLine}</span>
          </div>
        </div>
      `;

      // Element identity (essential)
      html += `<div class="ei-section"><div class="ei-section-title">Element</div>`;

      if (classes) {
        html += `
          <div class="ei-row">
            <span class="ei-label">Classes</span>
            <span class="ei-value ei-text-cyan">${this.escapeHTML(classes)}</span>
          </div>
        `;
      }

      if (id) {
        html += `
          <div class="ei-row">
            <span class="ei-label">ID</span>
            <span class="ei-value ei-text-purple">#${this.escapeHTML(id)}</span>
          </div>
        `;
      }

      html += `</div>`;

      // Text content (if present)
      if (textContent) {
        html += `
          <div class="ei-section">
            <div class="ei-section-title">Content</div>
            <div class="ei-value ei-text-green italic">"${this.escapeHTML(textContent)}"</div>
          </div>
        `;
      }

      // Selector (for precision)
      html += `
        <div class="ei-section">
          <div class="ei-section-title">Selector</div>
          <div class="ei-value ei-text-cyan">${this.escapeHTML(selectorPath)}</div>
        </div>
      `;

      // Parent (minimal context)
      if (hierarchy.length > 0) {
        html += `
          <div class="ei-section">
            <div class="ei-section-title">Parent</div>
            <div class="ei-value">${this.escapeHTML(hierarchy[0])}</div>
          </div>
        `;
      }

      // Important attributes only (if any)
      if (Object.keys(attributes).length > 0) {
        html += `
          <div class="ei-section">
            <div class="ei-section-title">Attributes</div>
        `;
        for (const [key, value] of Object.entries(attributes)) {
          html += `
            <div class="ei-row">
              <span class="ei-label">${this.escapeHTML(key)}</span>
              <span class="ei-value">${this.escapeHTML(value)}</span>
            </div>
          `;
        }
        html += `</div>`;
      }

      // Locked badge
      if (this.isLocked) {
        html += `
          <div class="ei-locked-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Locked - Press Escape to unlock</span>
          </div>
        `;
      }

      this.contentPanel.innerHTML = html;
    }

    /**
     * Copy element info to clipboard (Aider-ready format)
     */
    copyToClipboard() {
      if (!this.info) return;

      const { tag, sourceFile, sourceLine, id, classes, selectorPath, hierarchy, textContent, attributes } = this.info;

      // Format for Aider
      let text = `/add ${sourceFile}\n\n`;

      // Build element description
      text += `Edit line ${sourceLine} - the <${tag}>`;

      if (classes) {
        text += ` with class "${classes}"`;
      } else if (id) {
        text += ` with id "${id}"`;
      }

      if (textContent) {
        text += ` that contains:\n"${textContent}"\n`;
      } else {
        text += '\n';
      }

      text += '\n';

      // Add selector for precision
      text += `Selector: ${selectorPath}\n`;

      // Add parent context if available
      if (hierarchy.length > 0) {
        text += `Parent: <${hierarchy[0]}>\n`;
      }

      // Add important attributes if any
      if (Object.keys(attributes).length > 0) {
        text += `Attributes: ${Object.entries(attributes).map(([k, v]) => `${k}="${v}"`).join(', ')}\n`;
      }

      navigator.clipboard.writeText(text).then(() => {
        this.showCopyFeedback();
      }).catch(err => {
        console.error('Failed to copy:', err);
        this.showToast('Failed to copy', true);
      });
    }

    /**
     * Show copy button feedback
     */
    showCopyFeedback() {
      const copyBtn = this.copyBtn;
      const originalHTML = copyBtn.innerHTML;

      // Change to checkmark
      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      copyBtn.classList.add('ei-copy-success');

      // Show toast
      this.showToast('Copied to clipboard!');

      // Restore original icon after 2 seconds
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('ei-copy-success');
      }, 2000);
    }

    /**
     * Show a temporary toast message
     */
    showToast(message, isError = false) {
      const toast = document.createElement('div');
      toast.className = 'ei-toast' + (isError ? ' ei-toast-error' : '');
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('ei-toast-show');
      }, 10);

      setTimeout(() => {
        toast.classList.remove('ei-toast-show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }

    /**
     * Convert camelCase to kebab-case
     */
    camelToKebab(str) {
      return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Escape HTML for safe rendering
     */
    escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
      this.disableInspection();
      document.removeEventListener('keydown', this.handleKeyPress);
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      const style = document.getElementById('element-inspector-keyframes');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }
  }

  // Auto-initialize
  if (typeof window !== 'undefined') {
    window.ElementInspector = ElementInspector;
    window.elementInspector = new ElementInspector();
  }
})();
