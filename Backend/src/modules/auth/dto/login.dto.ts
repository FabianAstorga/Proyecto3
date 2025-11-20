import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  correo!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  contrasena!: string;
}
