<script>
  import ChatWidget from '$lib/ChatWidget.svelte';
</script>

<div class="fixed inset-0 w-full h-full flex flex-col">
  <div class="bg-base-100 border-b border-base-300 p-4 flex justify-between items-center">
    <a href="/" class="btn btn-ghost btn-sm gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Templates
    </a>
    <h2 class="text-lg font-semibold">E-commerce Template</h2>
  </div>
  <iframe
    src="/templates/ecommerce/index.html"
    title="E-commerce Template"
    class="flex-1 w-full border-0"
  ></iframe>
</div>
<ChatWidget />
