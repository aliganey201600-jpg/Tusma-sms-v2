const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const directUrl = process.env.DIRECT_URL.replace("postgres:", "postgres.zgiwwcngmyrnsaysgqog:");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

async function migrate() {
  try {
    console.log("Starting Raw SQL Migration...");

    // 1. Create Enums
    console.log("Creating enums...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "TeacherStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'INACTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Update Teacher Table
    console.log("Updating Teacher table...");
    const columns = [
      { name: 'phone', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'specialization', type: 'TEXT' },
      { name: 'avatarUrl', type: 'TEXT' },
      { name: 'qualification', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'gender', type: '"Gender"' },
      { name: 'status', type: '"TeacherStatus"', default: "'ACTIVE'" }
    ];

    for (const col of columns) {
      try {
        let query = `ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`;
        if (col.default) {
          query += ` DEFAULT ${col.default}`;
        }
        await prisma.$executeRawUnsafe(query);
        console.log(`- Column ${col.name} added/verified.`);
      } catch (e) {
        console.log(`- Column ${col.name} error (maybe already exists): ${e.message}`);
      }
    }

    // 3. Create TeacherResource Table
    console.log("Creating TeacherResource table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TeacherResource" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "fileUrl" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TeacherResource_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "TeacherResource_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    console.log("✅ RAW SQL MIGRATION COMPLETED!");
  } catch (error) {
    console.error("❌ MIGRATION FAILED:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
