import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()
const prisma = new PrismaClient()

async function main() {
  const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" });
  const todayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: todayStart }, status: "ABSENT" },
    include: { student: true }
  })
  console.log("Date:", dateStr)
  console.log("TodayStart (UTC):", todayStart.toISOString())
  console.log("Found Count:", attendances.length)
  attendances.forEach(a => {
      console.log(`- ${a.student.firstName} ${a.student.lastName} (ID: ${a.student.studentId}) [Date: ${a.date.toISOString()}]`)
  })
}
main().catch(console.error).finally(() => prisma.$disconnect())
