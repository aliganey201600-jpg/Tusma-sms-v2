const { PrismaClient } = require('@prisma/client')

// Using the pooler IP directly
const url = "postgresql://postgres.zgiwwcngmyrnsaysgqog:635110Liiali@13.60.102.132:6543/postgres?pgbouncer=true"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url
    }
  }
})

async function main() {
  try {
    console.log('Attempting to connect to database using IP...')
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('Success:', result)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
