<svelte:head>
	<title>Tokenizer</title>
</svelte:head>
<script>
	import { inited, worker } from '$lib';
	import { onMount } from 'svelte';

	import '../app.css';

	onMount(() => {
			inited.set(true);
	});
</script>
<slot></slot>
