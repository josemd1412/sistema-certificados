import { IsString, IsOptional, IsEmail, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearInstructorDto {
  @ApiProperty({
    description: 'Nombres y apellidos completos del instructor',
    example: 'Dr. Ana María Rodríguez López',
    maxLength: 300
  })
  @IsString()
  @MaxLength(300)
  nombreCompletos: string;

  @ApiProperty({
    description: 'Número de DNI del instructor (8 dígitos)',
    example: '87654321',
    pattern: '^[0-9]{8}$',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8}$/, { message: 'DNI debe tener exactamente 8 dígitos' })
  dni?: string;

  @ApiProperty({
    description: 'Especialidad o área de expertise del instructor',
    example: 'Ingeniería de Seguridad Industrial',
    required: false
  })
  @IsOptional()
  @IsString()
  especialidad?: string;

  @ApiProperty({
    description: 'Grado académico del instructor',
    example: 'Doctor en Ingeniería',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  gradoAcademico?: string;

  @ApiProperty({
    description: 'Teléfono de contacto del instructor',
    example: '987654321',
    maxLength: 15,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del instructor',
    example: 'ana.rodriguez@tecsup.edu.pe',
    maxLength: 100,
    required: false
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}