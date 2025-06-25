import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheProvider } from './cache-provider.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: parseInt(config.get('CACHE_TTL') || '0', 10),
        isGlobal: true,
      }),
    }),
  ],
  providers: [CacheProvider],
  exports: [CacheProvider],
})
export class CacheProviderModule {}