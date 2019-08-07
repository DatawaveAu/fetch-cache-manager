import stopFeed, { StopFeedCacheItem } from '.';
import { CallbackHandler } from '../..';

describe('stopFeed',  () => {
    let callback: CallbackHandler<string>;
    let item: StopFeedCacheItem<string>;

    beforeEach(() =>  {
        jest.useFakeTimers();
        callback = jest.fn();
        item = { callbacks: [], isFetching: false, nextRefresh: null, abort: null };
        jest.spyOn(global, 'clearTimeout');
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    it('should remove the callback from the queue', () => {
        const remaining1 = { callback: jest.fn() };
        const remaining2 = { callback: jest.fn() };
        item.callbacks.push(remaining1, { callback }, remaining2);

        stopFeed(item, callback);

        expect(item.callbacks).toHaveLength(2);
        expect(item.callbacks).toEqual(
            expect.arrayContaining([ remaining1, remaining2 ]),
        );
    });

    describe('when the callback is the only one in queue', () => {
        beforeEach(() =>  {
            item.callbacks.push({ callback });
        });

        it('should call the abort fn if exists', () => {
            const abort = jest.fn();
            item.abort = abort;
            stopFeed(item, callback);
            expect(abort).toHaveBeenCalledTimes(1);
        });

        it('should stop the next timeout if it exists', () => {
            const timeout = setTimeout(jest.fn(), 1000);
            item.nextRefresh = timeout;
            stopFeed(item, callback);
            expect(clearTimeout).toHaveBeenCalledTimes(1);
            expect(clearTimeout).toHaveBeenCalledWith(timeout);
        });

        it('should perform cache cleanup', () => {
            item.nextRefresh = setTimeout(jest.fn(), 1000);
            item.abort = jest.fn();
            item.isFetching = true;
            stopFeed(item, callback);
            expect(item.nextRefresh).toBeNull();
            expect(item.abort).toBeNull();
            expect(item.isFetching).toBeFalsy();
        });
    });

    describe('when the callback is not the only one in queue', () => {
        beforeEach(() =>  {
            item.callbacks.push({ callback }, { callback: jest.fn() });
        });

        it('should not call the abort fn if exists', () => {
            const abort = jest.fn();
            item.abort = abort;
            stopFeed(item, callback);
            expect(abort).toHaveBeenCalledTimes(0);
        });

        it('should not stop the next timeout if it exists', () => {
            item.nextRefresh = setTimeout(jest.fn(), 1000);
            stopFeed(item, callback);
            expect(clearTimeout).toHaveBeenCalledTimes(0);
        });

        it('should not perform cache cleanup', () => {
            const timeout = setTimeout(jest.fn(), 1000);
            const abort = jest.fn();

            item.nextRefresh = timeout;
            item.abort = abort;
            item.isFetching = true;
            stopFeed(item, callback);
            expect(item.nextRefresh).toEqual(timeout);
            expect(item.abort).toEqual(abort);
            expect(item.isFetching).toBeTruthy();
        });
    });
});
