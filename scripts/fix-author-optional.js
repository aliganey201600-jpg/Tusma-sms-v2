const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const directUrl = process.env.DIRECT_URL.replace("postgres:", "postgres.zgiwwcngmyrnsaysgqog:");

const prisma = new PrismaClient({
  datasources: { db: { url: directUrl } },
});

async function fix() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "FacultyAnnouncement" ALTER COLUMN "authorId" DROP NOT NULL`);
    console.log("✅ authorId is now optional");
  } catch (e) {
    console.log("Column may already be optional:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
