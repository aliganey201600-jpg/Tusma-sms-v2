const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  console.log("Checking registered users in database...");
  try {
    const users = await prisma.$queryRawUnsafe(`SELECT email, role FROM "User" LIMIT 10`);
    console.log("Registered Users:");
    console.table(users);
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
