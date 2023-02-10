import { AgentCache, InMemoryCache } from '../../cache-provider';
import getItem from '.';
import { CacheItem, FetchOptions } from '../..';

describe('getItem',  () => {
    let cache: AgentCache, cacheTtlMs: number, key: string, url: string, options: FetchOptions;
    beforeEach(() =>  {
        jest.useFakeTimers();
        cache = new InMemoryCache();
        cacheTtlMs = 100;
        key = 'key';
        url = 'url/path';
        options = {};
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('when there is no item under the requested key', () => {
        it('should create a new item and add it to the cache', async () => {
            const item = await getItem({ cache, cacheTtlMs, key, options, url });

            expect(item).toEqual(expect.objectContaining({
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
                callback: expect.any(Function),
            }));

            await expect(cache.getItem(key)).resolves.toEqual(item);
        });
    });

    describe('when there is an item under the requested key', () => {
        it('should return that item', async () => {
            const item = await getItem({ cache, cacheTtlMs, key, options, url });
            const item2 = await getItem({ cache, cacheTtlMs, key, options, url });

            expect(item).toEqual(item2);
        });
    });

    describe('when the item callback is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let item: CacheItem<any>;

        beforeEach(async () => {
            item = await getItem({ cache, cacheTtlMs, key, options, url });
        });

        it('should save the response data to the cache', () => {
            item.isFetching = true;
            item.isFetched = false;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            item.abort = () => {};
            const error = new Error('test');

            item.callback(error, { data: 'testData', status: 200 });

            expect(item).toEqual(expect.objectContaining({
                lastUpdate: Date.now(),
                value: { data: 'testData', status: 200 },
                error,
                isFetching: false,
                isFetched: true,
                abort: null,
            }));
        });

        it('should ignore abort errors', () => {
            const error = new Error('test');
            error.name = 'AbortError';

            item.callback(error, null);
            expect(item.lastUpdate).toBeNull();
        });

        it('should resolve all queued callbacks', async () => {
            const mock1 = jest.fn();
            const mock2 = jest.fn();
            const data = { data: 'testData', status: 200 };

            item.callbacks.push({ callback: mock1 }, { callback: mock2 });
            await item.callback(null, data);

            expect(mock1.mock.calls).toHaveLength(1);
            expect(mock1.mock.calls[0][0]).toEqual(null);
            expect(mock1.mock.calls[0][1]).toEqual(expect.objectContaining({
                response: data,
                expiresInMs: cacheTtlMs,
                isCacheable: true,
            }));
            expect(mock2.mock.calls).toHaveLength(1);
            expect(mock2.mock.calls[0][0]).toEqual(null);
            expect(mock2.mock.calls[0][1]).toEqual(expect.objectContaining({
                response: data,
                expiresInMs: cacheTtlMs,
                isCacheable: true,
            }));
        });

        it('should should filter out callbacks with nullish frequencies', async() => {
            const mock = jest.fn();
            const data = { data: 'testData', status: 200 };
            const toKeep = { callback: mock, frequencyMs: 1000 };

            item.callbacks.push(toKeep, { callback: mock }, { callback: mock, frequencyMs: 0 });
            await item.callback(null, data);

            expect(item.callbacks).toHaveLength(1);
            expect(item.callbacks[0]).toEqual(toKeep);
        });
    });
});
