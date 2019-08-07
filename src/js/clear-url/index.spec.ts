import clearUrl from '.';

describe('clearUrl',  () => {
    it('it should remove query parameters from a URL', () => {
        expect(clearUrl('https://datawave.com.au?no-query=1')).toBe('https://datawave.com.au');
        expect(clearUrl('https://datawave.com.au?no-query=1?bad=2')).toBe('https://datawave.com.au');
        expect(clearUrl('https://datawave.com.au')).toBe('https://datawave.com.au');
    });
});
