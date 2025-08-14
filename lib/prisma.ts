import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          'mongodb+srv://awahidsafhadi:ntcqag0nOMsosjNs@cluster0.chqdwnp.mongodb.net/montly',
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
