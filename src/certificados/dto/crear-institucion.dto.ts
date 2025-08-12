import { IsString, IsEnum, IsOptional, IsNumber, IsEmail, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearInstitucionDto {
  @ApiProperty({
    description: 'Nombre de la institución',
    example: 'TECSUP - Instituto de Educación Superior Tecnológica',
    maxLength: 300
  })
  @IsString()
  @MaxLength(300)
  nombre: string;

  @ApiProperty({
    description: 'Tipo de institución',
    enum: ['EMPRESA', 'COLEGIO', 'UNIVERSIDAD', 'BASE_MILITAR', 'OTRO'],
    example: 'UNIVERSIDAD'
  })
  @IsEnum(['EMPRESA', 'COLEGIO', 'UNIVERSIDAD', 'BASE_MILITAR', 'OTRO'])
  tipo: string;

  @ApiProperty({
    description: 'ID de la ubicación de la institución',
    example: 1
  })
  @IsNumber()
  idUbicacion: number;

  @ApiProperty({
    description: 'Dirección de la institución',
    example: 'Av. Cascanueces 2221, Villa El Salvador',
    required: false
  })
  @IsOptional()
  @IsString()
  direeccion?: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la institución',
    example: '016105555',
    maxLength: 15,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico institucional',
    example: 'contacto@tecsup.edu.pe',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    description: 'Número de RUC de la institución (11 dígitos)',
    example: '20100070970',
    pattern: '^[0-9]{11}$',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{11}$/, { message: 'RUC debe tener exactamente 11 dígitos' })
  @MaxLength(20)
  ruc?: string;
}