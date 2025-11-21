export declare enum ModoCreacion {
    SIMPLE = "simple",
    FECHAS_ESPECIFICAS = "fechas_especificas",
    REPETICION_SEMANAL = "repeticion_semanal"
}
export declare class FechaEspecificaDto {
    fecha: string;
}
export declare class CreateActividadDto {
    titulo: string;
    tipo: string;
    estado: string;
    descripcion: string;
    esRepetitiva?: boolean;
    modo: ModoCreacion;
    fecha?: string;
    fechas_especificas?: FechaEspecificaDto[];
    fecha_desde?: string;
    fecha_hasta?: string;
    dias_semana?: string[];
}
