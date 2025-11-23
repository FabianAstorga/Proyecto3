import { CreateInformeDto } from './create-informe.dto';
declare const UpdateInformeDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateInformeDto>>;
export declare class UpdateInformeDto extends UpdateInformeDto_base {
    fechaEnvio?: string;
    fechaRevision?: string;
    estado?: string;
    observaciones?: string;
}
export {};
