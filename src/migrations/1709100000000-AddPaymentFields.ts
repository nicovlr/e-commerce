import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddPaymentFields1709100000000 implements MigrationInterface {
  name = 'AddPaymentFields1709100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'stripePaymentIntentId',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_stripePaymentIntentId',
        columnNames: ['stripePaymentIntentId'],
        isUnique: true,
        where: '"stripePaymentIntentId" IS NOT NULL',
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'paymentStatus',
        type: 'varchar',
        default: "'unpaid'",
      }),
    );

    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'shippingAddress',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'shippingAddress');
    await queryRunner.dropColumn('orders', 'paymentStatus');
    await queryRunner.dropIndex('orders', 'IDX_orders_stripePaymentIntentId');
    await queryRunner.dropColumn('orders', 'stripePaymentIntentId');
  }
}
