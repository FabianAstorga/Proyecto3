// src/roles/dto/create-role.dto.ts
import { IsNotEmpty, IsUrl, IsString, ValidateIf, IsIn } from 'class-validator';

export class CreateCargoDto {
  @IsString()
  @IsNotEmpty()
  rol: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['academico', 'funcionario'], {
    message: 'El tipo debe ser ACADEMICO o FUNCIONARIO',
  })
  tipo: string;

  @IsString()
  @IsNotEmpty()
  especialidad: string;

  // REGLA DE NEGOCIO: url_horario solo es OBLIGATORIO para 'ACADEMICO'
  @ValidateIf((o) => o.tipo === 'ACADEMICO')
  @IsUrl(
    { require_tld: true },
    { message: 'url_horario debe ser una URL válida si el tipo es ACADEMICO' },
  )
  @IsNotEmpty()
  url_horario: string;

  // Para FUNCIONARIO, si lo envían debe ser una URL válida, si no lo envían, está bien (es opcional)
  @ValidateIf((o) => o.tipo === 'FUNCIONARIO' && o.url_horario !== undefined)
  @IsUrl({ require_tld: true })
  @IsString()
  url_horario_opcional_func: string; // Usamos un nombre de campo temporal si es necesario
}
