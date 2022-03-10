/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbortCall, CacheItem, Header, QueryParam } from '../../index';
import { AgentFetchParams, agents } from '../agents';

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
