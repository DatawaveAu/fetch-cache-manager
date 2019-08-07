import asPromise from '.';

let mockAsCallback: jest.Mock;
jest.mock('../as-callback', () => {
    mockAsCallback = jest.fn();
    return mockAsCallback;
});

describe('asPromise', () => {
    afterEach(() => {
        mockAsCallback.mockReset();
    });

    it('should use asCallback to create handle the logic', ()  => {
        const params = { agentName: 'test', path: 'test/path', options: {}, frequencyMs: 0 };
        asPromise(params);
        expect(mockAsCallback).toHaveBeenCalledTimes(1);
        expect(mockAsCallback.mock.calls[0][0]).toEqual(expect.objectContaining(params));
    });

    describe('when asCallback resolves with an error', () => {
        it('should throw that error', async  () => {
            mockAsCallback.mockImplementationOnce(({ callback }) => callback('someError'));

            const params = { agentName: 'test', path: 'test/path', options: {}, frequencyMs: 0 };
            await expect(asPromise(params)).rejects.toEqual('someError');
        });
    });

    describe('when asCallback resolves with data', () => {
        it('should resolve with that data', async  () => {
            mockAsCallback.mockImplementationOnce(({ callback }) => callback(null, 'myData'));

            const params = { agentName: 'test', path: 'test/path', options: {}, frequencyMs: 0 };
            await expect(asPromise(params)).resolves.toEqual('myData');
        });
    });
});
