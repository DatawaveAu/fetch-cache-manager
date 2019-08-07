import { CacheItem } from '../..';

export type CacheItemIsExpired<T> = Pick<CacheItem<T>, 'cacheTtlMs' | 'lastUpdate'>;

export default function isExpired<T>({ cacheTtlMs, lastUpdate }: CacheItemIsExpired<T>): boolean {
    return lastUpdate + cacheTtlMs < Date.now();
}
