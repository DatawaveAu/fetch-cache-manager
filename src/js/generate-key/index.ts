import { FetchOptions, Header, QueryParam } from '../';
import { Agent } from '../agent/agents';
import clearUrl from '../clear-url';
import joinQueryParameters from '../join-query-parameters';
import joinHeaders from '../join-headers';

export interface GenerateKeyParams {
    agent: Pick<Agent, 'query' | 'headers'>;
    path: string;
    options: FetchOptions;
    queryParams: QueryParam[];
}

interface Key {
    method: string;
    url: string;
    queryParameters: string;
    body: string;
    headers: string;
}

export interface GenerateKeyOptionsI {
    excludeHeaders?: string[];
    excludeQueryParams?: string[];
    sortHeaders?: boolean;
    sortKeys?: boolean;
}

function alphabeticalSort({ key: key1 }: {key: string}, { key: key2 }: {key: string}): number {
    return key1.localeCompare(key2, 'en', { numeric: true, sensitivity: 'base' });
}

function keyValueToString(data: QueryParam[] | Header[], toExclude: string[], sortKeys: boolean): string {
    if (data.length === 0) {
        return '';
    }
    if (toExclude.length) {
        data = data.filter(({ key }: QueryParam | Header): boolean => !toExclude.includes(key));
    }

    if (sortKeys) {
        data = data.slice().sort(alphabeticalSort);
    }

    return joinQueryParameters(data);
}

export default function generateKey({ agent, path, options, queryParams }: GenerateKeyParams): string {
    const excludeQueryParams = options.cacheOptions?.keyOptions?.excludeQueryParams ?? [];
    const excludeHeaders = options.cacheOptions?.keyOptions?.excludeHeaders ?? [];
    const sortKeys = options.cacheOptions?.keyOptions?.sortKeys ?? true;
    const sortHeaders = options.cacheOptions?.keyOptions?.sortHeaders ?? true;
    const method = options.method ?? 'GET';
    const headers = joinHeaders({ agent, options });

    const key: Partial<Key> = {
        method,
        url: clearUrl(path),
    };

    key.queryParameters = keyValueToString(queryParams, excludeQueryParams, sortKeys);
    key.headers = keyValueToString(headers, excludeHeaders, sortHeaders);

    if (method === 'POST') {
        key.body = options.body ?? '';
    }

    return JSON.stringify(key);
}
