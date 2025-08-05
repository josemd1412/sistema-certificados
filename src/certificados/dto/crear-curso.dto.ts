import { IsString, IsOptional, IsDateString, IsNumber, Min, IsEnum } from 'class-validator';

export class CrearCursoDto {
  @IsString()
  nombreCurso: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fInicio: string;

  @IsDateString()
  fFin: string;

  @IsNumber()
  idInstructor: number;

  @IsEnum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'])
  tipo: string;

  @IsNumber()
  idInstitucion: number;

  @IsNumber()
  idUbicacion: number;

  @IsNumber()
  @Min(1)
  duracionHoras: number;

  @IsOptional()
  @IsString()
  modalidad?: string;

  @IsOptional()
  @IsNumber()
  capacidadMaxima?: number;

  @IsOptional()
  @IsNumber()
  precioCurso?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}