import { writable } from 'svelte/store';

export const inited = writable(false);
export const worker = writable<InstanceType<typeof ComlinkWorker> | null>(null);
