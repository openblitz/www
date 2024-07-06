import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig({
	plugins: [sveltekit(), comlink()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	worker: {
		plugins() {
			return [comlink()];
		}
	},
});
