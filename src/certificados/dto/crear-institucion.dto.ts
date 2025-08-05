import { IsString, IsEnum, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CrearInstitucionDto {
  @IsString()
  nombre: string;

  @IsEnum(['EMPRESA', 'COLEGIO', 'UNIVERSIDAD', 'BASE_MILITAR', 'OTRO'])
  tipo: string;

  @IsOptional()
  @IsString()
  ruc?: string;

  @IsNumber()
  idUbicacion: number;

  @IsOptional()
  @IsString()
  direccionCompleta?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  contactoPrincipal?: string;
}