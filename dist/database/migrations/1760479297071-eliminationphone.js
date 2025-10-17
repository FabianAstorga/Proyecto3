"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eliminationphone1760479297071 = void 0;
class Eliminationphone1760479297071 {
    name = 'Eliminationphone1760479297071';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` varchar(20) NOT NULL`);
    }
}
exports.Eliminationphone1760479297071 = Eliminationphone1760479297071;
//# sourceMappingURL=1760479297071-eliminationphone.js.map