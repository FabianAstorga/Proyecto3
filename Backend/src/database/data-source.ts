import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config(); // Cargar variables de .env

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || "panel",
  password: process.env.DB_PASSWORD || "", // tu contraseña está vacía
  database: process.env.DB_NAME || "paneladmin",
  entities: [join(__dirname, "entities/**/*.entity.{ts,js}")],
  migrations: [join(__dirname, "migrations/*.{ts,js}")],
  subscribers: [],
  synchronize: true,
  logging: true,
});
