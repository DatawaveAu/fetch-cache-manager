import methods from '.';
import addAgent from './add-agent';
import asCallback from './as-callback';
import asPromise from './as-promise';

describe('root module', () => {
    it('should export 3 public methods', () => {
        expect(methods.addAgent).toEqual(addAgent);
        expect(methods.asPromise).toEqual(asPromise);
        expect(methods.asCallback).toEqual(asCallback);
    });
});
