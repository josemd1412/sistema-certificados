import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FiltrosFiscaliaDto {
  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  incluirAnulados?: boolean = false;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  dniAlumno?: string;
}