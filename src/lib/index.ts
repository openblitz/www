import type { Encoding } from '$lib/types';

interface AppWorker {
	encode(repoId: string, text: string): Promise<Encoding>;
	make(type: 'tokenizer', repoId: string): Promise<string>;
}

export let worker: InstanceType<typeof ComlinkWorker> & AppWorker;

if (typeof window !== 'undefined') {
	worker = new ComlinkWorker<typeof import("$worker")>(
		new URL("../worker/index", import.meta.url),
		{ type: "module" }
	)
}

export * from './queue';
export * from './repos';
export * from './stores';
export * from './types';
