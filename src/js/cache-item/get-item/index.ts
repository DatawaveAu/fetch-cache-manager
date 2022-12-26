import { CacheItem, RunnerResponse, FetchOptions } from '../..';
import { resolveCallbacks } from '..';
import { AgentCache } from '../../cache-provider';

interface CacheItemProps {
    cache: AgentCache;
    key: string;
    url: string;
    cacheTtlMs: number;
    options: FetchOptions;
}

function getUpdatedResults<T>(cacheItem: CacheItem<T>, error: Error, response: RunnerResponse<T>) {
    cacheItem.abort = null;
    cacheItem.isFetching = false;
    cacheItem.isFetched = true;
    cacheItem.value = response;
    cacheItem.error = error;
    cacheItem.lastUpdate = Date.now();

    return cacheItem;
}

export default async function getItem<T>({ cache, key, cacheTtlMs, options, url }: CacheItemProps) {
    const cacheItem = await cache.getItem(key);

    if(!cacheItem) {
        const cacheItem: CacheItem<T> = {
            key,
            url,
            cacheTtlMs,
            callbacks: [],
            lastUpdate: null,
            value: null,
            error: null,
            isFetching: false,
            isFetched: false,
            nextRefresh: null,
            options,
            abort: null,
            async callback(error: Error, response: RunnerResponse<T>) {
                if (error?.name === 'AbortError') {
                    return;
                }

                await cache.setItem(key, getUpdatedResults(cacheItem, error, response));
                await resolveCallbacks({ key, cache });
            }
        };

        await cache.setItem(key, cacheItem);
    }

    return cache.getItem(key);
}
