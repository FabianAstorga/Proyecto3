import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  correo!: string;

  @IsNotEmpty()
  @MinLength(8)
  contrasena!: string;

  @IsNotEmpty()
  nombre!: string;

  @IsNotEmpty()
  apellido!: string;

  @IsPhoneNumber()
  telefono!: string;

  @IsOptional()
  @IsNotEmpty()
  foto_url?: string;
  
  @IsOptional()
  @IsIn(['funcionario', 'secretaria', 'administrador'])
  rol?: string;
}
