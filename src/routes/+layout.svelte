<script>
	import "../app.css";
	let { children } = $props();
</script>

<div class="h-screen overflow-hidden bg-base-200 text-base-content font-sans selection:bg-primary selection:text-primary-content">
	{@render children()}
</div>