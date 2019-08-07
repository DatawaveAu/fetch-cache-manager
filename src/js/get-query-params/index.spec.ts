import getQueryParams from '.';

describe('getQueryParams',  () => {
    it('should include the agents query params', () => {
        const result = getQueryParams({ agent: { query: [ { key: 'a',  value: '1' } ] }, options: null, path: '' });
        expect(result).toHaveLength(1);
        expect(result).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'a',  value: '1' }) ]));
    });
    it('should include the options query params', () => {
        const result = getQueryParams({ agent: null, options: { query: [ { key: 'a',  value: '1' } ] }, path: '' });
        expect(result).toHaveLength(1);
        expect(result).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'a',  value: '1' }) ]));
    });
    it('should extract query params from the path', () => {
        const result = getQueryParams({ agent: null, options: null, path: 'a/b/c?x=3&u=true' });
        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining(
                [ expect.objectContaining({ key: 'x',  value: '3' }), expect.objectContaining({ key: 'u',  value: 'true' }) ]));
    });
    it('should remove duplicate keys preferring options over path over agent', () => {
        const resultPath = getQueryParams({ agent: { query: [ { key: 'x',  value: '1' } ] }, options: null, path: '?x=2' });
        expect(resultPath).toHaveLength(1);
        expect(resultPath).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'x',  value: '2' }) ]));

        const resultOptions = getQueryParams(
            { agent: { query: [ { key: 'x',  value: '1' } ] }, options: { query: [ { key: 'x',  value: '3' } ] }, path: '?x=2' }
        );
        expect(resultOptions).toHaveLength(1);
        expect(resultOptions).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'x',  value: '3' }) ]));
    });
    describe('when no data is provided', () => {
        it('should return an empty array', () => {
            expect(getQueryParams({ agent: null, options: null, path: '' })).toHaveLength(0);
        });
    });
});
