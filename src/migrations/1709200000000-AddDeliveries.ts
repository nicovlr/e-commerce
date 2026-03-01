import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddDeliveries1709200000000 implements MigrationInterface {
  name = 'AddDeliveries1709200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deliveries',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'orderId',
            type: 'int',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'preparing'",
          },
          {
            name: 'trackingNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'carrier',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'estimatedDeliveryDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'shippedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deliveredAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'deliveries',
      new TableForeignKey({
        name: 'FK_deliveries_orderId',
        columnNames: ['orderId'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_trackingNumber',
        columnNames: ['trackingNumber'],
        where: '"trackingNumber" IS NOT NULL',
      }),
    );

    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_status');
    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_trackingNumber');
    await queryRunner.dropForeignKey('deliveries', 'FK_deliveries_orderId');
    await queryRunner.dropTable('deliveries');
  }
}
