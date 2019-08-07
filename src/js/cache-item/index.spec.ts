import {
    expiresIn as expiresInIdx,
    getItem as getItemIdx,
    getLowestFrequency as getLowestFrequencyIdx,
    isExpired as isExpiredIds,
    isGarbage as isGarbageIdx,
    resolveCallbacks as resolveCallbacksIdx,
    run as runIdx,
    stopFeed as stopFeedIdx,
} from '.';
import expiresIn from './expires-in';
import getItem from './get-item';
import getLowestFrequency from './get-lowest-frequency';
import isExpired from './is-expired';
import isGarbage from './is-garbage';
import resolveCallbacks from './resolve-callbacks';
import run from './run';
import stopFeed from './stop-feed';

describe('cacheItem index', () => {
    it('should export 8 methods', () => {
        expect(expiresInIdx).toEqual(expiresIn);
        expect(getItemIdx).toEqual(getItem);
        expect(getLowestFrequencyIdx).toEqual(getLowestFrequency);
        expect(isExpiredIds).toEqual(isExpired);
        expect(isGarbageIdx).toEqual(isGarbage);
        expect(resolveCallbacksIdx).toEqual(resolveCallbacks);
        expect(runIdx).toEqual(run);
        expect(stopFeedIdx).toEqual(stopFeed);
    });
});
