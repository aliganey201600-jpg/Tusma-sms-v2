import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import prisma from "@/lib/prisma"

export const runtime = 'nodejs' // Use nodejs to support standard Prisma client in OG

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return new Response('Missing username', { status: 400 })
    }

    // 1. Fetch Real Data from Database
    // We use raw SQL for speed and to bypass potential client-sync issues
    const students: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, "firstName", "lastName", "totalXp", "level", "currentStreak", "bio" FROM "Student" WHERE username = $1',
      username
    )

    if (!students || students.length === 0) {
      return new Response('Student not found', { status: 404 })
    }

    const student = students[0]
    
    // 2. Calculate Rank Dynamically
    const rankResult: any[] = await prisma.$queryRawUnsafe(
      'SELECT count(*) + 1 as rank FROM "Student" WHERE "totalXp" > $1',
      student.totalXp || 0
    )
    const rank = Number(rankResult[0]?.rank || 1)

    // 3. XP Progress Calculation (based on our level formula)
    const currentLevel = student.level || 1
    const getRequiredXp = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5))
    const requiredXp = getRequiredXp(currentLevel)
    const progress = Math.min(Math.round(((student.totalXp || 0) / requiredXp) * 100), 100)

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a', // slate-900
            backgroundImage: 'radial-gradient(circle at top right, #5b21b6, #0f172a 60%), radial-gradient(circle at bottom left, #1e1b4b, #0f172a 60%)',
            fontFamily: 'sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Logo Branding */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '32px', height: '32px', backgroundColor: '#fbbf24', borderRadius: '8px' }} />
             <span style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-0.05em' }}>TUSMA SCHOOL</span>
          </div>

          <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '800', letterSpacing: '0.1em' }}>GAMER PROFILE CARD</span>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', width: '100%' }}>
             
             {/* Left: Avatar with Ring */}
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ 
                    width: '240px', 
                    height: '240px', 
                    borderRadius: '120px', 
                    border: currentLevel >= 20 ? '8px solid #fbbf24' : '8px solid #4f46e5',
                    boxShadow: currentLevel >= 20 ? '0 0 40px rgba(251, 191, 36, 0.4)' : '0 0 40px rgba(79, 70, 229, 0.3)',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                 }}>
                    <span style={{ fontSize: '100px', fontWeight: 'bold', color: 'white' }}>
                       {student.firstName?.charAt(0).toUpperCase()}
                    </span>
                </div>
                
                {/* Level Badge */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '0', 
                    backgroundColor: '#fbbf24', 
                    color: '#000', 
                    padding: '8px 20px', 
                    borderRadius: '20px', 
                    fontSize: '20px', 
                    fontWeight: '900',
                    border: '4px solid #0f172a'
                }}>
                   LVL {currentLevel}
                </div>
             </div>

             {/* Right: Stats */}
             <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontSize: '48px', fontWeight: '900', color: 'white', lineHeight: '0.9', marginBottom: '8px' }}>
                      {student.firstName} {student.lastName}
                   </span>
                   <span style={{ fontSize: '20px', color: '#818cf8', fontWeight: 'bold' }}>
                      @{username}
                   </span>
                </div>

                <div style={{ display: 'flex', gap: '32px', marginTop: '10px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900', letterSpacing: '0.1em' }}>GLOBAL RANK</span>
                      <span style={{ color: '#fbbf24', fontSize: '40px', fontWeight: '900' }}>#{rank}</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900', letterSpacing: '0.1em' }}>TOTAL XP</span>
                      <span style={{ color: 'white', fontSize: '40px', fontWeight: '900' }}>{student.totalXp}</span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900', letterSpacing: '0.1em' }}>STREAK</span>
                      <span style={{ color: '#f97316', fontSize: '40px', fontWeight: '900' }}>{student.currentStreak} 🔥</span>
                   </div>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '900' }}>SUBJECT MASTERY</span>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: '900' }}>{progress}%</span>
                   </div>
                   <div style={{ width: '100%', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '8px' }} />
                   </div>
                </div>
             </div>
          </div>

          {/* Footer Quote */}
          <div style={{ position: 'absolute', bottom: '40px', left: '40px', fontSize: '14px', color: '#64748b', fontWeight: '500', fontStyle: 'italic' }}>
             "Consistency is the key to mastery. Excellence is a habit."
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
