import type { Encoding } from '$lib/types';
import type { DiffResult } from '../worker/diff';

interface AppWorker {
	encode(repoId: string, text: string): Promise<Encoding>;
	make(type: 'tokenizer', repoId: string): Promise<string>;
	diff(oldText: string, newText: string, filename?: string): Promise<DiffResult>;
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
