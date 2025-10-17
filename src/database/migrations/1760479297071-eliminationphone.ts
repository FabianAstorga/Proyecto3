import { MigrationInterface, QueryRunner } from "typeorm";

export class Eliminationphone1760479297071 implements MigrationInterface {
    name = 'Eliminationphone1760479297071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` varchar(20) NOT NULL`);
    }

}
