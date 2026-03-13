const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

async function migrate() {
  try {
    console.log("Adding columns to Course table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "code" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "category" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "credits" TEXT`);
    console.log("✅ Success");
  } catch (e) {
    console.error("Migration failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
