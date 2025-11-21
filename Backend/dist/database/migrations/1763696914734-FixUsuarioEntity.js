"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixUsuarioEntity1763696914734 = void 0;
class FixUsuarioEntity1763696914734 {
    name = 'FixUsuarioEntity1763696914734';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`horario\` (\`id_agenda\` int NOT NULL AUTO_INCREMENT, \`bloque\` varchar(255) NOT NULL, \`fecha\` date NOT NULL, \`horaInicio\` datetime NOT NULL, \`horaFin\` datetime NOT NULL, \`esDisponible\` tinyint NOT NULL DEFAULT 1, \`usuario_id\` int NULL, PRIMARY KEY (\`id_agenda\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rol\` enum ('funcionario', 'secretaria', 'administrador') NOT NULL DEFAULT 'funcionario', \`nombre\` varchar(50) NOT NULL, \`apellido\` varchar(50) NOT NULL, \`correo\` varchar(100) NOT NULL, \`contrasena\` varchar(255) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`telefono\` varchar(20) NOT NULL, \`foto_url\` varchar(255) NULL, \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_7c5d0bcddab72c6d1dc6e2003b8\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_7c5d0bcddab72c6d1dc6e2003b8\``);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_4efa6a34c12b33a5af581921e3d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_bb9ba15dcfc2b4290f68ab5984c\``);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`usuario\``);
        await queryRunner.query(`DROP TABLE \`horario\``);
    }
}
exports.FixUsuarioEntity1763696914734 = FixUsuarioEntity1763696914734;
//# sourceMappingURL=1763696914734-FixUsuarioEntity.js.map