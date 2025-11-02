import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  IsBoolean, 
  MinLength,
  IsEnum,
  IsNumber
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

 
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena?: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['admin', 'funcionario', 'academico'], { message: 'Rol no válido' })
  rol: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean; 

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  anexo?: string;

  @IsString()
  @IsOptional()
  foto_url?: string;

  @IsString()
  @IsOptional()
  url_horario?: string;

  // --- Claves foráneas para las relaciones ---

  @IsNumber()
  @IsOptional()
  jefe_id?: number;

  @IsNumber()
  @IsNotEmpty()
  departamento_id: number;

  @IsNumber()
  @IsOptional()
  oficina_id?: number;
}
