import { User } from "../../models/user.model";
import { Cargo } from "../../models/charge.model";

export interface EmpleadoCargo {
  id: number; // PK de la tabla intermedia
  usuario: User; // objeto completo del usuario
  cargo: Cargo; // objeto completo del cargo
}
