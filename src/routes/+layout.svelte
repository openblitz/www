<script>
	import init from '$lib/www';
	import { inited } from '$lib';
	import { onMount } from 'svelte';

	import '../app.css';

	onMount(() => {
		void init("/www_bg.wasm").then(function() {
			inited.set(true);
		});
	});
</script>
<slot></slot>
