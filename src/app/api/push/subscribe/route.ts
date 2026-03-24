import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Store push subscriptions in DB (stored as JSON in a simple model)
// We'll use a dedicated table via raw upsert for now

export async function POST(request: Request) {
    // Rate limit: 10 subscribe attempts per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(ip, 10);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: "Too many requests", resetIn: rl.resetIn },
            { status: 429 }
        );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { subscription } = body; // PushSubscription object from browser

    if (!subscription?.endpoint) {
        return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    try {
        // Store in Notification table as a log hack, or upsert into dedicated storage
        // We'll use AuditLog table for simplicity (stores JSON)
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "PUSH_SUBSCRIBE",
                details: JSON.stringify(subscription),
                ipAddress: ip,
            }
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { endpoint } = await request.json();

    // Remove the subscription logs for this user
    await prisma.auditLog.deleteMany({
        where: {
            userId: user.id,
            action: "PUSH_SUBSCRIBE",
            details: { contains: endpoint }
        }
    });

    return NextResponse.json({ success: true });
}
