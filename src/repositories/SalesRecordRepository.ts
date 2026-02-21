import { Repository, Between } from 'typeorm';

import { SalesRecord } from '../models/SalesRecord';

import { BaseRepository } from './BaseRepository';

export class SalesRecordRepository extends BaseRepository<SalesRecord> {
  constructor(repository: Repository<SalesRecord>) {
    super(repository);
  }

  async findByProductId(productId: number): Promise<SalesRecord[]> {
    return this.repository.find({
      where: { productId },
      order: { saleDate: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SalesRecord[]> {
    return this.repository.find({
      where: {
        saleDate: Between(startDate, endDate),
      },
      relations: ['product'],
      order: { saleDate: 'ASC' },
    });
  }

  async getProductSalesSummary(
    productId: number,
  ): Promise<{ totalSold: number; avgDaily: number }> {
    const result = await this.repository
      .createQueryBuilder('sale')
      .select('SUM(sale.quantitySold)', 'totalSold')
      .addSelect('AVG(sale.quantitySold)', 'avgDaily')
      .where('sale.productId = :productId', { productId })
      .getRawOne();

    return {
      totalSold: parseFloat(result?.totalSold || '0'),
      avgDaily: parseFloat(result?.avgDaily || '0'),
    };
  }
}
