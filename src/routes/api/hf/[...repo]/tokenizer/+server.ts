import { type RequestEvent } from '@sveltejs/kit';
import { HF_TOKEN } from '$env/static/private';

export async function GET(req: RequestEvent) {
	const hfResponse = await fetch(`https://huggingface.co/${req.params.repo}/resolve/main/tokenizer.json`, {
		headers: {
			'Authorization': `Bearer ${HF_TOKEN}`,
			'Content-Type': 'application/json',
		}
	});

	if (hfResponse.ok) {
		return new Response(hfResponse.body, {
			headers: {
				'Cache-Control': 'public, max-age=86400',
				'Content-Type': 'application/json',
			},
			status: 200
		})
	}

	return new Response('Not found', { status: 404 });
}
