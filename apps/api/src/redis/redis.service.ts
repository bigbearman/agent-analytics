import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super(configService.getOrThrow<string>('REDIS_URL'));
  }

  async onModuleDestroy() {
    await this.quit();
  }

  /** Cache wrapper: get from cache or execute fn and cache result */
  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    const result = await fn();
    await this.setex(key, ttlSeconds, JSON.stringify(result));
    return result;
  }
}
