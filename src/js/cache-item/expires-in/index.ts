import { CacheItem } from '../..';

type ExpiresInCacheItem<T> = Pick<CacheItem<T>, 'lastUpdate' | 'cacheTtlMs'>

export default function expiresIn<T>(cacheItem: ExpiresInCacheItem<T>):  number {
    const { lastUpdate, cacheTtlMs } = cacheItem;

    return lastUpdate + cacheTtlMs - Date.now();
}
