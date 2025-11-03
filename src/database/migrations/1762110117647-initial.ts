import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1762110117647 implements MigrationInterface {
    name = 'Initial1762110117647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`ubicacion\` varchar(255) NOT NULL, \`departamento_id\` int NULL, UNIQUE INDEX \`IDX_6dc188200327a0a46ece031b22\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`department\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`descripcion\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`activity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`descripcion\` text NOT NULL, \`fecha\` datetime NOT NULL, \`tipo_actividad\` varchar(255) NOT NULL, \`formulario_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`form\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fec_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fec_envio\` datetime NULL, \`estado\` varchar(255) NOT NULL, \`usuario_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`office\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`url_mapa\` varchar(255) NULL, \`codigo\` varchar(255) NOT NULL, \`ubicacion\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9ad874e7ea36464fe68b94786b\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`charge\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rol\` varchar(255) NOT NULL, \`descripcion\` text NULL, UNIQUE INDEX \`IDX_6b509ed72da1da6a9259b64165\` (\`rol\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`employee-charge\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fecha_inicio\` datetime NOT NULL, \`fecha_fin\` datetime NULL, \`usuarioId\` int NOT NULL, \`cargoId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rut\` varchar(255) NOT NULL, \`nombre\` varchar(255) NOT NULL, \`apellidos\` varchar(255) NOT NULL, \`correo\` varchar(255) NOT NULL, \`contrasena\` varchar(255) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`telefono\` varchar(255) NULL, \`anexo\` varchar(255) NULL, \`foto_url\` varchar(255) NULL, \`url_horario\` varchar(255) NULL, \`fecha_creacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`jefe_id\` int NULL, \`departamento_id\` int NULL, \`oficina_id\` int NULL, UNIQUE INDEX \`IDX_9f839e522b3b8c8c8223cde81d\` (\`rut\`), UNIQUE INDEX \`IDX_37e80954fd8499125ff14c586d\` (\`correo\`), UNIQUE INDEX \`REL_590d8507fc5cb83b8bfb3615c7\` (\`oficina_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_6ad33d2e0e27fe0ad77f1ef1d22\` FOREIGN KEY (\`departamento_id\`) REFERENCES \`department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`activity\` ADD CONSTRAINT \`FK_2d5e42ee4753ab51ab5b2ca7efd\` FOREIGN KEY (\`formulario_id\`) REFERENCES \`form\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`form\` ADD CONSTRAINT \`FK_485d95b2720b2633d9f30f15041\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee-charge\` ADD CONSTRAINT \`FK_61cf6982d7c79a151864ea02cb9\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee-charge\` ADD CONSTRAINT \`FK_75a904ca0057b5eb88451480359\` FOREIGN KEY (\`cargoId\`) REFERENCES \`charge\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_387161c661401cd2d7f56e354c1\` FOREIGN KEY (\`jefe_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_ce9398e9352953334d0da91d804\` FOREIGN KEY (\`departamento_id\`) REFERENCES \`department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_590d8507fc5cb83b8bfb3615c7d\` FOREIGN KEY (\`oficina_id\`) REFERENCES \`office\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_590d8507fc5cb83b8bfb3615c7d\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_ce9398e9352953334d0da91d804\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_387161c661401cd2d7f56e354c1\``);
        await queryRunner.query(`ALTER TABLE \`employee-charge\` DROP FOREIGN KEY \`FK_75a904ca0057b5eb88451480359\``);
        await queryRunner.query(`ALTER TABLE \`employee-charge\` DROP FOREIGN KEY \`FK_61cf6982d7c79a151864ea02cb9\``);
        await queryRunner.query(`ALTER TABLE \`form\` DROP FOREIGN KEY \`FK_485d95b2720b2633d9f30f15041\``);
        await queryRunner.query(`ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_2d5e42ee4753ab51ab5b2ca7efd\``);
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_6ad33d2e0e27fe0ad77f1ef1d22\``);
        await queryRunner.query(`DROP INDEX \`REL_590d8507fc5cb83b8bfb3615c7\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_37e80954fd8499125ff14c586d\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_9f839e522b3b8c8c8223cde81d\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`employee-charge\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b509ed72da1da6a9259b64165\` ON \`charge\``);
        await queryRunner.query(`DROP TABLE \`charge\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ad874e7ea36464fe68b94786b\` ON \`office\``);
        await queryRunner.query(`DROP TABLE \`office\``);
        await queryRunner.query(`DROP TABLE \`form\``);
        await queryRunner.query(`DROP TABLE \`activity\``);
        await queryRunner.query(`DROP TABLE \`department\``);
        await queryRunner.query(`DROP INDEX \`IDX_6dc188200327a0a46ece031b22\` ON \`room\``);
        await queryRunner.query(`DROP TABLE \`room\``);
    }

}
