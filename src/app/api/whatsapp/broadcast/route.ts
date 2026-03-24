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

    const { message, target, recipients: providedRecipients } = await request.json();
    const dateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" });

    // ── Mode 1: Fetch Recipients Only ────────────────────────
    if (target && !message) {
        const recipients: { name: string; phone: string }[] = [];
        if (target === "ALL_PARENTS" || target === "ALL") {
            const students = await prisma.student.findMany({
                where: { guardianPhone: { not: null } },
                select: { guardianPhone: true, guardianName: true }
            });
            const distinct = new Map<string, string>();
            for (const s of students) if (s.guardianPhone) distinct.set(s.guardianPhone, s.guardianName || "Waalid");
            for (const [phone, name] of distinct.entries()) recipients.push({ name, phone });
        }
        if (target === "ALL_TEACHERS" || target === "ALL") {
            const teachers = await prisma.teacher.findMany({ where: { phone: { not: null } } });
            for (const t of teachers) if (t.phone) recipients.push({ name: t.firstName, phone: t.phone });
        }
        return NextResponse.json({ success: true, recipients });
    }

    // ── Mode 2: Send Single Message (Or loop) ─────────────────
    if (message && providedRecipients) {
        let sent = 0;
        let failed = 0;
        const failedRecipients: any[] = [];

        for (const r of providedRecipients) {
            const isTeacher = r.name.startsWith("Macalin"); // simplistic check
            const fullMsg = isTeacher 
                ? `*Tusmo School — Ogeysiis*\n\nMacalin ${r.name},\n\n${message}\n\n_${dateStr}_`
                : `*Tusmo School — Ogeysiis Guud*\n\nMudan/Marwo ${r.name},\n\n${message}\n\n_${dateStr}_`;
            
            const ok = await sendWhatsApp(r.phone, fullMsg);
            if (ok) sent++;
            else {
                failed++;
                failedRecipients.push(r);
            }
        }
        return NextResponse.json({ success: true, sent, failed, failedRecipients });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
