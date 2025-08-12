import { IsNumber, IsString, IsOptional, IsEmail, IsDateString, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearAlumnoDto {
  @ApiProperty({
    description: 'ID del curso al que se inscribe el alumno',
    example: 1
  })
  @IsNumber()
  idCurso: number;

  @ApiProperty({
    description: 'Nombres y apellidos completos del alumno',
    example: 'Juan Pérez García',
    maxLength: 300
  })
  @IsString()
  @MaxLength(300)
  nombreCompleto: string;

  @ApiProperty({
    description: 'Número de DNI del alumno (8 dígitos)',
    example: '12345678',
    pattern: '^[0-9]{8}$',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8}$/, { message: 'DNI debe tener exactamente 8 dígitos' })
  dni?: string;

  @ApiProperty({
    description: 'Número de teléfono del alumno',
    example: '987654321',
    maxLength: 15,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del alumno',
    example: 'juan.perez@email.com',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    description: 'Fecha de inscripción (YYYY-MM-DD)',
    example: '2024-03-01'
  })
  @IsDateString()
  fechaInscripcion: string;

  @ApiProperty({
    description: 'Observaciones adicionales sobre el alumno',
    example: 'Alumno destacado con interés especial en tecnologías emergentes',
    required: false
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}