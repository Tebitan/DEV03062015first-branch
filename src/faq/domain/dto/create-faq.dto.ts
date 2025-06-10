import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { removeAccents } from '../../../shared/utils/common-utils';
import { ALLOWED_TEXT_REGEX } from '../../../shared/constants/constants';

/**
 * DTO de petición para crear FAQ
 */
export class CreateFaqDto {
  @ApiProperty({
    description: 'Pregunta frecuente del usuario',
    example: 'Puedo llevar mascotas',
  })
  @IsString({ message: 'El campo $property debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo $property no puede estar vacío.' })
  @MaxLength(300, {
    message: 'El campo $property no puede tener más de $constraint1 caracteres.',
  })
  @Matches(ALLOWED_TEXT_REGEX, {
    message: 'El campo $property solo debe contener letras y números sin acentos.',
  })
  @Transform(({ value }) => removeAccents(value.trim().toLowerCase()))
  readonly question: string;

  @ApiProperty({
    description: 'Respuesta a la pregunta',
    example: 'Si se permiten mascotas',
  })
  @IsString({ message: 'El campo $property debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo $property no puede estar vacío.' })
  @MaxLength(1000, {
    message: 'El campo $property no puede tener más de $constraint1 caracteres.',
  })
  @Matches(ALLOWED_TEXT_REGEX, {
    message: 'El campo $property solo debe contener letras y números sin acentos.',
  })
  @Transform(({ value }) => removeAccents(value.trim().toLowerCase()))
  readonly answer: string;
}
