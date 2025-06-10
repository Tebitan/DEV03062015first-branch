import { HttpRequestOptions, HttpResponse } from "../../../domain/http-client-options.dto";

export abstract class IHttpProvider {  
  abstract request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>>;
}
