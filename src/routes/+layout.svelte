<script>
	import { loadEngine } from '$lib';
	import { onMount } from 'svelte';

	onMount(() => {
		void loadEngine();
	});
</script>
<slot></slot>
