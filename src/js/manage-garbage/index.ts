import { Agent } from '../agent/agents';
import { isGarbage } from '../cache-item';

export const garbageCollectorFrequency = 9000;
export type GarbageAgent = Pick<Agent, 'cache' | 'garbageCollectorTimeout'>;

async function runGarbageCollector(agent: GarbageAgent) {
    const { cache } = agent;

    const cacheValues = await cache.getAllValues();

    await Promise.all(cacheValues.map(async ({ key }) => (await isGarbage({ key, cache })) && cache.deleteItem(key)));

    const cacheKeys = await cache.getAllKeys();

    agent.garbageCollectorTimeout = cacheKeys.length
        ? setTimeout(() => runGarbageCollector(agent), garbageCollectorFrequency)
        : null;
}

export default function manageGarbage(agent: GarbageAgent): void {
    if(agent.garbageCollectorTimeout) {
        return;
    }

    agent.garbageCollectorTimeout = setTimeout(() => runGarbageCollector(agent), garbageCollectorFrequency);
}
