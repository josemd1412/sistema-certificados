import { IsString, IsOptional, IsEmail } from 'class-validator';
export class CrearInstructorDto {
  @IsString()
  nombreCompletos: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsString()
  numeroColegiatura?: string;

  @IsOptional()
  @IsString()
  gradoAcademico?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}