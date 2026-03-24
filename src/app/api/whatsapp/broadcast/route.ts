import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

const WHATSAPP_GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || "http://localhost:3001/send-message";

async function sendWhatsApp(phone: string, message: string) {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
        cleanPhone = "252" + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9) {
        cleanPhone = "252" + cleanPhone;
    }
    
    try {
        const res = await fetch(WHATSAPP_GATEWAY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: cleanPhone, message }),
            signal: AbortSignal.timeout(10000),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    // Auth Check — must be ADMIN or SUPER_ADMIN
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, target } = await request.json();
    // target: "ALL_PARENTS" | "ALL_TEACHERS" | "SPECIFIC" (future)

    if (!message || !target) {
        return NextResponse.json({ error: "message and target are required" }, { status: 400 });
    }

    const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" });
    let sent = 0;
    let failed = 0;

    if (target === "ALL_PARENTS" || target === "ALL") {
        const students = await prisma.student.findMany({
            where: { guardianPhone: { not: null } },
            select: { guardianPhone: true, guardianName: true }
        });
        
        // Remove duplicates so parents with multiple kids only get 1 message
        const distinctParents = new Map<string, string>();
        for (const s of students) {
            if (s.guardianPhone) distinctParents.set(s.guardianPhone, s.guardianName || "Waalid");
        }

        for (const [phone, name] of distinctParents.entries()) {
            const fullMsg = `*Tusmo School — Ogeysiis Guud*\n\nMudan/Marwo ${name},\n\n${message}\n\n_${dateStr}_`;
            const ok = await sendWhatsApp(phone, fullMsg);
            ok ? sent++ : failed++;
        }
    }

    if (target === "ALL_TEACHERS" || target === "ALL") {
        const teachers = await prisma.teacher.findMany({
            where: { phone: { not: null } },
        });
        for (const t of teachers) {
            if (!t.phone) continue;
            const fullMsg = `*Tusmo School — Ogeysiis*\n\nMacalin ${t.firstName},\n\n${message}\n\n_${dateStr}_`;
            const ok = await sendWhatsApp(t.phone, fullMsg);
            ok ? sent++ : failed++;
        }
    }

    return NextResponse.json({ success: true, sent, failed, target });
}
