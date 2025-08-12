import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FiltrosFiscalizarDto {
  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2023-01-01',
  })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin',
    example: '2023-12-31',
  })
  @IsDateString()
  fechaFin: string;

  @ApiProperty({
    description: 'Incluir certificados anulados',
    example: true,
    required: false
  })
  @IsOptional()
  incluirAnulados?: boolean = false;

  @ApiProperty({
    description: 'Departamento (opcional)',
    example: 'Lima',
    required: false
  })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiProperty({
    description: 'Institución (opcional)',
    example: 'Universidad Nacional',
    required: false
  })
  @IsOptional()
  @IsString()
  institucion?: string;

  @ApiProperty({
    description: 'DNI del alumno (opcional)',
    example: '12345678',
    required: false
  })
  @IsOptional()
  @IsString()
  dniAlumno?: string;
}