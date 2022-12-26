import { Agent } from '../agent/agents';
import { isGarbage } from '../cache-item';

export const garbageCollectorFrequency = 9000;
export type GarbageAgent = Pick<Agent, 'cache' | 'garbageCollectorTimeout' | 'storage'>;

function runGarbageCollector(agent: GarbageAgent): void {
    const { cache, storage } = agent;

    Object.values(cache)
        .filter(isGarbage)
        .forEach(({ key }) => {
            delete cache[key];
            storage?.removeItem(key);
        });

    agent.garbageCollectorTimeout = Object.keys(cache).length
        ? setTimeout(() => runGarbageCollector(agent), garbageCollectorFrequency)
        : null;
}

export default function manageGarbage(agent: GarbageAgent): void {
    if(agent.garbageCollectorTimeout) {
        return;
    }

    agent.garbageCollectorTimeout = setTimeout(() => runGarbageCollector(agent), garbageCollectorFrequency);
}
