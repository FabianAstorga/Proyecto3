import { BackendUser } from "./user-backend.model";

export interface LoginResponse {
  message: string;
  user: BackendUser;
  access_token: string;
}
