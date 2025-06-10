import { ConfigService } from "@nestjs/config";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { HttpProvider } from "../../../../shared/infrastructure/http/rest-http-provider.service";
import { IClientRestService } from "./interfaces/client-rest.interface";
import { HttpRequestOptions, HttpResponse } from "../../../../shared/domain/http-client-options.dto";
import { LEGACY_IA } from "../../../../shared/constants/constants";

@Injectable()
export class ClientRestService implements IClientRestService {
    private readonly logger = new Logger(ClientRestService.name);
    private readonly maxTimeRest: number;
    private readonly model: string;
    private readonly endPoint: string;
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService,
        private readonly http: HttpProvider,
        @Inject('TransactionId') private readonly transactionId: string,
    ) {
        this.maxTimeRest = this.configService.get<number>('REST_TIMEOUT', 2000);
        this.model = this.configService.get<string>('AI_MODEL_EMBEDDING');
        this.endPoint = this.configService.get<string>('AI_ENDPOINT_EMBEDDING');
        this.apiKey = this.configService.get<string>('AI_API_KEY');
    }

    /**
     * Realiza la peticion HTTP hacia un legado Externo de Generacion de embedding
     * @input Dato a codificar  
     * @returns Promise<HttpResponse<T>>
     */
    async postEmbedding<T = any>(input: string): Promise<HttpResponse<T>> {
        const start = Date.now();
        const request: HttpRequestOptions = {
            method: 'POST',
            url: this.endPoint,
            headers: { Authorization: `Bearer ${this.apiKey}`, },
            body: {
                input,
                model: this.model
            },
            timeout: this.maxTimeRest
        };
        const logData = {
            transactionId: this.transactionId,
            legacy: LEGACY_IA,
            request,
        };
        this.logger.log('START Consumer HTTP', logData);
        const response = await this.http.request(request);
        this.logger.log('END Consumer HTTP', {
            ...logData,
            response,
            processingTime: `${Date.now() - start}ms`,
        });
        return response;
    }
}