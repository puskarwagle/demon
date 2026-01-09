<script>
  import ChatWidget from '$lib/ChatWidget.svelte';
</script>

<div class="min-h-screen flex items-center justify-center p-8">
  <div class="max-w-6xl w-full">
    <h1 class="text-4xl font-bold text-center mb-4">Choose a Template</h1>
    <p class="text-center text-base-content/70 mb-12">Select a template to get started with your project</p>

    <div class="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <!-- E-commerce Template Card -->
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <figure class="px-4 pt-4">
          <img
            src="https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop"
            alt="E-commerce Template Preview"
            class="rounded-xl w-full h-64 object-cover"
          />
        </figure>
        <div class="card-body">
          <h2 class="card-title text-2xl">E-commerce Template</h2>
          <p class="text-base-content/70">Modern online store with shopping cart, product listings, checkout flow, and vendor management. Perfect for retail businesses.</p>
          <div class="card-actions justify-end mt-4">
            <a href="/templates/ecommerce" class="btn btn-primary">View Template</a>
          </div>
        </div>
      </div>

      <!-- BotCloud Template Card -->
      <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <figure class="px-4 pt-4">
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop"
            alt="BotCloud Template Preview"
            class="rounded-xl w-full h-64 object-cover"
          />
        </figure>
        <div class="card-body">
          <h2 class="card-title text-2xl">BotCloud Template</h2>
          <p class="text-base-content/70">Professional AI solutions website designed for modern businesses offering automation, analytics, and intelligent services.</p>
          <div class="card-actions justify-end mt-4">
            <a href="/templates/botcloud" class="btn btn-primary">View Template</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<ChatWidget />