import { AbortCall, FetchOptions, Header, QueryParam, RunnerResponse } from '../index';
import { AgentCache } from '../cache-provider';

export interface AgentFetchParams<T> {
    url: string;
    options: FetchOptions;
    callback: (error: Error, response: RunnerResponse<T>) => Promise<void>;
}

export interface Agent {
    cache: AgentCache;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    garbageCollectorTimeout: ReturnType<typeof setTimeout>;
    runner<T>(options: AgentFetchParams<T>): AbortCall;
}

export const agents: Record<string, Agent> = {};
