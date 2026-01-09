<script>
  import { onMount } from 'svelte';
  
  const themes = ["dark", "light", "valentine"];
  let currentTheme = "dark";

  function toggleTheme() {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  onMount(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  });
</script>

<div class="navbar bg-base-100 sticky top-0 z-50 shadow-lg border-b border-base-300">
  <div class="container mx-auto px-6">
    <div class="flex items-center justify-between w-full">
      <!-- Left: Logo -->
      <div class="flex-none">
        <a class="btn btn-ghost text-xl font-bold tracking-widest uppercase">Demon</a>
      </div>

      <!-- Center: Search Bar -->
      <div class="flex-1 max-w-2xl mx-auto px-4">
        <div class="form-control w-full">
          <input type="text" placeholder="Search templates..." class="input input-bordered w-full" />
        </div>
      </div>

      <!-- Right: Theme & Icons -->
      <div class="flex-none flex items-center gap-2">
        <!-- Theme Switcher -->
        <button class="btn btn-ghost btn-circle" on:click={toggleTheme} aria-label="Toggle theme">
          {#if currentTheme === 'light'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          {:else if currentTheme === 'valentine'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {:else}
            <!-- Default to dark/moon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          {/if}
        </button>

        <button class="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>

        <button class="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </button>
      </div>
    </div>
  </div>
</div>