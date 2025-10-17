"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPhone1760480434022 = void 0;
class AddPhone1760480434022 {
    name = 'AddPhone1760480434022';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`phone\` varchar(20) NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`phone\``);
    }
}
exports.AddPhone1760480434022 = AddPhone1760480434022;
//# sourceMappingURL=1760480434022-addPhone.js.map