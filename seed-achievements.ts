import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({
    connectionString: process.env.DATABASE_URL,
  })),
  log: ['query', 'error'],
});

async function main() {
  await prisma.achievement.createMany({
    data: [
      {
        code: 'FIRST_TITLE',
        title: 'Первый тайтл',
        description: 'Добавьте свой первый тайтл',
        icon: 'add_circle_outline',
        xpReward: 10,
      },
      {
        code: 'TEN_TITLES',
        title: '10 тайтлов',
        description: 'Добавьте 10 тайтлов',
        icon: 'library_books',
        xpReward: 50,
      },
      {
        code: 'FIFTY_TITLES',
        title: '50 тайтлов',
        description: 'Добавьте 50 тайтлов',
        icon: 'collections_bookmark',
        xpReward: 200,
      },
      {
        code: 'FIRST_COMPLETED',
        title: 'Первый завершённый',
        description: 'Завершите свой первый тайтл',
        icon: 'check_circle_outline',
        xpReward: 25,
      },
      {
        code: 'TEN_COMPLETED',
        title: '10 завершённых',
        description: 'Завершите 10 тайтлов',
        icon: 'verified',
        xpReward: 100,
      },
      {
        code: 'HUNDRED_TITLES',
        title: '100 тайтлов',
        description: 'Добавьте 100 тайтлов',
        icon: 'auto_stories',
        xpReward: 500,
      },
      {
        code: 'ALL_TYPES',
        title: 'Все типы',
        description: 'Добавьте тайтлы всех типов',
        icon: 'category',
        xpReward: 150,
      },
      {
        code: 'HIGH_RATER',
        title: 'Критик',
        description: 'Оцените 10 тайтлов на 9+',
        icon: 'star_outline',
        xpReward: 75,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });