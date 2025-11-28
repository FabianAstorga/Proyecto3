import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventoGlobalTable1764299063290 implements MigrationInterface {
    name = 'AddEventoGlobalTable1764299063290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`evento_global\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fecha\` date NOT NULL, \`blockCode\` varchar(20) NOT NULL, \`titulo\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_31de388da9ab5bcae1dd4392b4d\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_7c5d0bcddab72c6d1dc6e2003b8\``);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`horaFin\` \`horaFin\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`titulo\` \`titulo\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`sala\` \`sala\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`descripcion\` \`descripcion\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`usuario_id\` \`usuario_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_31de388da9ab5bcae1dd4392b4d\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_7c5d0bcddab72c6d1dc6e2003b8\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`horario\` DROP FOREIGN KEY \`FK_7c5d0bcddab72c6d1dc6e2003b8\``);
        await queryRunner.query(`ALTER TABLE \`informe\` DROP FOREIGN KEY \`FK_0c3395a57e010fe9c81a93362e0\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_547057389573ff06e66fcb4dbd3\``);
        await queryRunner.query(`ALTER TABLE \`actividad\` DROP FOREIGN KEY \`FK_31de388da9ab5bcae1dd4392b4d\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`fecha_creacion\` \`fecha_creacion\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`foto_url\` \`foto_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`descripcion\` \`descripcion\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`sala\` \`sala\` varchar(100) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`titulo\` \`titulo\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` CHANGE \`horaFin\` \`horaFin\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`horario\` ADD CONSTRAINT \`FK_7c5d0bcddab72c6d1dc6e2003b8\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`observaciones\` \`observaciones\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaRevision\` \`fechaRevision\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` CHANGE \`fechaEnvio\` \`fechaEnvio\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`informe\` ADD CONSTRAINT \`FK_0c3395a57e010fe9c81a93362e0\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`informeIdInforme\` \`informeIdInforme\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` CHANGE \`usuario_id\` \`usuario_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_547057389573ff06e66fcb4dbd3\` FOREIGN KEY (\`informeIdInforme\`) REFERENCES \`informe\`(\`id_informe\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`actividad\` ADD CONSTRAINT \`FK_31de388da9ab5bcae1dd4392b4d\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`evento_global\``);
    }

}
