import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto {
  @ApiProperty({ example: 200, description: 'Código HTTP de respuesta' })
  responseCode: number;

  @ApiProperty({ example: 'OK', description: 'Código interno del mensaje' })
  messageCode: string;

  @ApiProperty({ example: 'Operación realizada con éxito', description: 'Mensaje descriptivo' })
  message: string;

  @ApiProperty({ example: 'mongoDB', description: 'Código de compatibilidad legado si aplica' })
  legacy: string;

  @ApiProperty({ example: new Date().toISOString(), description: 'Fecha y hora del procesamiento' })
  timestamp: Date;

  @ApiProperty({ example: 'c7b6c3a8-4bc2-4b2f-b6dd-2d3f7a81e785', description: 'ID único de la transacción' })
  transactionId: string;

  @ApiProperty({ description: 'Cuerpo de datos devuelto por la operación', type: Object, nullable: true })
  data: any;

  constructor(props: {
    responseCode: number;
    messageCode: string;
    message: string;
    legacy: string;
    transactionId: string;
    data?: any;
  }) {
    this.responseCode = props.responseCode;
    this.messageCode = props.messageCode;
    this.message = props.message;
    this.legacy = props.legacy;
    this.timestamp = new Date();
    this.transactionId = props.transactionId;
    this.data = props.data ?? null;
  }
}
