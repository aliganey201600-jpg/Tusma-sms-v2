require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing connection...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Total users: ${userCount}`);
  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
