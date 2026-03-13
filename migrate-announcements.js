const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Use direct URL for stable connection
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
    console.log("Starting Announcement Migration...");

    // 1. Create Enum
    console.log("Creating AnnouncementPriority enum...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create FacultyAnnouncement Table
    console.log("Creating FacultyAnnouncement table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "FacultyAnnouncement" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "priority" "AnnouncementPriority" NOT NULL DEFAULT 'LOW',
        "authorId" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "FacultyAnnouncement_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "FacultyAnnouncement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    console.log("✅ ANNOUNCEMENT MIGRATION COMPLETED!");
  } catch (error) {
    console.error("❌ MIGRATION FAILED:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
