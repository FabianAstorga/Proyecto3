import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  MinLength,
  IsEnum,
  IsNumber,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

  @IsPhoneNumber()
  @IsString()
  telefono: string;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsIn(['funcionario', 'secretaria', 'administrador'])
  @IsOptional()
  rol?: string;
}
