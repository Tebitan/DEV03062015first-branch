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
 * DTO de petición para crear FAQ
 */
export class CreateFaqDto {
  @ApiProperty({
    description: 'Pregunta frecuente del usuario',
    example: '¿Puedo llevar mascotas? 🐶',
  })
  @IsString({ message: 'El campo $property debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo $property no puede estar vacío.' })
  @MaxLength(300, {
    message: 'El campo $property no puede tener más de $constraint1 caracteres.',
  })
  @Matches(ALLOWED_TEXT_REGEX, {
    message:
      'El campo $property contiene caracteres no permitidos. Solo letras, números, puntuación, @ y emojis.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  readonly question: string;

  @ApiProperty({
    description: 'Respuesta a la pregunta',
    example: 'Sí, se permiten mascotas pequeñas. 🐾',
  })
  @IsString({ message: 'El campo $property debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo $property no puede estar vacío.' })
  @MaxLength(1000, {
    message: 'El campo $property no puede tener más de $constraint1 caracteres.',
  })
  @Matches(ALLOWED_TEXT_REGEX, {
    message:
      'El campo $property contiene caracteres no permitidos. Solo letras, números, puntuación, @ y emojis.',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  readonly answer: string;
}
