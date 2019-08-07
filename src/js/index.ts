import { GenerateKeyOptionsI } from './generate-key';
import addAgent from './add-agent';
import asCallback from './as-callback';
import asPromise from './as-promise';

export type CallbackHandler<T> = (err: Error, res?: CallbackResponse<T>) => void;
export type AbortCall = () => void;

export interface RunnerResponse<T> {
    data: T;
    status: number;
}

export interface CallbackResponse<T> {
    response: RunnerResponse<T>;
    expiresInMs: number;
    isCacheable: boolean;
}

export interface QueryParam {
    key: string,
    value: string,
}

export interface Header {
    key: string,
    value: string,
}

export interface FetchOptions {
    method?: string;
    body?: string;
    cacheOptions?: CacheConfig;
    query?: QueryParam[];
    headers?: Header[];
}

export interface CacheConfig {
    cacheTtlMs?: number;
    keyOptions?: GenerateKeyOptionsI;
}

export interface CacheItem<T> {
    key: string;
    url: string;
    lastUpdate: number;
    cacheTtlMs: number;
    callbacks: CallbackRecord<T>[];
    value: RunnerResponse<T>;
    error: Error;
    isFetched: boolean;
    isFetching: boolean;
    nextRefresh: ReturnType<typeof setTimeout>;
    options: FetchOptions;
    abort: AbortCall;
    callback: (error: Error, response: RunnerResponse<T>) => void;
}

export interface CallbackRecord<T> {
    callback: CallbackHandler<T>;
    frequencyMs?: number;
}

export default {
    addAgent,
    asPromise,
    asCallback,
};
