import { Agent } from '../../agent/agents';
import { CacheItem } from '../..';
import getLowestFrequency from '../get-lowest-frequency';

export function reRun<T>(agent: Pick<Agent, 'runner'>, cacheItem: CacheItem<T>):void {
    // When there are multiple callbacks with different frequencies the polling system will pick the lowest frequency to run at
    // and bypass cache ttl in order to avoid more complex logic that would be required to manage multiple frequencies.
    const lowestFrequencyMs = getLowestFrequency(cacheItem.callbacks);

    if(lowestFrequencyMs > 0) {
        clearTimeout(cacheItem.nextRefresh);
        cacheItem.nextRefresh = setTimeout(() => run(agent, cacheItem), lowestFrequencyMs);
    }
}

export default function run<T>(agent: Pick<Agent, 'runner'>, cacheItem: CacheItem<T>): void {
    reRun(agent, cacheItem);
    if(cacheItem.isFetching || !cacheItem.callbacks.length) {
        return;
    }

    cacheItem.isFetching = true;
    if(cacheItem.abort) {
        cacheItem.abort();
    }

    cacheItem.abort = agent.runner<T>({ url: cacheItem.url, options: cacheItem.options, callback: cacheItem.callback });
}
