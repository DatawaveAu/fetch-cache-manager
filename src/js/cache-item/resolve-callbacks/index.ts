import { AgentCache } from '../../cache-provider';

interface ResolveCallbacksParams {
    key: string;
    cache: AgentCache
}

export default async function resolveCallbacks({ key, cache }: ResolveCallbacksParams) {
    const cacheItem = await cache.getItem(key);
    const { value, error, callbacks } = cacheItem;
    const expiresInMs = await cache.expiresIn(key);
    const toRun = callbacks;

    cacheItem.callbacks = callbacks.slice().filter(({ frequencyMs }) => frequencyMs);

    await cache.setItem(key, cacheItem);

    toRun.forEach(({ callback }) => callback(error, {
        response: value,
        expiresInMs,
        isCacheable: true,
    }));
}
