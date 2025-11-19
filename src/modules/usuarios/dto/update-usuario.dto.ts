import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsEmail 
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;


  @IsOptional() 
  @IsEmail()      
  correo?: string; 
  // -----------------------

  @IsOptional()
  @MinLength(8)
  contrasena?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean; 

  @IsOptional()
  telefono?: string;

  @IsOptional()
  @IsString()
  anexo?: string;

  @IsOptional()
  @IsString()
  foto_url?: string;
}
