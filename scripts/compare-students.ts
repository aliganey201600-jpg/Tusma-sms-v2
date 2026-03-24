
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const students = await prisma.student.findMany({
    where: {
      OR: [
        { firstName: { contains: 'Liban', mode: 'insensitive' } },
        { lastName: { contains: 'Liban', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      userId: true,
      totalXp: true
    }
  })
  console.log(JSON.stringify(students, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
