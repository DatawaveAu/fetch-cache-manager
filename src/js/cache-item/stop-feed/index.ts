import { CacheItem, CallbackHandler } from '../..';

export type StopFeedCacheItem<T> = Pick<CacheItem<T>, 'callbacks' | 'abort' | 'nextRefresh' | 'isFetching'>;

export default function stopFeed<T>(cacheItem: StopFeedCacheItem<T>, callbackFn: CallbackHandler<T>): void {
    cacheItem.callbacks = cacheItem.callbacks.filter(({ callback }) => callbackFn !== callback);

    if(cacheItem.callbacks.length) {
        return;
    }

    if(cacheItem.abort) {
        cacheItem.abort();
    }
    clearTimeout(cacheItem.nextRefresh);
    cacheItem.abort = null;
    cacheItem.isFetching = false;
    cacheItem.nextRefresh = null;
}
