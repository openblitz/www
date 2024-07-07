<script lang="ts">
	import { Button, Dropdown, DropdownItem, Spinner } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { worker, REPOS, REPOS_CATEGORIZED, queue } from '$lib';
	import { onMount } from 'svelte';

	let content: string | null = null;
	let dropdownOpen = false;
	let loading = true;
	let repoId: string | null = null;
	let slices: number[][] = [];

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

	function markLoading() {
		loading = true;
	}
	function markLoaded() {
		loading = false;
	}

	$: {
		if (typeof worker !== 'undefined' && repoId) {
			markLoading();
			worker.make('tokenizer', repoId).finally(() => {
				markLoaded();
			});
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

<main class="flex flex-col gap-4 max-w-6xl mx-auto p-8 md:p-12">
	<section class="flex flex-col md:flex-row md:items-start gap-4 justify-between md:mb-2">
		<section class="flex flex-col gap-2">
			<h1 class="font-bold text-4xl text-primary-900 tracking-tighter">Tokenizer</h1>
			<p class="ml-0.5 text-gray-500">Made with love by <a class="underline" href="https://shukantpal.com" target="_blank">Shukant Pal</a></p>
		</section>
		<div>
			<Button class="override hover:bg-slate-50/85 hover:text-primary-900 focus-within:ring-0 sm:min-w-[22rem] justify-between py-1.5 pl-3 pr-1 mt-1 w-full md:w-fit" outline>
				<div class="flex gap-2 items-center text-bold">{#if repoId}{repoId}{/if}{#if loading}<Spinner size={4} />{/if}</div>
				<ChevronDownOutline class="text-gray-300 w-6 h-6 p-0 dark:text-white" />
			</Button>
			<Dropdown bind:open={dropdownOpen} activeClass="hover:text-primary-900 dark:hover:text-primary-900" classContainer="px-2 min-w-[22rem] w-[calc(100%-4rem)] md:w-fit">
				{#each Object.entries(REPOS_CATEGORIZED) as entry}
					<div class="mb-2 mt-6 first-of-type:mt-4 px-2 font-bold text-sm">{entry[0]}</div>
					{#each entry[1] as repo}
						<DropdownItem defaultClass="rounded-lg py-2 px-2 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-gray-600" on:click={onClickTokenizer}>{repo}</DropdownItem>
					{/each}
				{/each}
			</Dropdown>
		</div>
	</section>
	<div class="flex flex-col lg:flex-row justify-between gap-4 md:min-h-[30rem] w-full">
		<div class="basis-0 grow">
			<textarea class="box-border font-mono h-full rounded-md p-4 w-full" bind:value={content} rows="10" cols="50" placeholder="Type here..." />
		</div>
		<div class="basis-0 flex flex-col grow gap-4">
			<div class="flex gap-4">
				<section class="border-[1px] bg-slate-50/85 flex flex-col grow h-20 rounded-lg p-4">
					<p class="text-gray-500 text-sm">Token count</p>
					<section class="flex flex-col grow justify-center">
						<h4 class="font-medium">{slices.length}</h4>
					</section>
				</section>
				<section class="border-[1px] bg-slate-50/85 flex flex-col grow h-20 rounded-lg p-4">
					<p class="text-gray-500 text-sm">Character count</p>
					<section class="flex flex-col grow justify-center">
						<h4 class="font-medium">{content?.length || 0}</h4>
					</section>
				</section>
			</div>
		  <pre class="border-[1px] bg-slate-50/85 min-h-full h-full min-w-full w-full rounded-md p-4 whitespace-pre-wrap">{#each slices as slice}<span class="token">{content?.slice(slice[0], slice[1])}</span>{/each}</pre>
		</div>
	</div>
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
