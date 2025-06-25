import { ApiResponseDto } from "src/shared/domain/api-response.dto";

export abstract class IAdapterCache {
  abstract getFaqConcurrent(question: string): Promise<ApiResponseDto|undefined>;
  abstract setFaqConcurrent(question: string, value:ApiResponseDto): Promise<void>;
  abstract delFaqConcurrent(question: string): Promise<void>;
}