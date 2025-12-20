import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEndDateAndTimestamps1734662000000 implements MigrationInterface {
  name = 'AddEndDateAndTimestamps1734662000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add endDate column to routine table
    await queryRunner.query(
      `ALTER TABLE \`routine\` ADD \`endDate\` date NULL`
    );

    // Rename date column to completedAt and change type to timestamp in task_completion
    await queryRunner.query(
      `ALTER TABLE \`task_completion\` CHANGE \`date\` \`completedAt\` timestamp NOT NULL`
    );

    // Add createdAt and updatedAt columns to task_completion
    await queryRunner.query(
      `ALTER TABLE \`task_completion\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );

    await queryRunner.query(
      `ALTER TABLE \`task_completion\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove updatedAt and createdAt columns
    await queryRunner.query(
      `ALTER TABLE \`task_completion\` DROP COLUMN \`updatedAt\``
    );

    await queryRunner.query(
      `ALTER TABLE \`task_completion\` DROP COLUMN \`createdAt\``
    );

    // Rename completedAt back to date and change type
    await queryRunner.query(
      `ALTER TABLE \`task_completion\` CHANGE \`completedAt\` \`date\` date NOT NULL`
    );

    // Remove endDate column from routine
    await queryRunner.query(
      `ALTER TABLE \`routine\` DROP COLUMN \`endDate\``
    );
  }
}
