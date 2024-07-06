import init, { TokenizerWrapper } from './www';

import type { Encoding } from '../lib/types';

declare const self: DedicatedWorkerGlobalScope;

const initPromise = init();
const makePromises = new Map<string, Promise<any>>();

export async function get(type: string, ...args: any[]) {
	await make(type, ...args);

	switch (type) {
		case 'tokenizer': {
			const makePromise = makePromises.get(args[0]);

			if (!makePromise) {
				throw new Error('Tokenizer not found');
			}

			return makePromise;
		}
		default: {
			throw new Error(`Unknown type: ${type}`);
		}
	}
}

export async function encode(repoId: string, text: string): Promise<Encoding> {
  const tokenizer = await get('tokenizer', repoId);

	return tokenizer.encode(text);
}

export async function make(type: string, ...args: any[]) {
	switch (type) {
		case 'tokenizer': {
			const [repoId] = args;

		  let makePromise = makePromises.get(repoId) || new Promise(
				async (resolve, reject) => {
					await initPromise;
					const tokenizerJson = await fetch(`/api/hf/${repoId}/tokenizer`).then(res => res.text());

					resolve(TokenizerWrapper.from(tokenizerJson));
				}
			)

			makePromises.set(repoId, makePromise);
			return makePromise.then((_) => repoId);
		}
		default:
			throw new Error(`Unknown type: ${type}`);
	}
}
