import { IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearSecuenciaCertificadoDto {
  @ApiProperty({
    description: 'Año de la secuencia',
    example: 2024
  })
  @IsNumber()
  year: number;

  @ApiProperty({
    description: 'Último número utilizado en el año',
    example: 1
  })
  @IsNumber()
  ultimoNumero: number;

  @ApiProperty({
    description: 'Prefijo para los certificados',
    example: 'CERT',
    maxLength: 10,
    default: 'CERT'
  })
  @IsString()
  @MaxLength(10)
  prefijo: string = 'CERT';
}

export class ActualizarSecuenciaCertificadoDto {
  @ApiProperty({
    description: 'Último número utilizado en el año',
    example: 100
  })
  @IsNumber()
  ultimoNumero: number;
}