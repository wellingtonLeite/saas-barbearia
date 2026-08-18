import { PrismaClient } from './src/generated/prisma/client/index.js'; const prisma = new PrismaClient(); async function main() { console.log(await prisma.plan.findMany()); } main().finally(() = 
