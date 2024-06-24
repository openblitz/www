import { TokenizerWrapper } from './www';

export async function load({
	repoId
}: {
	repoId: string
}) {
	const tokenizerJson = await fetch(`/api/hf/${repoId}/tokenizer`).then(res => res.text());

	return TokenizerWrapper.from(tokenizerJson);
}
