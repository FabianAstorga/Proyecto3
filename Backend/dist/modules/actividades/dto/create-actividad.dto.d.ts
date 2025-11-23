export declare enum ModoCreacion {
    SIMPLE = "simple",
    FECHAS_ESPECIFICAS = "fechas_especificas",
    REPETICION_SEMANAL = "repeticion_semanal"
}
declare class FechaEspecificaDto {
    fecha: string;
}
export declare class CreateActividadDto {
    modo: ModoCreacion;
    titulo: string;
    descripcion: string;
    tipo: string;
    estado?: string;
    esRepetitiva?: boolean;
    fecha?: string;
    fechas_especificas?: FechaEspecificaDto[];
    fecha_desde?: string;
    fecha_hasta?: string;
    dias_semana?: string[];
}
export {};
