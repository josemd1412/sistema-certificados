import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CrearCertificadoDto {
  @IsNumber()
  idAlumno: number;

  @IsOptional()
  @IsDateString()
  fechaEmision?: string;
}