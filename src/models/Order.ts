import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { OrderStatus, PaymentStatus, ShippingAddress } from '../types';

import { OrderItem } from './OrderItem';
import { User } from './User';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', nullable: true, unique: true })
  stripePaymentIntentId: string | null;

  @Column({ type: 'varchar', default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: ShippingAddress | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
