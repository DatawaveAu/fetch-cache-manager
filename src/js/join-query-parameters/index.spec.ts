import joinQueryParameters from '.';

describe('joinQueryParameters',  () => {
    it('should return a query parameter formatted string', () => {
        expect(joinQueryParameters([ { key: 'a', value: '1' }, { key: 'b', value: '2' } ])).toBe('a=1&b=2');
    });
    it('should accept empty arrays', () => {
        expect(joinQueryParameters([])).toBe('');
    });
    it('should encode parameters', () => {
        expect(joinQueryParameters([ { key: 'a', value: 'https://datawave.com.au' } ])).toBe('a=https%3A%2F%2Fdatawave.com.au');
        expect(joinQueryParameters([ { key: '/:a:/', value: '1' } ])).toBe('%2F%3Aa%3A%2F=1');
    });
});
