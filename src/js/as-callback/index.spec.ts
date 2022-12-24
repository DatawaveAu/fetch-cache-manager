import addAgent from '../agent/add-agent';
import { AgentFetchParams, agents } from '../agent/agents';
import asCallback from '.';
import { CallbackHandler, Header, QueryParam } from '..';
import { StopFeedCacheItem } from '../cache-item/stop-feed';

let mockManageGarbage: jest.Mock;
let mockStopFeed: jest.Mock;
let stopFeed: <T>(cacheItem: StopFeedCacheItem<T>, callbackFn: CallbackHandler<T>) => void;
jest.mock('../manage-garbage', () => {
    mockManageGarbage = jest.fn();
    return mockManageGarbage;
});
jest.mock('../cache-item/stop-feed', () => {
    stopFeed = jest.requireActual('../cache-item/stop-feed').default;
    mockStopFeed = jest.fn();
    return mockStopFeed;
});

describe('asCallback', () => {
    const agentName = 'test';
    const basePath = 'https://datawave.com.au';
    let callback: jest.Mock;
    let runner: jest.Mock;
    let abort: jest.Mock;
    let agentHeaders: Header[];
    let agentQuery: QueryParam[];

    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        abort = jest.fn();
        runner = jest.fn(() => abort);
        callback = jest.fn();
        agentHeaders = [ { key: 'header-2', value: 'header-value-2' }, { key: 'header-1', value: 'header-value-1' } ];
        agentQuery = [ { key: 'query-2', value: 'query-value-2' }, { key: 'query-1', value: 'query-value-1' } ];
        addAgent({ name: agentName, basePath, runner, query: agentQuery, headers: agentHeaders });
    });
    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
        mockManageGarbage.mockReset();
        delete agents[agentName];
    });
    it('should throw if the agent doesn\'t exist', () => {
        expect(() => asCallback({ agentName: 'bad-name', path: 'my/path', callback })).toThrowError('Agent \'bad-name\' doesn\'t exist');
    });
    it('should infer GET as the default request method', () => {
        asCallback({ agentName, path: 'my/path', callback });
        expect(runner).toHaveBeenCalledTimes(1);
        expect(runner).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ method: 'GET' }) }));
    });
    it('should correctly build the URL and headers', () => {
        const headers = [ { key: 'header-4', value: 'header-value-4' }, { key: 'header-3', value: 'header-value-3' } ];
        const query = [ { key: 'query-4', value: 'query-value-4' }, { key: 'query-3', value: 'query-value-3' } ];
        const expectedUrl = `${basePath}/my/path?`
            + 'query-4=query-value-4&query-3=query-value-3&query-5=query-value-5&query-2=query-value-2&query-1=query-value-1';
        asCallback({ agentName, path: 'my/path?query-5=query-value-5', callback, options: { headers, query } });
        expect(runner).toHaveBeenCalledTimes(1);
        expect(runner).toHaveBeenCalledWith(expect.objectContaining({
            url: expectedUrl,
            options: expect.objectContaining({
                headers: [ ...headers, ...agentHeaders ],
                query: [ ...query, { key: 'query-5', value: 'query-value-5' }, ...agentQuery ],
            }),
        }));
    });
    it('should work without query parameters', () => {
        addAgent({ name: 'test-2', basePath, runner });
        asCallback({ agentName: 'test-2', path: 'my/path', callback });
        const expectedUrl = `${basePath}/my/path`;
        expect(runner).toHaveBeenCalledTimes(1);
        expect(runner).toHaveBeenCalledWith(expect.objectContaining({
            url: expectedUrl,
            options: expect.objectContaining({
                headers: [],
                query: [],
            }),
        }));
    });

    describe('when using not supported methods', () => {
        it('should not try to cache the response', () => {
            asCallback({ agentName, path: 'my/path', callback, options: { method: 'PUT' } });
            asCallback({ agentName, path: 'my/path', callback, options: { method: 'PUT' } });
            expect(runner).toHaveBeenCalledTimes(2);
        });
        it('should mark the response as not cacheable', () => {
            const response = { data: 'test',status: 200 };
            runner.mockImplementationOnce(({ callback }: AgentFetchParams<string>) => callback(null, response));
            asCallback({ agentName, path: 'my/path', callback, options: { method: 'PUT' } });
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ response: expect.objectContaining({ ...response }), isCacheable: false, expiresInMs: 0 }));
        });
    });

    describe('when using supported methods', () => {
        it('should start the garbage collector', () => {
            asCallback({ agentName, path: 'my/path', callback });
            expect(mockManageGarbage).toHaveBeenCalledTimes(1);
            expect(mockManageGarbage).toHaveBeenCalledWith(agents[agentName]);
        });
        it('should return a function that allows to unsubscribe from the feed', () => {
            const unsubscribe = asCallback({ agentName, path: 'my/path', callback });
            unsubscribe();
            const cacheItem = Object.values(agents[agentName].cache)[0];

            expect(mockStopFeed).toHaveBeenCalledTimes(1);
            expect(mockStopFeed).toHaveBeenCalledWith(cacheItem, callback);
        });
        it('should return a function that aborts the request if request is active and has no subscribers left', () => {
            mockStopFeed.mockImplementationOnce((cacheItem, callbackFn) => stopFeed(cacheItem, callbackFn));
            const unsubscribe = asCallback({ agentName, path: 'my/path', callback });
            unsubscribe();
            expect(abort).toHaveBeenCalledTimes(1);
        });
        it('should collapse if already fetching', () => {
            const callback2 = jest.fn();
            const response = { data: 'test',status: 200 };
            runner.mockImplementationOnce(({ callback }: AgentFetchParams<string>) => setTimeout(() => callback(null, response), 100));
            asCallback({ agentName, path: 'my/path', callback });
            expect(runner).toHaveBeenCalledTimes(1);
            asCallback({ agentName, path: 'my/path', callback: callback2 });
            expect(runner).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledTimes(0);
            expect(callback2).toHaveBeenCalledTimes(0);

            jest.runOnlyPendingTimers();
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ response: expect.objectContaining({ ...response }), isCacheable: true, expiresInMs: 0 }));
            expect(callback2).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ response: expect.objectContaining({ ...response }), isCacheable: true, expiresInMs: 0 }));
        });
        it('should not collapse if already fetching with force option', () => {
            const callback2 = jest.fn();
            const response = { data: 'test',status: 200 };
            runner
                .mockImplementationOnce(({ callback }: AgentFetchParams<string>) => {
                    const timeoutId = setTimeout(() => callback(null, response), 100);
                    return () => clearTimeout(timeoutId);
                })
                .mockImplementationOnce(({ callback }: AgentFetchParams<string>) => setTimeout(() => callback(null, response), 100));
            asCallback({ agentName, path: 'my/path', callback, options: { cacheOptions: { force: true } } });
            expect(runner).toHaveBeenCalledTimes(1);
            asCallback({ agentName, path: 'my/path', callback: callback2, options: { cacheOptions: { force: true } } });
            expect(runner).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledTimes(0);
            expect(callback2).toHaveBeenCalledTimes(0);

            jest.runOnlyPendingTimers();
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ response: expect.objectContaining({ ...response }), isCacheable: true, expiresInMs: 0 }));
            expect(callback2).toHaveBeenCalledWith(
                null,
                expect.objectContaining({ response: expect.objectContaining({ ...response }), isCacheable: true, expiresInMs: 0 }));
        });

        describe('when cache item is not fetching, but it is fetched', () => {
            beforeEach(() => {
                const response = { data: 'test',status: 200 };
                runner.mockImplementationOnce(({ callback }: AgentFetchParams<string>) => callback(null, response));
                asCallback({ agentName, path: 'my/path', callback, options: { cacheOptions: { cacheTtlMs: 5000 } } });
                runner.mockReset();
            });
            it('should resolve with the cached value if cache is valid', () => {
                const callback2 = jest.fn();
                asCallback({ agentName, path: 'my/path', callback: callback2 });
                expect(runner).toHaveBeenCalledTimes(0);
                expect(callback2).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(0);
            });
            it('should start the runner if not already running and polling is requested', () => {
                const callback2 = jest.fn();
                asCallback({ agentName, path: 'my/path', callback: callback2, frequencyMs: 100 });
                expect(runner).toHaveBeenCalledTimes(0);
                expect(callback2).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenCalledWith(expect.anything(), 100);
            });

            describe('when cache is expired', () => {
                it('should call the runner', () => {
                    jest.advanceTimersByTime(5001);
                    const callback2 = jest.fn();
                    asCallback({ agentName, path: 'my/path', callback: callback2 });
                    expect(runner).toHaveBeenCalledTimes(1);
                });
                it('should not call the runner if the cache is already polling', () => {
                    const callback2 = jest.fn();
                    asCallback({ agentName, path: 'my/path', callback: callback2, frequencyMs: 10000 });
                    runner.mockReset();
                    jest.advanceTimersByTime(5001);
                    asCallback({ agentName, path: 'my/path', callback: jest.fn() });
                    expect(runner).toHaveBeenCalledTimes(0);
                });
            });

            describe('when force mode is enabled', () => {
                it('should call the runner', () => {
                    const callback2 = jest.fn();
                    const callback3 = jest.fn();
                    asCallback({ agentName, path: 'my/path', callback: callback2, options: { cacheOptions: { force: true } } });
                    expect(runner).toHaveBeenCalledTimes(1);
                    asCallback({ agentName, path: 'my/path', callback: callback3, options: { cacheOptions: { force: true } } });
                    expect(runner).toHaveBeenCalledTimes(2);
                });
            });
        });
        describe('when polling', () => {
            it('should make a new request at the requested frequency', () => {
                const response = { data: 'test', status: 200 };
                runner.mockImplementation(({ callback }: AgentFetchParams<string>) => callback(null, response));
                asCallback({ agentName, path: 'my/path', callback, frequencyMs: 200 });
                expect(runner).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(199);
                expect(runner).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(2);
                expect(callback).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(199);
                expect(runner).toHaveBeenCalledTimes(2);
                expect(callback).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(3);
                expect(callback).toHaveBeenCalledTimes(3);
            });
            it('should use the lowest frequency when multiple frequencies are requested', () => {
                const callback2 = jest.fn();
                const callback3 = jest.fn();
                const response = { data: 'test', status: 200 };
                runner.mockImplementation(({ callback }: AgentFetchParams<string>) => setTimeout(() => callback(null, response), 1));
                asCallback({ agentName, path: 'my/path', callback, frequencyMs: 200 });
                asCallback({ agentName, path: 'my/path', callback: callback2, frequencyMs: 100 });
                asCallback({ agentName, path: 'my/path', callback: callback3, frequencyMs: 400 });
                expect(runner).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledTimes(0);
                expect(callback2).toHaveBeenCalledTimes(0);
                expect(callback3).toHaveBeenCalledTimes(0);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledTimes(1);
                expect(callback2).toHaveBeenCalledTimes(1);
                expect(callback3).toHaveBeenCalledTimes(1);
                // 1st call timeout determined by the 1st registered call
                jest.advanceTimersByTime(198);
                expect(runner).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledTimes(1);
                expect(callback2).toHaveBeenCalledTimes(1);
                expect(callback3).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(2);
                expect(callback).toHaveBeenCalledTimes(1);
                expect(callback2).toHaveBeenCalledTimes(1);
                expect(callback3).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(2);
                expect(callback).toHaveBeenCalledTimes(2);
                expect(callback2).toHaveBeenCalledTimes(2);
                expect(callback3).toHaveBeenCalledTimes(2);
                // subsequent call timeout determined by the lowest frequency
                jest.advanceTimersByTime(98);
                expect(runner).toHaveBeenCalledTimes(2);
                expect(callback).toHaveBeenCalledTimes(2);
                expect(callback2).toHaveBeenCalledTimes(2);
                expect(callback3).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(3);
                expect(callback).toHaveBeenCalledTimes(2);
                expect(callback2).toHaveBeenCalledTimes(2);
                expect(callback3).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(3);
                expect(callback).toHaveBeenCalledTimes(3);
                expect(callback2).toHaveBeenCalledTimes(3);
                expect(callback3).toHaveBeenCalledTimes(3);
            });
            it('should always make a request even when the cache is still valid, after the initial request', () => {
                const callback2 = jest.fn();
                const response = { data: 'test', status: 200 };
                runner.mockImplementation(({ callback }: AgentFetchParams<string>) => setTimeout(() => callback(null, response), 1));
                asCallback({ agentName, path: 'my/path', callback, options: { cacheOptions: { cacheTtlMs: 10000 } } });
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1);
                asCallback({ agentName, path: 'my/path', callback: callback2, frequencyMs: 100 });
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(98);
                expect(runner).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1);
                expect(runner).toHaveBeenCalledTimes(2);
            });
        });
    });
});
