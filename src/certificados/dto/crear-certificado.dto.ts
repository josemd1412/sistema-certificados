import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCertificadoDto {
  @ApiProperty({
    description: 'Número del certificado',
    example: 'CERT-2024-0001',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  numeroCertificado: string;

  @ApiProperty({
    description: 'ID del alumno para quien se genera el certificado',
    example: 123
  })
  @IsNumber()
  idAlumno: number;

  @ApiProperty({
    description: 'Ruta del archivo PDF del certificado',
    example: '/certificates/2024/cert-001.pdf',
    required: false
  })
  @IsOptional()
  @IsString()
  pdfPath?: string;

  @ApiProperty({
    description: 'Hash SHA-256 del archivo PDF',
    example: 'a1b2c3d4e5f6789...',
    maxLength: 64,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  pdfHash?: string;

  @ApiProperty({
    description: 'Tamaño del archivo PDF en bytes',
    example: 1024576,
    required: false
  })
  @IsOptional()
  @IsNumber()
  pdfSize?: number;

  @ApiProperty({
    description: 'Código de verificación único del certificado',
    example: 'VER-2024-ABCD1234',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  codigoVerificacion: string;
}