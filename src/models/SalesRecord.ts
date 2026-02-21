import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from './Product';

@Entity('sales_records')
export class SalesRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.salesRecords)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column()
  quantitySold: number;

  @Column({ type: 'date' })
  saleDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
