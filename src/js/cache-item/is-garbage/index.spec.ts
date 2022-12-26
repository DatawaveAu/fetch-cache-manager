/* eslint-disable @typescript-eslint/no-explicit-any */
import isGarbage from '.';
import { AgentCache, InMemoryCache } from '../../cache-provider';

describe('isGarbage',  () => {
    let cache: AgentCache;

    beforeEach(() =>  {
        jest.useFakeTimers();
        cache = new InMemoryCache();
    });

    afterEach(() => {
        jest.useRealTimers();
        cache = null;
    });

    it('should return false is the cache is not expired', async () => {
        const cacheItem: any = { key: 'test1', lastUpdate: Date.now(), cacheTtlMs: 3000, isFetching: false, callbacks: [] };
        await cache.setItem(cacheItem.key, cacheItem);
        await expect(isGarbage({ key: cacheItem.key, cache })).resolves.toBeFalsy();
    });
    
    it('should return false when the request is still fetching', async () => {
        const cacheItem: any = { key: 'test1', lastUpdate: Date.now() - 4000, cacheTtlMs: 3000, isFetching: true, callbacks: [] };
        await cache.setItem(cacheItem.key, cacheItem);
        await expect(isGarbage({ key: cacheItem.key, cache })).resolves.toBeFalsy();
    });
    
    it('should return false when there are still callbacks left in queue', async () => {
        const cacheItem: any = {
            key: 'test1',
            lastUpdate: Date.now() - 4000,
            cacheTtlMs: 3000,
            isFetching: false,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callbacks: [ { callback: () => {}, frequencyMs: 0 } ]
        };
        await cache.setItem(cacheItem.key, cacheItem);
        await expect(isGarbage({ key: cacheItem.key, cache })).resolves.toBeFalsy();
    });

    it('should return true only when cache is expired and request is not fetching and there are no callbacks left in queue', async () => {
        const cacheItem: any = {
            key: 'test1',
            lastUpdate: Date.now() - 4000,
            cacheTtlMs: 3000,
            isFetching: true,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callbacks: [ { callback: () => {}, frequencyMs: 0 } ],
        };
        await cache.setItem(cacheItem.key, cacheItem);
        await expect(isGarbage({ key: cacheItem.key, cache })).resolves.toBeFalsy();
    });
});
