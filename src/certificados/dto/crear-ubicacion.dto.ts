import { IsString, IsOptional } from 'class-validator';
export class CrearUbicacionDto {
  @IsString()
  departamento: string;

  @IsString()
  provincia: string;

  @IsString()
  distrito: string;

  @IsOptional()
  @IsString()
  codigoUbigeo?: string;
}