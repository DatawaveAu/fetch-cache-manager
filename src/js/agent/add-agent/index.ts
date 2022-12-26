/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbortCall, Header, QueryParam } from '../../index';
import { AgentFetchParams, agents } from '../agents';
import { AgentCache, InMemoryCache } from '../../cache-provider';

export interface AgentOptions {
    name: string;
    basePath: string;
    headers?: Header[];
    query?: QueryParam[];
    runner<T>(options: AgentFetchParams<T>): AbortCall;
    cache?: AgentCache;
}

export default function addAgent({ name, basePath, headers, query, runner, cache }: AgentOptions) {
    if(agents[name]) {
        throw new Error(`Agent '${name}' already exists`);
    }

    agents[name] = {
        runner,
        cache: cache || new InMemoryCache(),
        basePath,
        headers,
        query,
        garbageCollectorTimeout: null,
    };
}
