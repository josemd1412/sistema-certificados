import { IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';
export class CrearAlumnoDto {
  @IsNumber()
  idCurso: number;

  @IsString()
  nombreCompletos: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  cargoEmpresa?: string;

  @IsOptional()
  @IsNumber()
  anosExperiencia?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}