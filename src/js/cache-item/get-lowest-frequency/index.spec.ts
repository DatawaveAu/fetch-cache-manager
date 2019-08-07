import getLowestFrequency  from '.';

describe('getLowestFrequency',  () => {
    it('should the lowest frequency in the array',  () => {
        const testData = [ { frequencyMs: 2000 }, { frequencyMs: 1000 }, { frequencyMs: 5000 } ];
        expect(getLowestFrequency(testData)).toEqual(1000);
    });
    it('should ignore items that have no  frequency',  () => {
        const testData = [ { frequencyMs: 2000 }, {}, { frequencyMs: 1000 }, {}, { frequencyMs: 5000 }, {} ];
        expect(getLowestFrequency(testData)).toEqual(1000);
    });
    it('should return -1 if no frequencies are found',  () => {
        const testData = [ { frequencyMs: 0 }, {}, { frequencyMs: 0 }, {} ];
        expect(getLowestFrequency(testData)).toEqual(-1);
    });
    it('should return -1 if no input data is provided',  () => {
        expect(getLowestFrequency()).toEqual(-1);
    });
});
