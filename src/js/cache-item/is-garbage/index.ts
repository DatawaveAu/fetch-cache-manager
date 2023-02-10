import { AgentCache } from '../../cache-provider';

interface IsGarbageParams {
    key: string;
    cache: AgentCache;
}

export default async function isGarbage({ key, cache }: IsGarbageParams) {
    const isExpired = await cache.isExpired(key);
    const { isFetching, callbacks } = await cache.getItem(key);

    return isExpired && !isFetching && !callbacks.length;
}
