const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
console.log('.env content:', fs.readFileSync('.env', 'utf8'))
require('dotenv').config()
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Attempting to connect to database...')
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    console.log('Success:', result)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
