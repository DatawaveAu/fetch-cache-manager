import { FetchOptions, Header } from '..';
import { Agent } from '../agent/agents';
import uniqBy from 'lodash/uniqBy';

export interface JoinHeadersParams {
    agent: Pick<Agent, 'headers'>;
    options: Pick<FetchOptions, 'headers'>;
}

export default function joinHeaders({ agent, options }: JoinHeadersParams): Header[] {
    return uniqBy([
        ...(options?.headers ?? []),
        ...(agent?.headers ?? []),
    ], 'key');
}
