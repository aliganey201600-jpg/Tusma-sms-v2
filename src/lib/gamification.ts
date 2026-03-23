"use server"

import prisma from "@/lib/prisma"

/**
 * GAMIFICATION ENGINE v2.0
 * Features: Points, Dynamic Leveling, Economy (Shields), Classroom Battles (Squads)
 */

/**
 * 1. Nidaamka Dhibcaha (The Points System)
 * Awards XP to students and handles dynamic leveling.
 * 
 * RequiredXP = 100 * (currentLevel ^ 1.5)
 */
export async function awardPoints(studentId: string, points: number, reason: string, relatedId?: string) {
  try {
    // 1. Fetch current status using Raw SQL to bypass outdated Prisma Client
    const students: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, "totalXp", "level", "firstName", "classId" FROM "Student" WHERE id = $1',
      studentId
    )

    if (!students || students.length === 0) return { success: false, error: "Student not found" }
    const student = students[0]

    const oldXp = student.totalXp || 0
    const newXp = oldXp + points
    let currentLevel = student.level || 1

    // Level up logic (Dynamic Scaling)
    const getRequiredXp = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5))
    
    let nextLevelXp = getRequiredXp(currentLevel)
    while (newXp >= nextLevelXp) {
      currentLevel++
      nextLevelXp = getRequiredXp(currentLevel)
    }

    // 2. Update Student using Raw SQL
    await prisma.$executeRawUnsafe(
      'UPDATE "Student" SET "totalXp" = $1, "level" = $2 WHERE id = $3',
      newXp, currentLevel, studentId
    )

    // 3. Record Transaction using Raw SQL
    try {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "PointTransaction" (id, "studentId", points, reason, "relatedId", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())',
        crypto.randomUUID(), studentId, points, reason, relatedId || null
      )
    } catch (e) {
      console.error("PointTransaction log failed:", e)
      // We don't return false here, as the XP was already awarded
    }

    console.log(`[XP_REWARD] ${student.firstName} earned ${points} XP! (Total: ${newXp})`)

    // Squad Live Notification (Simulation logic - In a real app we'd use WebSockets/Pusher)
    if (points >= 50 && student.classId) {
       console.log(`[SQUAD_ALERT] Student ${student.firstName} earned ${points} XP for Class ${student.classId}! 🔥`)
    }

    return { 
      success: true, 
      leveledUp: currentLevel > student.level,
      newLevel: currentLevel 
    }
  } catch (error) {
    console.error("Failed to award points:", error)
    return { success: false }
  }
}

/**
 * 2. XP-to-Reward Logic (Economy)
 * Allows students to spend XP on Streak Shields.
 */
export async function redeemXpForShield(studentId: string) {
  const SHIELD_COST = 250
  
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      // @ts-ignore
      select: { totalXp: true, streakShields: true }
    })

    if (!student) return { success: false, error: "Student not found" }
    // @ts-ignore
    if (student.totalXp < SHIELD_COST) return { success: false, error: "Not enough XP" }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        totalXp: { decrement: SHIELD_COST },
        // @ts-ignore
        streakShields: { increment: 1 }
      }
    })

    // Log the transaction
    await prisma.pointTransaction.create({
      data: {
        studentId,
        points: -SHIELD_COST,
        reason: "REDEEM_SHIELD"
      }
    })

    return { success: true }
  } catch (error) {
    console.error("XP Redemption error:", error)
    return { success: false }
  }
}

/**
 * 3. Nidaamka Streaks (Persistence)
 * Refined logic with Streak Shield support.
 */
export async function processDailyLogin(studentId: string) {
  const now = new Date();
  
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      // @ts-ignore
      select: { lastLoginDate: true, currentStreak: true, longestStreak: true, streakShields: true }
    });

    if (!student) return;

    // @ts-ignore
    const lastLogin = student.lastLoginDate;
    // @ts-ignore
    let currentStreak = student.currentStreak || 0;
    // @ts-ignore
    let longestStreak = student.longestStreak || 0;
    // @ts-ignore
    let shields = student.streakShields || 0;
    
    let pointsToAward = 0;

    if (lastLogin) {
      const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

      if (diffInHours >= 24 && diffInHours < 48) {
        // Perfect timing (between 24-48 hours since last login)
        currentStreak += 1;
        pointsToAward = 10;
      } else if (diffInHours >= 48) {
        // Streak Broken! Check for Shields
        if (shields > 0) {
          shields -= 1;
          currentStreak += 1; // Shield consumed, streak saved
          pointsToAward = 10;
          // TODO: Send warning notification ("Streak Shield consumed!")
        } else {
          currentStreak = 1; // Streak reset
          pointsToAward = 10;
        }
      }
      // If < 24 hrs, it implies multiple logins the same day. Do nothing.
    } else {
      // First time login ever
      currentStreak = 1;
      pointsToAward = 10;
    }

    // Update longest streak memory
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        // @ts-ignore
        currentStreak,
        // @ts-ignore
        longestStreak,
        // @ts-ignore
        streakShields: shields,
        // @ts-ignore
        lastLoginDate: now,
      },
    });

    if (pointsToAward > 0) {
      await awardPoints(studentId, pointsToAward, "DAILY_CHECKIN");
    }

    // Persistence Badge Check (30 days)
    if (currentStreak === 30) {
      await unlockBadge(studentId, "Persistence");
    }
  } catch (error) {
    console.error("Streak processing error:", error)
  }
}

/**
 * 4. Billadaha (Badge Engine)
 */
export async function unlockBadge(studentId: string, badgeName: string) {
  // @ts-ignore
  const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) return;

  // @ts-ignore
  const existing = await prisma.studentBadge.findUnique({
    where: { studentId_badgeId: { studentId, badgeId: badge.id } },
  });

  if (!existing) {
    // @ts-ignore
    await prisma.studentBadge.create({
      data: { studentId, badgeId: badge.id },
    });

    if (badge.xpReward > 0) {
      await awardPoints(studentId, badge.xpReward, `BADGE_UNLOCK_${badgeName.replace(/\s+/g, '_').toUpperCase()}`);
    }
  }
}

/**
 * 5. handleQuizCompletion
 */
export async function handleQuizCompletion(studentId: string, quizId: string, score: number, timeSpentSec: number) {
  if (score >= 80) {
    await awardPoints(studentId, 100, "QUIZ_PASSED", quizId);
  } else {
    await awardPoints(studentId, 25, "QUIZ_COMPLETED", quizId);
  }

  if (score === 100) {
    await unlockBadge(studentId, "Perfect Score");
  }

  if (timeSpentSec < 120 && score >= 80) {
    await unlockBadge(studentId, "Speed Demon");
  }
}

/**
 * 6. getTopStudents
 */
export async function getTopStudents(limit: number = 10) {
  return await prisma.student.findMany({
    orderBy: {
      totalXp: 'desc',
    },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      totalXp: true,
      // @ts-ignore
      level: true,
      badges: {
        include: { badge: true }
      }
    }
  });
}

/**
 * Squad Battles: Aggregates and averages student XP per class
 */
export async function getClassroomRankings() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          select: {
            // @ts-ignore
            totalXp: true,
            id: true
          }
        }
      }
    })

    const rankings = classes.map(cls => {
      const studentCount = cls.students.length
      // @ts-ignore
      const totalClassXp = cls.students.reduce((sum, s) => sum + (s.totalXp || 0), 0)
      const averageXp = studentCount > 0 ? (totalClassXp / studentCount) : 0

      return {
        id: cls.id,
        name: cls.name,
        totalPoints: totalClassXp,
        averagePoints: Math.round(averageXp),
        studentCount
      }
    })

    return rankings.sort((a, b) => b.averagePoints - a.averagePoints)
  } catch (error) {
    console.error("Classroom ranking error:", error)
    return []
  }
}

/**
 * Rewards students of the top class with a temporary "Victory Badge"
 */
export async function rewardTopClass() {
  try {
    const rankings = await getClassroomRankings()
    if (rankings.length === 0) return

    const topClass = rankings[0]
    
    // @ts-ignore
    let victoryBadge = await prisma.badge.findFirst({
      where: { name: "Victory Badge" }
    })

    if (!victoryBadge) {
      // @ts-ignore
      victoryBadge = await prisma.badge.create({
        data: {
          name: "Victory Badge",
          description: "Top Squad of the Week! 🥇",
          xpReward: 100
        }
      })
    }

    const students = await prisma.student.findMany({
      where: { classId: topClass.id }
    })

    for (const student of students) {
      // @ts-ignore
      const alreadyHas = await prisma.studentBadge.findUnique({
        where: {
          studentId_badgeId: {
            studentId: student.id,
            // @ts-ignore
            badgeId: victoryBadge.id
          }
        }
      })

      if (!alreadyHas) {
        // @ts-ignore
        await prisma.studentBadge.create({
          data: {
            studentId: student.id,
            // @ts-ignore
            badgeId: victoryBadge.id
          }
        })
        await awardPoints(student.id, 100, "SQUAD_VICTORY")
      }
    }

    return { success: true, topClass: topClass.name }
  } catch (error) {
    console.error("Squad reward error:", error)
    return { success: false }
  }
}
