import { AbortCall, FetchOptions, Header, QueryParam, RunnerResponse } from '../index';
import { AgentCache } from './add-agent';

export interface AgentFetchParams<T> {
    url: string;
    options: FetchOptions;
    callback: (error: Error, response: RunnerResponse<T>) => void;
}

export interface Agent {
    cache: AgentCache;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    garbageCollectorTimeout: ReturnType<typeof setTimeout>;
    runner<T>(options: AgentFetchParams<T>): AbortCall;
}

export const agents: {[key: string]: Agent} = {};
