import removeAgent from './index';
import addAgent from '../add-agent';
import { agents } from '../agents';

const runner = () => {
    const controller = new AbortController();

    return () => controller.abort();
};

describe('removeAgent', () => {
    beforeEach(() =>  {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        jest.spyOn(global, 'clearTimeout');
        addAgent({ name: 'test', basePath: '/', runner });
    });
    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
        Object.keys(agents).forEach((key) => delete agents[key]);
    });
    it('should remove the specified agent', () => {
        expect(agents.test).not.toBeUndefined();
        removeAgent('test');
        expect(agents.test).toBeUndefined();
    });
    it('should clear out the garbage collector timeout', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        agents.test.garbageCollectorTimeout = setTimeout(() => {}, 100);
        const timeoutId = agents.test.garbageCollectorTimeout;
        removeAgent('test');

        expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
    });
});
