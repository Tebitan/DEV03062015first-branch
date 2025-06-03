import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ALLOWED_TEXT_REGEX } from '../../../shared/resources/constants';

/**
 * DTO de peticion para consultar FAQ
 */
export class FindFaqByQuestionDto {
    @ApiProperty({
        description: 'Pregunta a buscar',
        example: '¿Hay parqueadero disponible?',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    @Matches(ALLOWED_TEXT_REGEX, {
        message:
            'La pregunta contiene caracteres no permitidos. Solo letras, números, puntuación, @ y emojis.',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    readonly question: string;
}
