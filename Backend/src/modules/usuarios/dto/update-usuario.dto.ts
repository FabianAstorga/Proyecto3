import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  correo?: string;

  @IsOptional()
  @MinLength(8)
  contrasena?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsOptional()
  @IsPhoneNumber()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  foto_url?: string;

  @IsIn(['funcionario', 'secretaria', 'administrador'])
  @IsOptional() 
  rol?: string;
}
