import expiresIn from '.';

describe('expiresIn',  () => {
    beforeEach(() =>  {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return time left until the cache item expires',  () => {
        expect(expiresIn({ lastUpdate: Date.now(), cacheTtlMs: 3000 })).toEqual(3000);

        const item1 = { lastUpdate: Date.now(), cacheTtlMs: 3000 };
        jest.advanceTimersByTime(2999);
        expect(expiresIn(item1)).toEqual(1);
        jest.advanceTimersByTime(1);
        expect(expiresIn(item1)).toEqual(0);
        jest.advanceTimersByTime(1);
        expect(expiresIn(item1)).toEqual(-1);

    });
});
