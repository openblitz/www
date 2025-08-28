<script>
	import { inited, worker } from '$lib';
	import { themeStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import '../app.css';

	let { children } = $props();

	onMount(() => {
		inited.set(true);
		
		// Get the theme from server data if available
		const serverTheme = $page.data?.theme;
		if (serverTheme) {
			// Sync client store with server state
			themeStore.set(serverTheme);
		} else {
			// Fallback to client-side init
			themeStore.init();
		}
	});
</script>

{@render children()}