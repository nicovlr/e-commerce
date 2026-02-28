import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1709000000000 implements MigrationInterface {
  name = 'InitialSchema1709000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'varchar',
            default: "'customer'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create index on users.email (already unique, but explicit for clarity)
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
      }),
    );

    // Create index on users.role for filtering
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_role',
        columnNames: ['role'],
      }),
    );

    // Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'int',
            default: 0,
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'categoryId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create FK: products.categoryId -> categories.id
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        name: 'FK_products_categoryId',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes on products
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_categoryId',
        columnNames: ['categoryId'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_isActive',
        columnNames: ['isActive'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_price',
        columnNames: ['price'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_name',
        columnNames: ['name'],
      }),
    );

    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create FK: orders.userId -> users.id
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_orders_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes on orders
    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_orders_createdAt',
        columnNames: ['createdAt'],
      }),
    );

    // Create order_items table
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
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
          },
          {
            name: 'productId',
            type: 'int',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
      }),
      true,
    );

    // Create FK: order_items.orderId -> orders.id
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'FK_order_items_orderId',
        columnNames: ['orderId'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create FK: order_items.productId -> products.id
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'FK_order_items_productId',
        columnNames: ['productId'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes on order_items
    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_order_items_orderId',
        columnNames: ['orderId'],
      }),
    );

    await queryRunner.createIndex(
      'order_items',
      new TableIndex({
        name: 'IDX_order_items_productId',
        columnNames: ['productId'],
      }),
    );

    // Create sales_records table
    await queryRunner.createTable(
      new Table({
        name: 'sales_records',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'productId',
            type: 'int',
          },
          {
            name: 'quantitySold',
            type: 'int',
          },
          {
            name: 'saleDate',
            type: 'date',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create FK: sales_records.productId -> products.id
    await queryRunner.createForeignKey(
      'sales_records',
      new TableForeignKey({
        name: 'FK_sales_records_productId',
        columnNames: ['productId'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes on sales_records
    await queryRunner.createIndex(
      'sales_records',
      new TableIndex({
        name: 'IDX_sales_records_productId',
        columnNames: ['productId'],
      }),
    );

    await queryRunner.createIndex(
      'sales_records',
      new TableIndex({
        name: 'IDX_sales_records_saleDate',
        columnNames: ['saleDate'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to respect foreign key dependencies

    // Drop sales_records (depends on products)
    await queryRunner.dropTable('sales_records', true, true, true);

    // Drop order_items (depends on orders and products)
    await queryRunner.dropTable('order_items', true, true, true);

    // Drop orders (depends on users)
    await queryRunner.dropTable('orders', true, true, true);

    // Drop products (depends on categories)
    await queryRunner.dropTable('products', true, true, true);

    // Drop categories (no FK dependencies)
    await queryRunner.dropTable('categories', true, true, true);

    // Drop users (no FK dependencies)
    await queryRunner.dropTable('users', true, true, true);
  }
}
