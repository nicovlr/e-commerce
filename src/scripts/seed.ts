import 'reflect-metadata';
import bcrypt from 'bcryptjs';

import { AppDataSource } from '../config/database';
import { Category } from '../models/Category';
import { User } from '../models/User';
import { UserRole } from '../types';

const CATEGORIES = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Apparel and fashion items' },
  { name: 'Books', description: 'Books and publications' },
  { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
  { name: 'Sports', description: 'Sports equipment and accessories' },
];

const ADMIN_USER = {
  email: 'admin@shopsmart.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: UserRole.ADMIN,
};

async function seed(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');

    // Seed categories
    const categoryRepo = AppDataSource.getRepository(Category);
    let categoriesSeeded = 0;
    let categoriesSkipped = 0;

    for (const categoryData of CATEGORIES) {
      const existing = await categoryRepo.findOne({ where: { name: categoryData.name } });
      if (existing) {
        categoriesSkipped++;
        console.log(`  Category "${categoryData.name}" already exists, skipping.`);
      } else {
        const category = categoryRepo.create(categoryData);
        await categoryRepo.save(category);
        categoriesSeeded++;
        console.log(`  Category "${categoryData.name}" created.`);
      }
    }

    console.log(
      `Categories: ${categoriesSeeded} created, ${categoriesSkipped} already existed.\n`,
    );

    // Seed admin user
    const userRepo = AppDataSource.getRepository(User);
    const existingAdmin = await userRepo.findOne({ where: { email: ADMIN_USER.email } });

    if (existingAdmin) {
      console.log(`  Admin user "${ADMIN_USER.email}" already exists, skipping.`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12);
      const admin = userRepo.create({
        email: ADMIN_USER.email,
        password: hashedPassword,
        firstName: ADMIN_USER.firstName,
        lastName: ADMIN_USER.lastName,
        role: ADMIN_USER.role,
      });
      await userRepo.save(admin);
      console.log(`  Admin user "${ADMIN_USER.email}" created.`);
    }

    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

void seed();
