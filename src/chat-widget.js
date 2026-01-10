// Chat Widget - Vanilla JS Version
export class ChatWidget {
  constructor(container) {
    this.container = container;
    this.isOpen = false;
    this.messages = [];
    this.inputValue = '';
    this.isLoading = false;
    this.inspectorActive = false;
    this.inspectorFile = null;

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for inspector messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'inspector-state') {
          console.log('Received inspector-state:', event.data.active);
          this.inspectorActive = event.data.active;
          this.updateInspectorButton();
        } else if (event.data.type === 'inspector-ready') {
          console.log('Inspector ready in iframe');
        } else if (event.data.type === 'inspector-insert') {
          console.log('Received inspector-insert:', event.data.data);
          this.inspectorFile = event.data.data.file;
          this.inputValue = event.data.data.description;
          const input = this.container.querySelector('.chat-input');
          if (input) {
            input.value = this.inputValue;
            input.focus();
          }
        }
      }
    });
  }

  toggleInspector() {
    console.log('Attempting to toggle inspector...');
    const iframe = document.querySelector('iframe[src*="/templates/"]');
    if (iframe && iframe.contentWindow) {
      console.log('Iframe found, sending inspector-toggle message');
      try {
        iframe.contentWindow.postMessage({ type: 'inspector-toggle' }, '*');
      } catch (err) {
        console.error('Failed to send message to iframe:', err);
      }
    } else {
      console.warn('Inspector toggle failed: iframe not found or not ready');
    }
  }

  async sendMessage() {
    const input = this.container.querySelector('.chat-input');
    if (!input || !input.value.trim() || this.isLoading) return;

    const userMessage = input.value.trim();
    const fileToEdit = this.inspectorFile;

    // Clear input and inspector context
    input.value = '';
    this.inputValue = '';
    this.inspectorFile = null;

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    this.isLoading = true;
    this.render();

    try {
      // Extract template name from current URL
      const templateMatch = window.location.pathname.match(/templates\/([^\/\.]+)/);
      const templateName = templateMatch ? templateMatch[1] : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          template: templateName,
          file: fileToEdit
        })
      });

      const data = await response.json();

      if (data.error) {
        this.messages.push({
          role: 'assistant',
          content: `Error: ${data.error}`,
          timestamp: new Date().toISOString()
        });
      } else {
        this.messages.push({
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        });
      }
    } catch (error) {
      this.messages.push({
        role: 'assistant',
        content: `Failed to send message: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isLoading = false;
      this.render();
      // Scroll to bottom
      const messagesContainer = this.container.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }

  updateInspectorButton() {
    const btn = this.container.querySelector('.inspector-toggle-btn');
    if (btn) {
      if (this.inspectorActive) {
        btn.classList.add('bg-green-900/30', 'text-green-400');
        btn.innerHTML = this.getEyeIcon();
      } else {
        btn.classList.remove('bg-green-900/30', 'text-green-400');
        btn.innerHTML = this.getEyeOffIcon();
      }
    }
  }

  getMessageSquareIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  }

  getSendIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
  }

  getXIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  }

  getEyeIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }

  getEyeOffIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
  }

  render() {
    const html = `
      ${!this.isOpen ? `
        <button class="chat-fab fixed bottom-6 right-6 btn bg-black text-white hover:bg-zinc-800 border-none btn-circle btn-lg shadow-lg hover:shadow-xl transition-all z-50">
          ${this.getMessageSquareIcon()}
        </button>
      ` : `
        <div class="chat-panel fixed bottom-0 right-0 w-full md:w-[480px] h-[600px] bg-black text-white border-l border-t border-zinc-800 shadow-2xl z-50 flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
            <div class="flex items-center gap-2">
              ${this.getMessageSquareIcon()}
              <h3 class="font-semibold">Demon CLI</h3>
            </div>
            <div class="flex items-center gap-2">
              <button class="inspector-toggle-btn btn btn-ghost btn-sm btn-circle text-white hover:bg-zinc-800 ${this.inspectorActive ? 'bg-green-900/30 text-green-400' : ''}" title="${this.inspectorActive ? 'Disable Inspector' : 'Enable Inspector'}">
                ${this.inspectorActive ? this.getEyeIcon() : this.getEyeOffIcon()}
              </button>
              <button class="close-btn btn btn-ghost btn-sm btn-circle text-white hover:bg-zinc-800">
                ${this.getXIcon()}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-container flex-1 overflow-y-auto p-4 space-y-4 bg-black">
            ${this.messages.length === 0 ? `
              <div class="text-center text-zinc-500 py-8">
                ${this.getMessageSquareIcon()}
                <p>Start a conversation with Demon CLI</p>
                <p class="text-sm mt-1">Ask anything about your code</p>
              </div>
            ` : this.messages.map(msg => `
              <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%] ${msg.role === 'user' ? 'bg-zinc-800 text-white shadow-md' : 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'} rounded-lg px-4 py-2 select-text">
                  <div class="text-sm whitespace-pre-wrap font-mono selection:bg-blue-500 selection:text-white">${this.escapeHtml(msg.content)}</div>
                  <div class="text-xs opacity-40 mt-1">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            `).join('')}
            ${this.isLoading ? `
              <div class="flex justify-start">
                <div class="bg-zinc-900 rounded-lg px-4 py-2 shadow-sm border border-zinc-800">
                  <span class="loading loading-dots loading-sm"></span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Input -->
          <div class="border-t border-zinc-800 p-4 bg-zinc-900">
            <form class="chat-form flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a command..."
                class="chat-input input input-bordered w-full focus:outline-none border-zinc-700 bg-black text-white transition-colors"
                ${this.isLoading ? 'disabled' : ''}
              />
              <button
                type="submit"
                ${this.isLoading ? 'disabled' : ''}
                class="btn btn-square bg-white text-black hover:bg-zinc-200 border-none shadow-md"
              >
                ${this.getSendIcon()}
              </button>
            </form>
          </div>
        </div>
      `}
    `;

    this.container.innerHTML = html;
    this.attachEventHandlers();
  }

  attachEventHandlers() {
    const fab = this.container.querySelector('.chat-fab');
    if (fab) {
      fab.addEventListener('click', () => {
        this.isOpen = true;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.isOpen = false;
        this.render();
      });
    }

    const inspectorBtn = this.container.querySelector('.inspector-toggle-btn');
    if (inspectorBtn) {
      inspectorBtn.addEventListener('click', () => this.toggleInspector());
    }

    const form = this.container.querySelector('.chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
