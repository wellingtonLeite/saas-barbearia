import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_FVB8jirt1JwG@ep-patient-wind-ay4dddoq-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;