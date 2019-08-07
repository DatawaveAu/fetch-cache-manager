import { CacheItem } from '../..';
import isExpired from '../is-expired';

export default function isGarbage<T>(cacheItem: Pick<CacheItem<T>, 'callbacks' | 'isFetching' | 'cacheTtlMs' | 'lastUpdate'>): boolean {
    return isExpired(cacheItem) && !cacheItem.isFetching && !cacheItem.callbacks.length;
}
