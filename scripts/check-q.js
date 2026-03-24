const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const questions = await prisma.quizQuestion.findMany({
      orderBy: { id: 'desc' },
      take: 1
    });
    console.log('Last Question:', JSON.stringify(questions[0], null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
