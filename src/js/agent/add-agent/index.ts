/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbortCall, CacheItem, Header, QueryParam } from '../../index';
import { AgentFetchParams, agents } from '../agents';

export interface AgentOptions {
    name: string;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    storage?: AgentCacheStorage;
    runner<T>(options: AgentFetchParams<T>): AbortCall;
}

export interface AgentCache {
    [key: string]: CacheItem<any>;
}

export interface AgentCacheStorage {
    getItem: <T>(key: string) => Promise<T>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
}

export default function addAgent({ name, basePath, headers, query, storage, runner }: AgentOptions) {
    if(agents[name]) {
        throw new Error(`Agent '${name}' already exists`);
    }

    agents[name] = {
        runner,
        cache: {},
        storage,
        basePath,
        headers,
        query,
        garbageCollectorTimeout: null,
    };
}
