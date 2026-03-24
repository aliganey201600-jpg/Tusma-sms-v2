import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()
const prisma = new PrismaClient()

async function main() {
  const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" });
  const todayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const student = await prisma.attendance.findFirst({
    where: { date: { gte: todayStart }, status: "ABSENT" },
    include: { student: true }
  })
  console.log("Date:", dateStr)
  console.log("TodayStart:", todayStart.toISOString())
  console.log("Found Student:", JSON.stringify(student, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
