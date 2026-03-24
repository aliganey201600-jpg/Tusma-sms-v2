const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Attempting to create a local Admin user in Database...");
  const email = "admin@tusmo.com";
  const now = new Date();
  const userId = crypto.randomUUID(); // This matches a fake Supabase ID for now

  try {
    // Check if user exists
    const existing = await prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = $1`, email);
    
    if (existing && existing.length > 0) {
      console.log("Admin user already exists in Database.");
    } else {
      // Create User via Raw SQL to bypass any type issues
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3::"Role", $4, $5)`,
        userId, email, "ADMIN", now, now
      );
      console.log("Admin user created successfully in Database!");
      console.log("NOTE: You still need to Sign Up with this email on the UI to create the Auth record.");
    }
  } catch (error) {
    console.error("System Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
