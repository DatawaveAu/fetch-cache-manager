import { AbortCall, FetchOptions, Header, QueryParam, RunnerResponse } from '../index';
import { AgentCache, AgentCacheStorage } from './add-agent';
import { CacheResult } from '../cache-item/run';

export interface AgentFetchParams<T> {
    key?: string;
    url: string;
    getCache?: () => Promise<CacheResult<T>>;
    options: FetchOptions;
    callback: (error: Error, response: RunnerResponse<T>) => void;
}

export interface Agent {
    cache: AgentCache;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    garbageCollectorTimeout: ReturnType<typeof setTimeout>;
    storage?: AgentCacheStorage;
    runner<T>(options: AgentFetchParams<T>): AbortCall;
}

export const agents: Record<string, Agent> = {};
