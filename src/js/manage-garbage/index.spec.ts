import manageGarbage, { GarbageAgent, garbageCollectorFrequency } from '.';
import { CacheItem } from '../';

const buildCacheItem = <T>(key: string): CacheItem<T> => ({
    key,
    url: 'some/path',
    cacheTtlMs: 5000,
    callbacks: [],
    lastUpdate: Date.now() + garbageCollectorFrequency,
    value: null,
    error: null,
    isFetching: false,
    isFetched: false,
    nextRefresh: null,
    options: {},
    abort: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    callback: () => {}
});

describe('manageGarbage',  () => {
    let agent: GarbageAgent;

    beforeEach(() =>  {
        agent = {
            cache: {},
            garbageCollectorTimeout: null,
        };
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    describe('when the garbage collector is already running',  () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fakeFn = () => {};
        const fakeTo = 10000;

        beforeEach(() => {
            agent.garbageCollectorTimeout = setTimeout(fakeFn, fakeTo);
        });

        it('should not start a new timeout',  () => {
            manageGarbage(agent);
            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(fakeFn, fakeTo);
        });
    });

    describe('when the garbage collector is not running',  () => {
        it('should start a new timeout',  () => {
            manageGarbage(agent);

            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), garbageCollectorFrequency);
        });
    });

    describe('when the garbage runs',  () => {
        beforeEach(() => {
            manageGarbage(agent);
        });
        it('should queue another run if there are cache items left',  () => {
            agent.cache['test'] = buildCacheItem('test');

            jest.runOnlyPendingTimers();

            expect(setTimeout).toHaveBeenCalledTimes(2);
        });
        it('should not queue another run if there are no cache items left',  () => {
            jest.runOnlyPendingTimers();
            expect(setTimeout).toHaveBeenCalledTimes(1);
        });
        it('should run until all cache items are cleaned',  () => {
            agent.cache['test1'] = buildCacheItem('test1');
            agent.cache['test2'] = buildCacheItem('test2');
            agent.cache['test3'] = buildCacheItem('test3');

            agent.cache['test1'].lastUpdate = Date.now();
            agent.cache['test2'].lastUpdate = Date.now() + garbageCollectorFrequency + 1000;
            agent.cache['test3'].lastUpdate = Date.now() + garbageCollectorFrequency * 2 + 1000;

            jest.runOnlyPendingTimers();
            expect(Object.keys(agent.cache)).toHaveLength(2);
            jest.runOnlyPendingTimers();
            expect(Object.keys(agent.cache)).toHaveLength(1);
            jest.runOnlyPendingTimers();
            expect(Object.keys(agent.cache)).toHaveLength(0);
            expect(setTimeout).toHaveBeenCalledTimes(3);
        });
    });
});
