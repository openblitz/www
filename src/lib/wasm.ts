import { engineLoaded } from '$lib/stores';
import init, { tokenize } from './www';

export async function loadEngine() {
	try {
		console.log('HERE')
		await init('/www_bg.wasm');
		console.log('DONE')
		engineLoaded.set(true);

		console.log(tokenize('abc'))
	} catch (error) {
		console.error(error)
		engineLoaded.set(false);
	}
}
