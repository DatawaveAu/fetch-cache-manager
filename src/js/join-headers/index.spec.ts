import joinHeaders from '.';

describe('joinHeaders',  () => {
    it('should include the agents headers', () => {
        const result = joinHeaders({ agent: { headers: [ { key: 'a',  value: '1' } ] }, options: null });
        expect(result).toHaveLength(1);
        expect(result).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'a',  value: '1' }) ]));
    });
    it('should include the options query params', () => {
        const result = joinHeaders({ agent: null, options: { headers: [ { key: 'a',  value: '1' } ] } });
        expect(result).toHaveLength(1);
        expect(result).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'a',  value: '1' }) ]));
    });
    it('should remove duplicate keys preferring options over path over agent', () => {
        const resultPath = joinHeaders(
            { agent: { headers: [ { key: 'x',  value: '1' } ] }, options: { headers: [ { key: 'x',  value: '2' } ] } });
        expect(resultPath).toHaveLength(1);
        expect(resultPath).toEqual(expect.arrayContaining([ expect.objectContaining({ key: 'x',  value: '2' }) ]));
    });
    describe('when no data is provided', () => {
        it('should return an empty array', () => {
            expect(joinHeaders({ agent: null, options: null })).toHaveLength(0);
        });
    });
});
