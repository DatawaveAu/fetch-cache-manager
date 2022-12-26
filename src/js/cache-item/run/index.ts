import { Agent } from '../../agent/agents';
import { CacheItem } from '../..';
import getLowestFrequency from '../get-lowest-frequency';

export type CacheResult<T> = {
    status: 'missing' | 'success' | 'failed';
    result: T | undefined;
};

export function reRun<T>(agent: Pick<Agent, 'runner'>, cacheItem: CacheItem<T>):void {
    // When there are multiple callbacks with different frequencies the polling system will pick the lowest frequency to run at
    // and bypass cache ttl in order to avoid more complex logic that would be required to manage multiple frequencies.
    const lowestFrequencyMs = getLowestFrequency(cacheItem.callbacks);

    if(lowestFrequencyMs > 0) {
        clearTimeout(cacheItem.nextRefresh);
        cacheItem.nextRefresh = setTimeout(() => run(agent, cacheItem), lowestFrequencyMs);
    }
}

export async function getCache<T>(key: string, storage?: Agent['storage']): Promise<CacheResult<T>> {
    if (!storage?.getItem) {
        return { status: 'missing', result: undefined };
    }

    try {
        const result = await storage.getItem<T>(key);

        if (result === undefined) {
            return { status: 'missing', result };
        }

        return { status: 'success', result };
    } catch (error) {
        return { status: 'failed', result: error };
    }
}

export default function run<T>(agent: Pick<Agent, 'runner' | 'storage'>, cacheItem: CacheItem<T>): void {
    reRun(agent, cacheItem);

    if(cacheItem.isFetching || !cacheItem.callbacks.length) {
        return;
    }

    cacheItem.isFetching = true;

    if(cacheItem.abort) {
        cacheItem.abort();
    }

    cacheItem.abort = agent.runner<T>({
        url: cacheItem.url,
        options: cacheItem.options,
        callback: cacheItem.callback,
        getCache: () => getCache<T>(cacheItem.key, agent.storage),
    });
}
