"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updatetables1763796079455 = void 0;
class Updatetables1763796079455 {
    name = 'Updatetables1763796079455';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_bb9ba15dcfc2b4290f68ab5984c\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_4efa6a34c12b33a5af581921e3d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_31de388da9ab5bcae1dd4392b4d\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_7c5d0bcddab72c6d1dc6e2003b8\``);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`horaFin\` \`horaFin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_31de388da9ab5bcae1dd4392b4d\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_7c5d0bcddab72c6d1dc6e2003b8\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_7c5d0bcddab72c6d1dc6e2003b8\``);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_31de388da9ab5bcae1dd4392b4d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_4efa6a34c12b33a5af581921e3d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_bb9ba15dcfc2b4290f68ab5984c\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`horaFin\` \`horaFin\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_7c5d0bcddab72c6d1dc6e2003b8\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_31de388da9ab5bcae1dd4392b4d\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL DEFAULT 'NULL'`);
    }
}
exports.Updatetables1763796079455 = Updatetables1763796079455;
//# sourceMappingURL=1763796079455-updatetables.js.map