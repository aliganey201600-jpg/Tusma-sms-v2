const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    include: {
      user: true
    }
  });
  console.log(JSON.stringify(student, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
