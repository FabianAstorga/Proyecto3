import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1763525343071 implements MigrationInterface {
    name = ' $npmConfigName1763525343071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_bb9ba15dcfc2b4290f68ab5984c\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` DROP FOREIGN KEY \`FK_4efa6a34c12b33a5af581921e3d\``);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_0501072aea4d19a374c26881457\``);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`descripcion\` \`descripcion\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`asignado_por\` \`asignado_por\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`notificacion\` DROP FOREIGN KEY \`FK_6c7a40c0a97e2d62f07156c2943\``);
        await queryRunner.query(`ALTER TABLE \`notificacion\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`notificacion\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`notificacion\` ADD CONSTRAINT \`FK_6c7a40c0a97e2d62f07156c2943\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`asignado_por\` \`asignado_por\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`descripcion\` \`descripcion\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_0501072aea4d19a374c26881457\` FOREIGN KEY (\`asignado_por\`) REFERENCES \`usuario\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`cargo_id\` \`cargo_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` CHANGE \`fecha_fin\` \`fecha_fin\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_4efa6a34c12b33a5af581921e3d\` FOREIGN KEY (\`cargo_id\`) REFERENCES \`cargo\`(\`id_cargo\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`empleado_cargo\` ADD CONSTRAINT \`FK_bb9ba15dcfc2b4290f68ab5984c\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cargo\` CHANGE \`descripcion\` \`descripcion\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
