import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'vitest/config';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), comlink()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	worker: {
		plugins() {
			return [comlink()];
		}
	},
});
