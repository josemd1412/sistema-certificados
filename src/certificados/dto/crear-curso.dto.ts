import { IsString, IsOptional, IsDateString, IsNumber, Min, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearCursoDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Curso de Seguridad Industrial',
    maxLength: 300
  })
  @IsString()
  @MaxLength(300)
  nombreCurso: string;

  @ApiProperty({
    description: 'Descripción detallada del curso',
    example: 'Curso especializado en normas de seguridad para el sector industrial',
    required: false
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha de inicio del curso (YYYY-MM-DD)',
    example: '2024-03-01'
  })
  @IsDateString()
  fInicio: string;

  @ApiProperty({
    description: 'Fecha de finalización del curso (YYYY-MM-DD)',
    example: '2024-03-30'
  })
  @IsDateString()
  fFin: string;

  @ApiProperty({
    description: 'ID del instructor que dictará el curso',
    example: 1
  })
  @IsNumber()
  idInstructor: number;

  @ApiProperty({
    description: 'Tipo de modalidad del curso',
    enum: ['PRESENCIAL', 'VIRTUAL', 'HÍBRIDO'],
    example: 'PRESENCIAL'
  })
  @IsEnum(['PRESENCIAL', 'VIRTUAL', 'HÍBRIDO'])
  tipo: string;

  @ApiProperty({
    description: 'ID de la institución que ofrece el curso',
    example: 1
  })
  @IsNumber()
  idInstitucion: number;

  @ApiProperty({
    description: 'ID de la ubicación donde se realizará el curso',
    example: 1
  })
  @IsNumber()
  idUbicacion: number;

  @ApiProperty({
    description: 'Duración del curso en horas',
    example: 40,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  duracionHoras: number;

  @ApiProperty({
    description: 'Modalidad horaria del curso',
    enum: ['MAÑANA', 'TARDE', 'NOCHE', 'FIN_DE_SEMANA'],
    example: 'MAÑANA'
  })
  @IsEnum(['MAÑANA', 'TARDE', 'NOCHE', 'FIN_DE_SEMANA'])
  modalidad: string;
}