/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheItem } from '../';
import { expiresIn, isExpired } from '../cache-item';

export interface AgentCache {
  getItem<T = any>(key: string): Promise<CacheItem<T>>;
  setItem<T = any>(key: string, value: CacheItem<T>): Promise<void>;
  deleteItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  getAllValues(): Promise<CacheItem<any>[]>;
  clearCache(): Promise<void>;
  expiresIn(key: string): Promise<number>;
  isExpired(key: string): Promise<boolean>;
}

export class InMemoryCache implements AgentCache {
  cache: Record<string, CacheItem<any>>;

  constructor() {
    this.cache = Object.create(null);
  }

  async getItem<T>(key: string): Promise<CacheItem<T>> {
    return this.cache[key];
  }

  async setItem<T>(key: string, value: CacheItem<T>) {
    this.cache[key] = value;
  }

  async deleteItem(key: string) {
    delete this.cache[key];
  }

  async getAllKeys() {
    return Object.keys(this.cache);
  }

  async getAllValues() {
    return Object.values(this.cache);
  }

  async clearCache(): Promise<void> {
    this.cache = Object.create(null);
  }

  async expiresIn(key: string) {
    return expiresIn(this.cache[key]);
  }

  async isExpired(key: string) {
    return isExpired(this.cache[key]);
  }
}
