import init, { TokenizerWrapper } from './www';
import { computeDiff, type DiffResult } from './diff';

import type { Encoding } from '../lib/types';

const initPromise = init();
const makePromises = new Map<string, Promise<TokenizerWrapper>>();

export async function get(type: string, ...args: unknown[]) {
	await make(type, ...args);

	switch (type) {
		case 'tokenizer': {
			const makePromise = makePromises.get(args[0] as string);

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

export async function diff(oldText: string, newText: string, filename?: string): Promise<DiffResult> {
	return computeDiff(oldText, newText, filename);
}

export async function make(type: string, ...args: unknown[]) {
	switch (type) {
		case 'tokenizer': {
			const [repoId] = args;

		  const makePromise = makePromises.get(repoId as string) || new Promise<TokenizerWrapper>(
				(resolve) => {
					initPromise.then(async () => {
						const tokenizerJson = await fetch(`/api/hf/${repoId}/tokenizer`).then(res => res.text());
						resolve(TokenizerWrapper.from(tokenizerJson));
					});
				}
			);

			makePromises.set(repoId as string, makePromise);
			return makePromise.then(() => repoId);
		}
		default:
			throw new Error(`Unknown type: ${type}`);
	}
}
