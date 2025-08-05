import { IsOptional, IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';

export class ActualizarAlumnoDto {
  @IsOptional()
  @IsEnum(['INSCRITO', 'ASISTENTE', 'APROBADO', 'REPROBADO', 'RETIRADO'])
  estadoAlumno?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  notaFinal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAsistencia?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}