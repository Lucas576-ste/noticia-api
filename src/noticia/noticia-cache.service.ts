import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class NoticiaCacheService {
  private readonly logger = new Logger(NoticiaCacheService.name);
  private readonly ttlMs = 30_000;
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(params: Record<string, unknown>): T | undefined {
    const key = JSON.stringify(params);
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.store.delete(key);
      this.logger.log(`cache miss: ${key}`);
      return undefined;
    }
    this.logger.log(`cache hit: ${key}`);
    return entry.value as T;
  }

  set<T>(params: Record<string, unknown>, value: T): void {
    const key = JSON.stringify(params);
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}
