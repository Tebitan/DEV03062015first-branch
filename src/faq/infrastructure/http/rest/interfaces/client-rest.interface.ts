import { HttpResponse } from '../../../../../shared/domain/http-client-options.dto';

export abstract class IClientRestService {
  abstract postEmbedding<T = any>(input: string): Promise<HttpResponse<T>>;
}
