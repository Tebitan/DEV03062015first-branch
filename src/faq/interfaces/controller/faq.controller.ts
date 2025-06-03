import { FastifyReply } from 'fastify';
import { Controller, Post, Body, Logger, Inject, Res, HttpStatus } from '@nestjs/common';
import { FaqService } from '../../application/faq.service';
import { CreateFaqDto } from '../../domain/dto';
import { END_POINT_METHOD_FAQ, LEGACY, SERVICE_NAME, SERVICE_PREFIX } from '../../../shared/resources/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../shared/domain/apiResponse.dto';

/**
 * @description Archivo controlador responsable de manejar las solicitudes entrantes que llegan a un end point.
 */
@ApiTags(SERVICE_NAME)
@Controller()
export class FaqController {
  private readonly logger = new Logger(FaqController.name);
  constructor(@Inject('TransactionId') private readonly transactionId: string,
    private readonly faqService: FaqService) { }

  @ApiResponse({
    type: ApiResponseDto,
    status: HttpStatus.CREATED,
  })
  @Post(END_POINT_METHOD_FAQ)
  async createFaq(@Res() res: FastifyReply, @Body() createFaqDto: CreateFaqDto) {
    const start = Date.now();
    let response: ApiResponseDto;
    const logData = {
      transactionId: this.transactionId,
      legacy: LEGACY,
      request: createFaqDto
    };
    try {
      this.logger.log(`START [POST] END_POINT ${SERVICE_PREFIX}/${END_POINT_METHOD_FAQ}`, logData);
      response = await this.faqService.createFaq(createFaqDto);
      res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      res.status(response.responseCode).send(response);
    } finally {
      this.logger.log(`END [POST] END_POINT ${SERVICE_PREFIX}/${END_POINT_METHOD_FAQ}`, {
        ...logData,
        response,
        processingTime: `${Date.now() - start}ms`,
      });
    }
  }
}
