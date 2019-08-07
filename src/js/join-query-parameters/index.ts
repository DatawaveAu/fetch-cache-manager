import { QueryParam } from '..';

export default function joinQueryParameters(queryParameters: QueryParam[]): string {
    return queryParameters
        .map(({ key, value }): string => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}
