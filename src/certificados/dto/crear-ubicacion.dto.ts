import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CrearUbicacionDto {
  @ApiProperty({
    description: 'Nombre del departamento',
    example: 'Lima',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  departamento: string;

  @ApiProperty({
    description: 'Nombre de la provincia',
    example: 'Lima',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  provincia: string;

  @ApiProperty({
    description: 'Nombre del distrito',
    example: 'Lima',
    maxLength: 50
  })  
  @IsString()
  @MaxLength(50)
  distrito: string;
}