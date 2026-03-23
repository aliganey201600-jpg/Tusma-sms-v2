import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * STRATEGY: WhatsApp "Urgency" Alerts
 * This endpoint should be called by a Cron Job every hour.
 * It identifies students who are 20-30 hours away from their last login.
 */

export async function GET(req: Request) {
  // Security: In production, check for a secret CRON_SECRET header
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // 20 hours ago
    const twentyHoursAgo = new Date(now.getTime() - (20 * 60 * 60 * 1000));
    // 21 hours ago (to target a specific window)
    const twentyOneHoursAgo = new Date(now.getTime() - (21 * 60 * 60 * 1000));

    const studentsAtRisk = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        currentStreak: { gt: 0 },
        lastLoginDate: {
          lte: twentyHoursAgo,
          gte: twentyOneHoursAgo
        }
      },
      select: {
        id: true,
        firstName: true,
        phone: true,
        currentStreak: true
      }
    });

    const messagesSent = [];

    for (const student of studentsAtRisk) {
      if (student.phone) {
        // SIMULATION: Calling the WhatsApp Gateway
        const message = `Asc ${student.firstName}, streak-gaaga 🔥 wuxuu ku dhow yahay inuu dhuunto! Kaliya hal cashar akhri hadda si aad u badbaadiso. Hadda haysato ${student.currentStreak} maalmood!`;
        
        console.log(`[WHATSAPP ALERT] Sending to ${student.phone}: ${message}`);
        
        // Example: await fetch('https://api.tusmo-gateway.com/send', { ... })
        messagesSent.push(student.id);
      }
    }

    return NextResponse.json({
      success: true,
      found: studentsAtRisk.length,
      notified: messagesSent.length
    });

  } catch (error: any) {
    console.error("Streak alert cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
