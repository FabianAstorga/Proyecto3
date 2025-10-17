"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'panel',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'paneladmin',
    entities: [(0, path_1.join)(__dirname, 'entities/**/*.entity.{ts,js}')],
    migrations: [(0, path_1.join)(__dirname, 'migrations/*.{ts,js}')],
    subscribers: [],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=data-source.js.map