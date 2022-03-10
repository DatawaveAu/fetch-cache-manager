import removeAllAgents from './index';
import addAgent from '../add-agent';
import { agents } from '../agents';

const runner = () => {
    const controller = new AbortController();

    return () => controller.abort();
};

describe('removeAllAgents', () => {
    beforeEach(() =>  {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        addAgent({ name: 'test', basePath: '/', runner });
        addAgent({ name: 'test1', basePath: '/', runner });
    });
    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
        Object.keys(agents).forEach((key) => delete agents[key]);
    });
    it('should remove all agents', () => {
        expect(agents.test).not.toBeUndefined();
        removeAllAgents();
        expect(Object.keys(agents)).toHaveLength(0);
    });
    it('should clear out the garbage collector timeout', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        agents.test.garbageCollectorTimeout = setTimeout(() => {}, 100);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        agents.test1.garbageCollectorTimeout = setTimeout(() => {}, 100);
        const timeoutId = agents.test.garbageCollectorTimeout;
        const timeoutId1 = agents.test.garbageCollectorTimeout;

        removeAllAgents();

        expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
        expect(clearTimeout).toHaveBeenCalledWith(timeoutId1);
    });
});
