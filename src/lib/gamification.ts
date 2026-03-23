import prisma from "@/lib/prisma";

// ==========================================
// TUSMA GAMIFICATION ENGINE - BACKEND LOGIC
// ==========================================

/**
 * 1. Nidaamka Dhibcaha (Points Ledger)
 * Applies designated points for an action and triggers Level Up checks.
 */
export async function awardPoints(studentId: string, points: number, reason: string, relatedId?: string) {
  // Save transaction to DB
  // @ts-ignore
  await prisma.pointTransaction.create({
    data: { studentId, points, reason, relatedId },
  });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  const currentTotalXp = student.totalXp + points;
  
  // Dynamic Leveling Formula: RequiredXP = 100 * (currentLevel ^ 1.5)
  // We calculate the level by checking if the total XP exceeds the cumulative sum
  let calculatedLevel = 1;
  let remainingXp = currentTotalXp;
  
  while (true) {
    const xpNeededForNextLevel = Math.floor(100 * Math.pow(calculatedLevel, 1.5));
    if (remainingXp >= xpNeededForNextLevel) {
      remainingXp -= xpNeededForNextLevel;
      calculatedLevel++;
    } else {
      break;
    }
  }

  await prisma.student.update({
    where: { id: studentId },
    data: {
      totalXp: currentTotalXp,
      // @ts-ignore
      level: calculatedLevel > student.level ? calculatedLevel : student.level,
    },
  });

  // @ts-ignore
  if (calculatedLevel > student.level) {
    // TODO: Trigger Notification ("Congratulations on reaching Level X! 🎉")
  }
}

/**
 * 1b. XP Economy: Redeem XP for Streak Shields
 * Allows students to spend their hard-earned XP to protect their streaks.
 * Cost: 250 XP per Shield
 */
export async function redeemXpForShield(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    // @ts-ignore
    select: { id: true, totalXp: true, streakShields: true, level: true }
  });

  if (!student) return { success: false, error: "Student not found" };

  const SHIELD_COST = 250;

  if (student.totalXp < SHIELD_COST) {
    return { success: false, error: "Not enough XP. Keep learning to earn more!" };
  }

  // Deduct XP and add Shield
  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      totalXp: { decrement: SHIELD_COST },
      // @ts-ignore
      streakShields: { increment: 1 }
    }
  });

  // Log the transaction
  // @ts-ignore
  await prisma.pointTransaction.create({
    data: {
      studentId,
      points: -SHIELD_COST,
      reason: "REDEEM_STREAK_SHIELD",
    }
  });

  return { 
    success: true, 
    newXp: updatedStudent.totalXp, 
    // @ts-ignore
    newShields: updatedStudent.streakShields 
  };
}

/**
 * 2. Daily Check-in & Streak Logic
 * Called automatically every time a student logs in.
 */
export async function processDailyLogin(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  const now = new Date();
  const lastLogin = student.lastLoginDate;

  let currentStreak = student.currentStreak;
  let longestStreak = student.longestStreak;
  let shields = student.streakShields;

  let pointsToAward = 0;

  if (lastLogin) {
    const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin <= 48) {
      // Safe zone -> User maintained streak
      currentStreak += 1;
      pointsToAward = 10; // +10 daily check-in points
    } 
    else if (hoursSinceLastLogin > 48) {
      // Streak broken. Check if they have a 'Streak Shield'
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
      currentStreak,
      longestStreak,
      streakShields: shields,
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
}

/**
 * 3. Billadaha (Badge Engine)
 * Service that unlocks achievements dynamically based on student activity limits.
 */
export async function unlockBadge(studentId: string, badgeName: string) {
  const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) return; // Badge not configured in DB

  // Avoid duplicates
  const existing = await prisma.studentBadge.findUnique({
    where: { studentId_badgeId: { studentId, badgeId: badge.id } },
  });

  if (!existing) {
    await prisma.studentBadge.create({
      data: { studentId, badgeId: badge.id },
    });

    if (badge.xpReward > 0) {
      await awardPoints(studentId, badge.xpReward, `BADGE_UNLOCK_${badgeName.replace(/\s+/g, '_').toUpperCase()}`);
    }

    // TODO: Send Push Notification ("You unlocked a new Badge! 🏆")
  }
}

/**
 * 4. Helper Event: "Speed Demon" Or "Perfect Score" Quiz checks
 * Should be called whenever a Quiz is Completed.
 */
export async function handleQuizCompletion(studentId: string, quizId: string, score: number, timeSpentSec: number) {
  // Award standard points
  if (score >= 80) {
    await awardPoints(studentId, 100, "QUIZ_PASSED", quizId);
  } else {
    // Attempt points
    await awardPoints(studentId, 25, "QUIZ_COMPLETED", quizId);
  }

  // Check Perfect Score badge
  if (score === 100) {
    await unlockBadge(studentId, "Perfect Score");
  }

  // Check Speed Demon badge (e.g. less than 2 mins)
  if (timeSpentSec < 120 && score >= 80) {
    await unlockBadge(studentId, "Speed Demon");
  }
}

/**
 * 5. Tartanka (Social Leaderboard Fetcher)
 * Fetch top students (weekly or globally)
 */
export async function getTopStudents(limit: number = 10) {
  return await prisma.student.findMany({
    orderBy: {
      totalXp: 'desc', // Top XP
    },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      totalXp: true,
      level: true,
      badges: {
        include: { badge: true }
      }
    }
  });

  // Additional logic can be added to filter by "this week's XP" by reading the PointTransaction table history.
}
