const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEnumValue() {
  try {
    // Check if it already exists first (to avoid error)
    const enums = await prisma.$queryRaw`SELECT enum_range(NULL::"StudentStatus")`;
    const enumValues = enums[0].enum_range;
    
    if (enumValues.includes('GRADUATED')) {
      console.log("'GRADUATED' already exists in StudentStatus enum.");
      return;
    }

    console.log("Adding 'GRADUATED' to StudentStatus enum...");
    // Postgres doesn't allow ALTER TYPE ADD VALUE inside a transaction block in some versions,
    // but executeRaw usually works.
    await prisma.$executeRawUnsafe('ALTER TYPE "StudentStatus" ADD VALUE \'GRADUATED\'');
    console.log("Successfully added 'GRADUATED' to StudentStatus enum!");
    
    // Verify again
    const updatedEnums = await prisma.$queryRaw`SELECT enum_range(NULL::"StudentStatus")`;
    console.log("Updated Database StudentStatus Enum Values:", updatedEnums);

  } catch (error) {
    console.error("Error adding enum value:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addEnumValue();
