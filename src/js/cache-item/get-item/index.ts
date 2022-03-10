import { CacheItem, RunnerResponse, FetchOptions } from '../..';
import { AgentCache } from '../../agent/add-agent';
import { resolveCallbacks } from '..';

interface CacheItemProps {
    cache: AgentCache;
    key: string;
    url: string;
    cacheTtlMs: number;
    options: FetchOptions;
}

function saveResult<T>(cacheItem: CacheItem<T>, error: Error, response: RunnerResponse<T>): void {
    cacheItem.abort = null;
    cacheItem.isFetching = false;
    cacheItem.isFetched = true;
    cacheItem.value = response;
    cacheItem.error = error;
    cacheItem.lastUpdate = Date.now();
}

export default function getItem<T>({ cache, key, cacheTtlMs, options, url }: CacheItemProps): CacheItem<T> {
    if(!cache[key]) {
        const cacheItem: CacheItem<T> = {
            key,
            url,
            cacheTtlMs: cacheTtlMs,
            callbacks: [],
            lastUpdate: null,
            value: null,
            error: null,
            isFetching: false,
            isFetched: false,
            nextRefresh: null,
            options,
            abort: null,
            callback(error: Error, response: RunnerResponse<T>) {
                if (error?.name === 'AbortError') {
                    return;
                }

                saveResult(cacheItem, error, response);
                resolveCallbacks(cacheItem);
            }
        };

        cache[key] = cacheItem;
    }

    return cache[key];
}
