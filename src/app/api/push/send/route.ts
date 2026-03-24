import { NextResponse } from "next/server";
import webpush from "web-push";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

webpush.setVapidDetails(
    "mailto:info@tusmaschool.edu.so",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
    // Rate limit: 5 broadcast push per minute (admin only)
    const ip = getClientIp(request);
    const rl = rateLimit(`push_send_${ip}`, 5);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Rate limit exceeded", resetIn: rl.resetIn },
            { status: 429 }
        );
    }

    // Auth Check — ADMIN or SUPER_ADMIN
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url = "/dashboard" } = await request.json();
    if (!title || !body) {
        return NextResponse.json({ error: "title and body required" }, { status: 400 });
    }

    // Fetch all stored push subscriptions from AuditLog
    const logs = await prisma.auditLog.findMany({
        where: { action: "PUSH_SUBSCRIBE" },
        select: { userId: true, details: true },
    });

    const payload = JSON.stringify({
        title,
        body,
        url,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        timestamp: Date.now(),
    });

    let sent = 0;
    let failed = 0;
    const dead: string[] = [];

    for (const log of logs) {
        if (!log.details) continue;
        try {
            const sub = JSON.parse(log.details);
            await webpush.sendNotification(sub, payload);
            sent++;
        } catch (err: any) {
            failed++;
            // If subscription is gone (410 Gone), mark for cleanup
            if (err.statusCode === 410 && log.userId) {
                dead.push(log.userId);
            }
        }
    }

    // Cleanup dead subscriptions
    if (dead.length > 0)
        await prisma.auditLog.deleteMany({
            where: { userId: { in: dead.filter((id): id is string => id !== null) as string[] }, action: "PUSH_SUBSCRIBE" }
        });

    return NextResponse.json({ success: true, sent, failed, cleaned: dead.length });
}
