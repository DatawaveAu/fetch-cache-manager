/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbortCall, CacheItem, FetchOptions, Header, QueryParam, RunnerResponse } from '..';

export interface AgentOptions {
    name: string;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    runner<T>(options: AgentFetchParams<T>): AbortCall;
}

export interface AgentCache {
    [key: string]: CacheItem<any>;
}

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

export default function addAgent({ name, basePath, headers, query, runner }: AgentOptions) {
    if(agents[name]) {
        throw new Error(`Agent '${name}' already exists`);
    }

    agents[name] = {
        runner,
        cache: {},
        basePath,
        headers,
        query,
        garbageCollectorTimeout: null,
    };
}
