import { IsOptional, IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarAlumnoDto {
  @ApiProperty({
    description: 'Estado actual del alumno en el curso',
    enum: ['INSCRITO', 'ASISTENTE', 'APROBADO', 'REPROBADO', 'RETIRADO'],
    example: 'APROBADO',
    required: false
  })
  @IsOptional()
  @IsEnum(['INSCRITO', 'ASISTENTE', 'APROBADO', 'REPROBADO', 'RETIRADO'])
  estado?: string;

  @ApiProperty({
    description: 'Nota final del alumno (escala de 0 a 20)',
    example: 16.5,
    minimum: 0,
    maximum: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  nota?: number;

  @ApiProperty({
    description: 'Porcentaje de asistencia del alumno (0-100%)',
    example: 85,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAsistencia?: number;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el alumno',
    example: 'Alumno destacado con excelente participación',
    required: false
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}