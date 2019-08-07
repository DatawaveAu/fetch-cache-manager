import isGarbage from '.';

describe('isGarbage',  () => {
    beforeEach(() =>  {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return false is the cache is not expired', () => {
        expect(isGarbage({ lastUpdate: Date.now(), cacheTtlMs: 3000, isFetching: false, callbacks: [] })).toBeFalsy();
    });

    it('should return false when the request is still fetching', () => {
        expect(isGarbage({ lastUpdate: Date.now() - 4000, cacheTtlMs: 3000, isFetching: true, callbacks: [] })).toBeFalsy();
    });

    it('should return false when there are still callbacks left in queue', () => {
        expect(isGarbage({
            lastUpdate: Date.now() - 4000,
            cacheTtlMs: 3000,
            isFetching: false,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callbacks: [ { callback: () => {}, frequencyMs: 0 } ] })
        ).toBeFalsy();
    });

    it('should return true only when cache is expired and request is not fetching and there are no callbacks left in queue', () => {
        expect(isGarbage({
            lastUpdate: Date.now() - 4000,
            cacheTtlMs: 3000,
            isFetching: true,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callbacks: [ { callback: () => {}, frequencyMs: 0 } ] })
        ).toBeFalsy();
    });
});
