const pendingPromiseMap = new Map<string, Promise<any>>();
const nextJobMap = new Map<string, () => Promise<any>>();

export function queue(channel: string, fn: () => Promise<any>): Promise<any> {
	const pendingPromise = pendingPromiseMap.get(channel);
	let promise: Promise<any>;

	if (pendingPromise) {
	  nextJobMap.set(channel, fn);
		promise = pendingPromise;
	} else {
		promise = fn();

		pendingPromiseMap.set(channel, promise.then(function next(value) {
			const nextJob = nextJobMap.get(channel);

			if (nextJob) {
				nextJobMap.delete(channel);
				pendingPromiseMap.set(channel, nextJob().then(next));
			} else {
				pendingPromiseMap.delete(channel);
			}

			return value;
		}));
	}

	return promise;
}
