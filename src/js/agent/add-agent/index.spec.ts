import addAgent  from './index';
import omit from 'lodash/omit';
import { agents } from '../agents';

describe('addAgent', () => {
    afterEach(() => {
        Object.keys(agents).forEach((key) => delete agents[key]);
    });
    it('should create a new agent', () => {
        const runner = jest.fn();
        const params = {
            name: 'x',
            basePath: 'https://datawave.com.au',
            headers: [ { key: 'h1', value: 'hv1' } ],
            query: [ { key: 'q1', value: 'qv1' } ],
            runner,
        };
        addAgent(params);
        expect(agents.x).not.toBeNull();
        expect(agents.x).toEqual(expect.objectContaining({ ...omit(params, [ 'name' ]) }));
    });

    describe('when an agent by that name already exists', () => {
        it('should throw an error', () => {
            const runner = jest.fn();
            const params = {
                name: 'x',
                basePath: 'https://datawave.com.au',
                headers: [ { key: 'h1', value: 'hv1' } ],
                query: [ { key: 'q1', value: 'qv1' } ],
                runner,
            };
            addAgent(params);
            expect(() => addAgent(params)).toThrowError("Agent 'x' already exists");
        });
    });
});
