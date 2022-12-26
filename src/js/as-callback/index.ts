import { agents, Agent } from '../agent/agents';
import generateKey from '../generate-key';
import manageGarbage from '../manage-garbage';
import { getItem, resolveCallbacks, run, stopFeed } from '../cache-item';
import { CacheItem, CallbackHandler, FetchOptions, QueryParam } from '..';
import clearUrl from '../clear-url';
import joinQueryParameters from '../join-query-parameters';
import { reRun } from '../cache-item/run';
import getQueryParams from '../get-query-params';

export interface BuildUrlParams {
    agent: Agent,
    path: string,
    queryParams: QueryParam[]
}

export interface AsCallback<T> {
    agentName: string;
    path: string;
    frequencyMs?: number;
    callback: CallbackHandler<T>;
    options?: FetchOptions;
}

interface ProcessStateParams<T> {
    agent: Agent;
    cacheItem: CacheItem<T>;
    frequencyMs: number;
    force: boolean;
}

const cacheableMethods: string[] = [ 'GET', 'POST' ];

function buildUrl({ agent, path, queryParams }: BuildUrlParams): string {
    const url = clearUrl(`${agent.basePath}/${path}`);
    const queryParamsStr = joinQueryParameters(queryParams);

    return queryParams.length ? `${url}?${queryParamsStr}` : url;
}

async function processState<T>({ agent, cacheItem, frequencyMs, force }: ProcessStateParams<T>) {
    if(cacheItem.isFetching) {
        return;
    }

    if (!cacheItem.isFetched || force) {
        return run(agent, cacheItem);
    }

    if (!(await agent.cache.isExpired(cacheItem.key))) {
        if(frequencyMs > 0 && !cacheItem.nextRefresh) {
            reRun(agent, cacheItem);
        }

        return await resolveCallbacks({ key: cacheItem.key, cache: agent.cache });
    }

    if (!cacheItem.nextRefresh) {
        return run(agent, cacheItem);
    }
}

export default async function asCallback<T>({ agentName, path, options = {}, frequencyMs = 0, callback }: AsCallback<T>) {
    const agent = agents[agentName];

    if(!agent) {
        throw new Error(`Agent '${agentName}' doesn't exist`);
    }

    const queryParams = getQueryParams({ agent, path, options });
    const key = generateKey({ agent, path, options, queryParams });
    const method = options.method ?? 'GET';
    const url = buildUrl({ agent, path, queryParams });
    const runnerOptions = {
        ...options,
        method,
        headers: [ ...(options.headers ?? []), ...(agent.headers ?? []) ],
        query: queryParams,
    };

    if(!cacheableMethods.includes(method)) {
        return agent.runner<T>({ url, options: runnerOptions, callback:
                async (err, res) => await callback(err, { response: res, isCacheable: false, expiresInMs: 0 }) });
    }

    manageGarbage(agent);

    const { cacheTtlMs = 0, force = false } = options.cacheOptions ?? {};
    const cacheItem = await getItem<T>({ cache: agent.cache, key, cacheTtlMs, options: runnerOptions, url });
    cacheItem.callbacks.push({ callback, frequencyMs });
    await processState({ agent, cacheItem, frequencyMs, force });

    return (): void => stopFeed(cacheItem, callback);
}
