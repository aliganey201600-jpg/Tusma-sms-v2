import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"

export async function GET() {
  console.log('🚀 DB Fix API v4 (Adding hasSharedRank)...')
  const results: string[] = []
  
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Student' AND column_name='hasSharedRank') THEN
          ALTER TABLE "Student" ADD COLUMN "hasSharedRank" BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);
    results.push('Col hasSharedRank added/verified');

    return NextResponse.json({ success: true, steps: results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, steps: results }, { status: 500 })
  }
}
