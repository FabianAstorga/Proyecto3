import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsIn,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  
  @IsEmail({}, { message: 'El correo debe tener un formato válido.' })
  correo!: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena!: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  apellido!: string;

  @IsPhoneNumber('CL', { message: 'Debe ingresar un número de teléfono válido de Chile.' })
  telefono!: string;

  @IsOptional()
  @IsNotEmpty({ message: 'La URL de la foto no puede estar vacía.' })
  foto_url?: string;

  @IsOptional()
  @IsIn(['funcionario', 'secretaria', 'administrador'], {
    message: 'El rol debe ser funcionario, secretaria o administrador.',
  })
  rol?: string;
}
