import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CacheProvider } from "../../../shared/infrastructure/cache/cache-provider.service";
import { IAdapterCache } from "./interfaces/adapter-cache.interface";
import { ApiResponseDto } from "../../../shared/domain/api-response.dto";
import { LEGACY_CACHE } from "../../../shared/constants/constants";

@Injectable()
export class AdapterCacheService implements IAdapterCache {
    private readonly logger = new Logger(AdapterCacheService.name);
    private readonly ttlCache: number;

    constructor(private readonly configService: ConfigService,
        private readonly cache: CacheProvider,
        @Inject('TransactionId') private readonly transactionId: string,

    ) {
        this.ttlCache = this.configService.get<number>('CACHE_TTL', 0);
    }

    async getFaqConcurrent(question: string): Promise<ApiResponseDto|undefined> {
        const start = Date.now();
        const logData = {
            transactionId: this.transactionId,
            legacy: LEGACY_CACHE,
            request: question,
        };
        this.logger.log('START GET CACHE', logData);
        const response:any = await this.cache.get<ApiResponseDto>(question);
        this.logger.log('END GET CACHE', {
            ...logData,
            response,
            processingTime: `${Date.now() - start}ms`,
        });
        return response;
    }

    async setFaqConcurrent(question: string, value: ApiResponseDto): Promise<void> {
        const start = Date.now();
        const logData = {
            transactionId: this.transactionId,
            legacy: LEGACY_CACHE,
            request: question,
        };
        this.logger.log('START SET CACHE', logData);
        const response = await this.cache.set(question, value, this.ttlCache);
        this.logger.log('END SET CACHE', {
            ...logData,
            response,
            processingTime: `${Date.now() - start}ms`,
        });
    }


    async delFaqConcurrent(question: string): Promise<void> {
        const start = Date.now();
        const logData = {
            transactionId: this.transactionId,
            legacy: LEGACY_CACHE,
            request: question,
        };
        this.logger.log('START DELETE CACHE', logData);
        const response = await this.cache.del(question);
        this.logger.log('END DELETE CACHE', {
            ...logData,
            response,
            processingTime: `${Date.now() - start}ms`,
        });
    }
}