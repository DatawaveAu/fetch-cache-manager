import { FetchOptions, QueryParam } from '..';
import { Agent } from '../add-agent';
import uniqBy from 'lodash/uniqBy';

export interface GetQueryParams {
    agent: Pick<Agent, 'query'>;
    path: string;
    options: Pick<FetchOptions, 'query'>;
}

export default function getQueryParams({ agent, options, path }: GetQueryParams): QueryParam[] {
    const pathQueryParameters: QueryParam[] = queryParametersFromString(path.includes('?') ? path.substring(path.indexOf('?') + 1) : '');

    return uniqBy([
        ...(options?.query ?? []),
        ...pathQueryParameters,
        ...(agent?.query ?? []),
    ], 'key');
}

function queryParametersFromString(str: string): QueryParam[] {
    return str
        .split('&')
        .map((queryParamPair: string): QueryParam => {
            const split = queryParamPair.split('=');

            return split.length === 2 ? { key: split[0], value: split[1] } : null;
        }, {})
        .filter(Boolean);
}
