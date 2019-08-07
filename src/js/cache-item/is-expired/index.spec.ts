import isExpired from '.';

describe('expiresIn',  () => {
    beforeEach(() =>  {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should indicate if the cache item is expired',  () => {
        expect(isExpired({ lastUpdate: Date.now(), cacheTtlMs: 3000 })).toBeFalsy();

        const item1 = { lastUpdate: Date.now(), cacheTtlMs: 3000 };
        jest.advanceTimersByTime(2999);
        expect(isExpired(item1)).toBeFalsy();
        jest.advanceTimersByTime(1);
        expect(isExpired(item1)).toBeFalsy();
        jest.advanceTimersByTime(1);
        expect(isExpired(item1)).toBeTruthy();

    });
});
