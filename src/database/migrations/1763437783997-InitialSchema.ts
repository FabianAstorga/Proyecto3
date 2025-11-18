import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1763437783997 implements MigrationInterface {
    name = 'InitialSchema1763437783997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cargo\` (\`id_cargo\` int NOT NULL AUTO_INCREMENT, \`rol\` varchar(255) NOT NULL, \`descripcion\` text NULL, UNIQUE INDEX \`IDX_81f7d20b6772b2f8d377f6c1ec\` (\`rol\`), PRIMARY KEY (\`id_cargo\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`empleado_cargo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fecha_inicio\` date NOT NULL, \`fecha_fin\` date NULL, \`usuario_id\` int NULL, \`cargo_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`actividad\` (\`id_actividad\` int NOT NULL AUTO_INCREMENT, \`titulo\` varchar(50) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`fecha\` date NOT NULL, \`tipo\` varchar(100) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`es_repetitiva\` tinyint NOT NULL DEFAULT 1, \`informeIdInforme\` int NULL, PRIMARY KEY (\`id_actividad\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`informe\` (\`id_informe\` int NOT NULL AUTO_INCREMENT, \`periodo\` varchar(20) NOT NULL, \`url_pdf\` varchar(255) NOT NULL, \`fechaEnvio\` date NULL, \`fechaRevision\` date NULL, \`estado\` varchar(255) NOT NULL DEFAULT 'pendiente', \`observaciones\` text NULL, \`usuario_id\` int NULL, PRIMARY KEY (\`id_informe\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`horario\` (\`id_horario\` int NOT NULL AUTO_INCREMENT, \`fecha\` date NOT NULL, \`horaInicio\` time NOT NULL, \`horaFin\` time NOT NULL, \`descripcion\` text NULL, \`estado\` varchar(255) NOT NULL DEFAULT 'activo', \`fecha_asignacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`asignado_por\` int NULL, PRIMARY KEY (\`id_horario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notificacion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipo\` varchar(50) NOT NULL, \`mensaje\` text NOT NULL, \`leido\` tinyint NOT NULL DEFAULT 0, \`fechaEnvio\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`usuario_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(50) NOT NULL, \`apellido\` varchar(50) NOT NULL, \`correo\` varchar(100) NOT NULL, \`contrasena\` varchar(8) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`telefono\` varchar(20) NOT NULL, \`foto_url\` varchar(255) NULL, \`esJefe\` tinyint NOT NULL DEFAULT 0, \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_0501072aea4d19a374c26881457\` FOREIGN KEY (\`asignado_por\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`notificacion\` ADD CONSTRAINT \`FK_6c7a40c0a97e2d62f07156c2943\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notificacion\` DROP FOREIGN KEY \`FK_6c7a40c0a97e2d62f07156c2943\``);
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_0501072aea4d19a374c26881457\``);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_4efa6a34c12b33a5af581921e3d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_bb9ba15dcfc2b4290f68ab5984c\``);
        await queryRunner.query(`DROP TABLE \`usuario\``);
        await queryRunner.query(`DROP TABLE \`notificacion\``);
        await queryRunner.query(`DROP TABLE \`horario\``);
        await queryRunner.query(`DROP TABLE \`informe\``);
        await queryRunner.query(`DROP TABLE \`actividad\``);
        await queryRunner.query(`DROP TABLE \`empleado_cargo\``);
        await queryRunner.query(`DROP INDEX \`IDX_81f7d20b6772b2f8d377f6c1ec\` ON \`cargo\``);
        await queryRunner.query(`DROP TABLE \`cargo\``);
    }

}
