export const REPOS = [
	'meta-llama/Meta-Llama-3-8B-Instruct',
	'meta-llama/Meta-Llama-3-70B-Instruct',
	'mistralai/Mistral-7B-Instruct-v0.2',
	'mistralai/Mistral-7B-Instruct-v0.3',
	'google/gemma-2-9b',
	'Qwen/Qwen2-72B',
	'Xenova/gpt-4o',
]

export const REPOS_CATEGORIZED: Record<string, Array<typeof REPOS[number]>> = {
	"Llama": [
		'meta-llama/Llama-2-7b-hf',
		'meta-llama/Meta-Llama-3-8B-Instruct',
		'meta-llama/Meta-Llama-3-70B-Instruct',
	],
	"Gemma": [
		'google/gemma-7b',
		'google/gemma-2-9b',
	],
	"Mistral": [
		'mistralai/Mistral-7B-Instruct-v0.2',
		'mistralai/Mistral-7B-Instruct-v0.3',
	]
}
