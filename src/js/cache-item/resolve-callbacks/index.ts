import { CacheItem } from '../..';
import expiresIn from '../expires-in';

export default function resolveCallbacks<T>(cacheItem: CacheItem<T>): void {
    const { value, error } = cacheItem;
    const expiresInMs = expiresIn(cacheItem);
    const toRun = cacheItem.callbacks;

    cacheItem.callbacks = cacheItem.callbacks.slice().filter(({ frequencyMs }) => frequencyMs);

    toRun.forEach(({ callback }) => callback(error, {
        response: value,
        expiresInMs,
        isCacheable: true,
    }));
}
