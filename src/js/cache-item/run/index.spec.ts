import { Agent } from 'src/js/add-agent';
import run from '.';
import { AbortCall, CacheItem, CallbackHandler, FetchOptions } from '../..';

describe('run',  () => {
    let agent: Pick<Agent, 'runner'>;
    let cacheItem: CacheItem<string>;
    let options: FetchOptions;
    let key: string;
    let url: string;
    let cacheTtlMs: number;
    let abortFn: AbortCall;
    let runnerSpy: jest.SpyInstance;
    let callback: CallbackHandler<string>;

    beforeEach(() =>  {
        key = 'key';
        url = 'https://datawave.com.au/some/path';
        cacheTtlMs = 1000;
        options = {};
        abortFn = jest.fn();
        callback = jest.fn();
        agent = {
            runner: () => abortFn,
        };
        runnerSpy = jest.spyOn(agent, 'runner');
        cacheItem = {
            key,
            url,
            cacheTtlMs,
            callbacks: [ { callback } ],
            lastUpdate: null,
            value: null,
            error: null,
            isFetching: false,
            isFetched: false,
            nextRefresh: null,
            options,
            abort: null,
            callback: jest.fn(),
        };
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    it('should invoke the runner', () => {
        run(agent, cacheItem);
        expect(runnerSpy).toHaveBeenCalledTimes(1);
        expect(runnerSpy.mock.calls[0][0]).toEqual(expect.objectContaining({ url, options, callback: cacheItem.callback }));
    });
    it('should store the new abort request', () => {
        run(agent, cacheItem);
        expect(cacheItem.abort).toEqual(abortFn);
    });
    it('should set the request as fetching', () => {
        run(agent, cacheItem);
        expect(cacheItem.isFetching).toBeTruthy();
    });
    describe('when already running', () => {
        it('should not invoke the runner again', () => {
            cacheItem.isFetching = true;
            run(agent, cacheItem);
            expect(runnerSpy).toHaveBeenCalledTimes(0);
        });
    });
    describe('when an active request can be aborted', () => {
        it('should abort the existing request', () => {
            const existingAbort = jest.fn();
            cacheItem.abort = existingAbort;
            run(agent, cacheItem);
            expect(existingAbort).toHaveBeenCalledTimes(1);
        });
    });
    describe('when there are no callback items', () => {
        it('should not run the api call', () => {
            cacheItem.callbacks = [];
            run(agent, cacheItem);
            expect(runnerSpy).toHaveBeenCalledTimes(0);
        });
    });
    describe('when there are no polling calls', () => {
        it('should not start a new timer', () => {
            run(agent, cacheItem);
            expect(setTimeout).toHaveBeenCalledTimes(0);
            cacheItem.callbacks.push({ callback: jest.fn(), frequencyMs: 0 });
            run(agent, cacheItem);
            expect(setTimeout).toHaveBeenCalledTimes(0);
        });
    });
    describe('when there is at least 1 polling call', () => {
        let pollCallback: CallbackHandler<string>;
        beforeEach(() => {
            pollCallback = jest.fn();
            cacheItem.callbacks.push({ callback: pollCallback, frequencyMs: 500 });
        });

        it('should start the timer for the next call even if the active request is fetching', () => {
            cacheItem.isFetching = true;
            run(agent, cacheItem);
            expect(setTimeout).toHaveBeenCalledTimes(1);
        });

        it('should clear the previous timeout', () => {
            const timeout = setTimeout(jest.fn(), 100);
            cacheItem.nextRefresh = timeout;
            run(agent, cacheItem);
            expect(clearTimeout).toHaveBeenCalledTimes(1);
            expect(clearTimeout).toHaveBeenCalledWith(timeout);
        });

        it('should save the next timeout', () => {
            run(agent, cacheItem);
            expect(cacheItem.nextRefresh).not.toBeNull();
        });

        describe('when the timout completes', () => {
            it('should call the run fn again', () => {
                run(agent, cacheItem);
                cacheItem.isFetching = false;
                jest.runOnlyPendingTimers();
                expect(runnerSpy).toHaveBeenCalledTimes(2);
            });
        });
    });
});
