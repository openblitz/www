<script lang="ts">
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { inited, REPOS, tokenizers, type TokenizerWrapper } from '$lib';
	import { onMount } from 'svelte';

	let content = "";
	let tokenizerRepoId: string | null = null;
	let tokenizer: TokenizerWrapper | null = null;

	onMount(() => {
		tokenizerRepoId = REPOS[1];
	});

	function onClickTokenizer(event: MouseEvent) {
		tokenizerRepoId = (event.target as HTMLElement).textContent;
	}

	$: tokenizerRepoId && $inited ? tokenizers.load({ repoId: tokenizerRepoId }).then((t) => {
		tokenizer = t;
	}) : null;
	$: vocab = tokenizer ? Object.fromEntries([...tokenizer.get_vocab().entries()].map(([k, v]) => [v, tokenizer!.decode([v])])) : null;
	$: chunks = tokenizer && vocab ? Array.from(tokenizer.encode(content)).map((tokenId) => vocab[tokenId]) : [];
</script>

<main class="flex flex-col gap-8">
	<section class="flex flex-col gap-2">
		<h1 class="text-3xl">Hacky Online Tokenizer</h1>
		<p>Looks ugly? Working on it</p>
	</section>

	<Button class="w-fit">{tokenizerRepoId}<ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" /></Button>
	<Dropdown>
		{#each REPOS as repo}
			<DropdownItem on:click={onClickTokenizer}>{repo}</DropdownItem>
		{/each}
	</Dropdown>

	<table class="w-full">
		<tbody>
		<tr>
			<td class="w-1/2 overflow-hidden"><textarea bind:value={content} rows="10" cols="50" placeholder="Type here..."></textarea>
			</td>
			<td class="w-1/2 block">
			<div class="h-full flex">
				{#each chunks as chunk}
					<span class="">
						{chunk}
					</span>
				{/each}
			</div>
			</td>
		</tr>
		</tbody>
	</table>
	<section>
	<p>Text length: {content.length} characters</p>
	<p>Token count: {chunks.length} characters</p>
	</section>
	<p>Made with love by <a class="underline" href="https://shukantpal.com" target="_blank">Shukant Pal</a></p>
</main>

<style>
    textarea {
        width: 100%;
	    	min-height: 200px;
  		  padding: 10px;
        box-sizing: border-box;
    		font-size: 16px;
    }

    main {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h1 {
        color: #333;
    }
</style>
