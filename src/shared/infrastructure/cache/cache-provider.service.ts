import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheProvider } from './interfaces/cache-provider.interface';

/**
 * Logica para administar la cache 
 */
@Injectable()
export class CacheProvider implements ICacheProvider {
    constructor(@Inject(CACHE_MANAGER) private cache: Cache) { }

    async get<T>(key: string): Promise<T | undefined> {
        return this.cache.get<T>(key);
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await this.cache.set(key, value, ttl);
    }

    async del(key: string): Promise<void> {
        await this.cache.del(key);
    }
}