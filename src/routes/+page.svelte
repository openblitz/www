<script lang="ts">
	import { Button, Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { worker, inited, REPOS, REPOS_CATEGORIZED, queue, type Encoding } from '$lib';
	import { onMount } from 'svelte';

	let content: string | null = null;
	let dropdownOpen = false;
	let repoId: string | null = null;
	let slices: number[][] = []

	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			content = localStorage.getItem('tokenizer:content') || "";
			repoId = localStorage.getItem('tokenizer:repoId') || REPOS[0];
		}
	});

	function onClickTokenizer(event: MouseEvent) {
		dropdownOpen = false;
		repoId = (event.target as HTMLElement).textContent;
	}

	$: {
		if (typeof worker !== 'undefined' && repoId) {
			worker.make('tokenizer', repoId).then((t) => {
				console.log(t)
			});
			// getWorker().Tokenizer.from(tokenizerRepoId).then((t) => {
			// 	tokenizer = t;
			// });
		}
	}

	function tokenize(repoId: string, content: string) {
		if (!worker) return;

		queue('tokenizer', () => worker.encode(repoId, content)).then(function({ offsets, ...encoding }) {
		  let _slices = new Array(offsets.length);

			for (let i = 0; i < offsets.length - 1; i++) {
				const offset = offsets[i][0];
				const limit = offsets[i + 1][0];

				_slices[i] = [offset, limit];
			}

			if (offsets.length > 0) {
				_slices[_slices.length - 1] = [offsets.at(-1)[0], Math.max(content.length, offsets.at(-1)[1])];
			}

			slices = _slices;
		});
	}

	$: {
		if (typeof content === 'string' && typeof repoId === 'string') {
			tokenize(repoId, content);

			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('tokenizer:content', content);
				localStorage.setItem('tokenizer:repoId', repoId);
			}
		}
	}
</script>

<main class="flex flex-col gap-8 max-w-6xl mx-auto p-12">
	<section class="flex items-center justify-between">
		<h1 class="font-bold text-4xl text-primary-900 tracking-tighter">Tokenizer</h1>
		<div>
			<Button class="border-zinc-300 hover:bg-zinc-100 hover:text-primary-900 focus-within:ring-0 min-w-[20rem] justify-between py-1.5 pl-3 pr-1 w-fit" outline>
				<span class="text-bold">{#if repoId}{repoId}{/if}</span>
				<ChevronDownOutline class="text-gray-300 w-6 h-6 p-0 dark:text-white" />
			</Button>
			<Dropdown bind:open={dropdownOpen} activeClass="hover:text-primary-900 dark:hover:text-primary-900" classContainer="px-2">
				{#each Object.entries(REPOS_CATEGORIZED) as entry}
					<div class="mb-2 mt-6 first-of-type:mt-4 px-2 font-bold text-sm">{entry[0]}</div>
					{#each entry[1] as repo}
						<DropdownItem defaultClass="rounded-lg py-2 px-2 font-medium text-sm hover:bg-zinc-100 dark:hover:bg-gray-600" on:click={onClickTokenizer}>{repo}</DropdownItem>
					{/each}
				{/each}
			</Dropdown>
		</div>
	</section>
	<p>👷🛠️ This is a work in progress</p>

	<div class="flex justify-between gap-4 min-h-[30rem] w-full">
		<div class="basis-0 grow">
			<textarea class="box-border font-mono h-full rounded-md p-2 text-sm w-full" bind:value={content} rows="10" cols="50" placeholder="Type here..." />
		</div>
		<div class="basis-0 flex flex-col grow">
		  <pre class="border-[1px] bg-zinc-100 min-h-full h-full min-w-full w-full rounded-md text-sm whitespace-pre-wrap">{#each slices as slice}<span class="token">{content?.slice(slice[0], slice[1])}</span>{/each}</pre>
		</div>
	</div>

	<p>Made with love by <a class="underline" href="https://shukantpal.com" target="_blank">Shukant Pal</a></p>
</main>

<style>

.token:nth-child(5n + 1) {
	background-color: rgba(107, 64, 216, 0.3);
}
.token:nth-child(5n + 2) {
	background-color: rgba(104, 222, 122, 0.4);
}
.token:nth-child(5n + 3) {
	background-color: #f4ac3666;
}
.token:nth-child(5n + 4) {
	background-color: #ef414666;
}

.token:nth-child(5n) {
	background-color: #27b5ea66;
}

</style>
