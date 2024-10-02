<script>
	let promptText = '';
	let cronExpression = '';
	let loading = false;
	let errorMessage = '';

	// Function to fetch the Cron expression from the API
	async function getCronExpression() {
		loading = true;
		errorMessage = '';
		cronExpression = '';

		try {
			const response = await fetch('https://openblitz--cronformer.modal.run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt: promptText }),
			});

			if (response.ok) {
				const data = await response.json();
				cronExpression = data.cron;  // Assuming the response contains a 'cron' field
			} else {
				errorMessage = 'Failed to get Cron expression from the API';
			}
		} catch (error) {
			errorMessage = 'An error occurred: ' + error.message;
		} finally {
			loading = false;
		}
	}
</script>

<style>
    button {
        padding: 10px;
        cursor: pointer;
    }

    .loading {
        color: gray;
    }

    .error {
        color: red;
    }
</style>

<svelte:head>
	<meta property="og:title" content="Cronformer" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content="Convert English to Cron expressions, quickly." />
	<meta property="og:image" content="https://openblitz.dev/logo.jpeg" />

	<title>Blog | Article title</title>
	<meta name="description" content="<short description>" />
</svelte:head>

<main class="flex flex-col gap-4 max-w-6xl mx-auto p-8 md:p-12">
	<section class="flex flex-col md:flex-row md:items-start gap-4 justify-between md:mb-2">
		<section class="flex flex-col gap-2">
			<h1 class="font-bold text-4xl text-primary-900 tracking-tighter">Cronformer</h1>
			<p class="ml-0.5 text-gray-500">Made with love by <a class="underline" href="https://shukantpal.com" target="_blank">Shukant Pal</a></p>
		</section>
	</section>
	<section class="flex flex-col gap-2 w-full">
		<label class="font-medium text-sm" for="prompt">English Prompt</label>
		<input
			id="prompt"
			type="text"
			bind:value={promptText}
			placeholder="e.g., midnight on Mondays"
		/>
	</section>

	<button class="font-medium text-white bg-black" on:click={getCronExpression} disabled={loading || !promptText}>
		{loading ? 'Loading...' : 'Get Cron Expression'}
	</button>

	{#if loading}
		<p class="loading">Fetching Cron expression...</p>
	{/if}

	<section class="flex flex-col gap-2 mt-8 w-full">
		<p class="font-medium text-sm">Cron Expression</p>
		<p class="border-2 border-black bg-gray-200 w-full h-10">
			{cronExpression ?? "..."}
		</p>
	</section>

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
</main>