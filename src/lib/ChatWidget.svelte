<script>
  import { MessageSquare, Send, X, Eye, EyeOff } from 'lucide-svelte';
  import { page } from '$app/stores';

  let isOpen = $state(false);
  let messages = $state([]);
  let inputValue = $state('');
  let isLoading = $state(false);
  let inspectorActive = $state(false);

  // Toggle inspector in iframe
  function toggleInspector() {
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
      // Fallback: try finding any iframe
      const anyIframe = document.querySelector('iframe');
      if (anyIframe) {
         console.log('Found fallback iframe:', anyIframe.src);
      }
    }
  }

  // Store inspector file context
  let inspectorFile = $state(null);

  // Listen for inspector state changes and insertions from iframe
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      // Only handle inspector messages
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'inspector-state') {
          console.log('Received inspector-state:', event.data.active);
          inspectorActive = event.data.active;
        } else if (event.data.type === 'inspector-ready') {
          console.log('Inspector ready in iframe');
        } else if (event.data.type === 'inspector-insert') {
          console.log('Received inspector-insert:', event.data.data);
          // Store file context for Aider
          inspectorFile = event.data.data.file;
          // Populate input with description
          inputValue = event.data.data.description;
          // Focus input so user can continue typing
          setTimeout(() => {
            const input = document.querySelector('.chat-input');
            if (input) input.focus();
          }, 100);
        }
      }
    });
  }

  async function sendMessage() {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const fileToEdit = inspectorFile;

    // Clear input and inspector context
    inputValue = '';
    inspectorFile = null;

    // Add user message
    messages = [...messages, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }];

    isLoading = true;

    try {
      // Extract template name from current URL path
      const templateMatch = $page.url.pathname.match(/\/templates\/([^\/]+)/);
      const templateName = templateMatch ? templateMatch[1] : null;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          template: templateName,
          file: fileToEdit  // Send file context from inspector
        })
      });

      const data = await response.json();

      if (data.error) {
        messages = [...messages, {
          role: 'assistant',
          content: `Error: ${data.error}`,
          timestamp: new Date().toISOString()
        }];
      } else {
        messages = [...messages, {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }];
      }
    } catch (error) {
      messages = [...messages, {
        role: 'assistant',
          content: `Failed to send message: ${error.message}`,
        timestamp: new Date().toISOString()
      }];
    } finally {
      isLoading = false;
    }
  }

</script>

<!-- Floating chat button -->
{#if !isOpen}
  <button
    onclick={() => isOpen = true}
    class="fixed bottom-6 right-6 btn bg-black text-white hover:bg-zinc-800 border-none btn-circle btn-lg shadow-lg hover:shadow-xl transition-all z-50"
  >
    <MessageSquare class="w-6 h-6" />
  </button>
{/if}

<!-- Chat panel -->
{#if isOpen}
  <div class="fixed bottom-0 right-0 w-full md:w-[480px] h-[600px] bg-black text-white border-l border-t border-zinc-800 shadow-2xl z-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
      <div class="flex items-center gap-2">
        <MessageSquare class="w-5 h-5" />
        <h3 class="font-semibold">Demon CLI</h3>
      </div>
      <div class="flex items-center gap-2">
        <button
          onclick={toggleInspector}
          class="btn btn-ghost btn-sm btn-circle text-white hover:bg-zinc-800 {inspectorActive ? 'bg-green-900/30 text-green-400' : ''}"
          title={inspectorActive ? 'Disable Inspector' : 'Enable Inspector'}
        >
          {#if inspectorActive}
            <Eye class="w-5 h-5" />
          {:else}
            <EyeOff class="w-5 h-5" />
          {/if}
        </button>
        <button onclick={() => isOpen = false} class="btn btn-ghost btn-sm btn-circle text-white hover:bg-zinc-800">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
      {#if messages.length === 0}
        <div class="text-center text-zinc-500 py-8">
          <MessageSquare class="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Start a conversation with Demon CLI</p>
          <p class="text-sm mt-1">Ask anything about your code</p>
        </div>
      {/if}

      {#each messages as message}
        <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[80%] {message.role === 'user' ? 'bg-zinc-800 text-white shadow-md' : 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'} rounded-lg px-4 py-2 select-text">
            <div class="text-sm whitespace-pre-wrap font-mono selection:bg-blue-500 selection:text-white" style="user-select: text; -webkit-user-select: text;">{message.content}</div>
            <div class="text-xs opacity-40 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      {/each}

      {#if isLoading}
        <div class="flex justify-start">
          <div class="bg-zinc-900 rounded-lg px-4 py-2 shadow-sm border border-zinc-800">
            <span class="loading loading-dots loading-sm"></span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Input -->
    <div class="border-t border-zinc-800 p-4 bg-zinc-900">
      <form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a command..."
          bind:value={inputValue}
          disabled={isLoading}
          class="chat-input input input-bordered w-full focus:outline-none border-zinc-700 bg-black text-white transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          class="btn btn-square bg-white text-black hover:bg-zinc-200 border-none shadow-md"
        >
          <Send class="w-5 h-5" />
        </button>
      </form>
    </div>
  </div>
{/if}