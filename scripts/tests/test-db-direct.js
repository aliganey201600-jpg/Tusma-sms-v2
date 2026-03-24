const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:635110Liiali@db.zgiwwcngmyrnsaysgqog.supabase.co:5432/postgres"
    }
  }
})

async function main() {
  try {
    console.log('Attempting to connect to DIRECT database...')
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('Success:', result)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
