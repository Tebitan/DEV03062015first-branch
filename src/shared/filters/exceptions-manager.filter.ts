import {
    Catch,
    ExceptionFilter,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { BusinessExceptionDto } from '../domain/business-exceptions.dto';
import { ApiResponseDto } from '../domain/api-response.dto';
import { CODE_400, CODE_500, CODE_504, LEGACY, MSG_400, MSG_500, MSG_504 } from '../constants/constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        let apiResponse: ApiResponseDto;
        if (exception instanceof BusinessExceptionDto) {
            apiResponse = new ApiResponseDto({
                responseCode: exception.responseCode,
                messageCode: exception.messageCode,
                message: exception.message,
                legacy: exception.legacy,
                transactionId: exception.transactionId,
                data: exception.data,
            });
        } else if (exception instanceof HttpException) {
            //HTTP code 400 504 
            const status = exception.getStatus();
            const res = exception.getResponse() as
                | string
                | { message: string | string[] };
            let messageCodeApply: string = CODE_400;
            let messageApply: string = MSG_400;
            let dataApply: any = typeof res === 'string' ? res : (res.message as string);

            if (status === HttpStatus.GATEWAY_TIMEOUT) {
                messageCodeApply = CODE_504;
                messageApply = MSG_504;
                dataApply = null;
            }
            apiResponse = new ApiResponseDto({
                responseCode: status,
                messageCode: messageCodeApply,
                message: messageApply,
                legacy: LEGACY,
                transactionId: uuidv4(),
                data: dataApply,
            });
        } else {
            // Error genérico
            apiResponse = new ApiResponseDto({
                responseCode: HttpStatus.INTERNAL_SERVER_ERROR,
                messageCode: CODE_500,
                message: MSG_500,
                legacy: LEGACY,
                transactionId: uuidv4(),
                data: exception,
            });
        }
        response.code(apiResponse.responseCode).send(apiResponse);
    }
}
