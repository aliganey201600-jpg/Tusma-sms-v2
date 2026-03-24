import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const CRON_SECRET = process.env.CRON_SECRET;
const WHATSAPP_GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || "http://localhost:3001/send-message";

// ============================================================
// LOGGER — writes every event to logs/whatsapp_cron.log
// ============================================================
function logCron(level: "INFO" | "ERROR" | "WARN", message: string) {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, "whatsapp_cron.log");
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Africa/Mogadishu" });
    const line = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(logFile, line);
    console.log(line.trim());
}

// ============================================================
// SEND — queues one message to the WhatsApp gateway
// ============================================================
async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
    if (!phone) return false;
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
        const data = await res.json();
        if (data.success) {
            logCron("INFO", `✅ Queued → ${cleanPhone}: "${message.substring(0, 40)}..."`);
            return true;
        } else {
            logCron("WARN", `⚠️ Gateway rejected → ${cleanPhone}: ${JSON.stringify(data)}`);
            return false;
        }
    } catch (err: any) {
        logCron("ERROR", `❌ Send failed → ${cleanPhone}: ${err.message}`);
        return false;
    }
}

// ============================================================
// MAIN HANDLER
// ============================================================
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const forceHour = searchParams.get("hour");

    // ── Security ───────────────────────────────────────────
    if (!CRON_SECRET || secret !== CRON_SECRET) {
        logCron("WARN", "Unauthorized cron attempt blocked.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Determine current Somali hour (UTC+3) ──────────────
    const now = new Date();
    const somaliHour = forceHour
        ? parseInt(forceHour)
        : (now.getUTCHours() + 3) % 24;

    const dateStr = now.toLocaleDateString("en-CA", { timeZone: "Africa/Mogadishu" }); // YYYY-MM-DD
    const todayStart = new Date(`${dateStr}T00:00:00.000Z`);

    logCron("INFO", `═══════════════════════════════════════`);
    logCron("INFO", `Cron triggered — Somali Hour: ${somaliHour}, Date: ${dateStr}`);

    try {

        // ══════════════════════════════════════════════════════
        // 09:00 — Absence Notifications → Parents
        // ══════════════════════════════════════════════════════
        if (somaliHour === 9) {
            const absentStudents = await prisma.attendance.findMany({
                where: {
                    date: { gte: todayStart },
                    status: "ABSENT",
                },
                include: {
                    student: {
                        include: { parent: true },
                    },
                },
            });

            logCron("INFO", `[09:00] Found ${absentStudents.length} absent students.`);
            
            // Deduplicate parents for absence (if a parent has 2 kids absent, send 1 combined message or just 1 message)
            const distinctParents = new Map<string, { name: string, studentNames: string[] }>();
            for (const att of absentStudents) {
                const phone = att.student.guardianPhone;
                if (!phone) continue;
                if (!distinctParents.has(phone)) {
                    distinctParents.set(phone, { name: att.student.guardianName || "Waalid", studentNames: [] });
                }
                distinctParents.get(phone)!.studentNames.push(`${att.student.firstName} ${att.student.lastName}`);
            }

            let sent = 0;
            for (const [phone, data] of distinctParents.entries()) {
                const namesStr = data.studentNames.join(", ");
                const msg =
                    `*Tusmo School — Ogeysiiska Maqnaanshaha*\n\n` +
                    `Salaan sare mudan/marwo *${data.name}*,\n` +
                    `Ardayga (ama ardayda) *${namesStr}* waa ay ka maqan yihiin dugsiga maanta (_${dateStr}_).\n\n` +
                    `Haddii aad ogtahay sababta, fadlan nala soo xiriir: *+252 61 5328006*`;
                
                logCron("INFO", `[09:00] Attempting send to ${phone} for ${namesStr}...`);
                const ok = await sendWhatsApp(phone, msg);
                if (ok) sent++;
            }

            logCron("INFO", `[09:00] Absence alerts completed. Sent: ${sent}`);
            return NextResponse.json({ success: true, type: "ABSENCE", count: sent });
        }

        // ══════════════════════════════════════════════════════
        // 12:00 — Teacher Attendance Reminder
        // ══════════════════════════════════════════════════════
        if (somaliHour === 12) {
            const allClasses = await prisma.class.findMany({
                include: { teacher: true },
            });

            // Get which classIds already have attendance logged today
            const submittedRaw = await prisma.attendance.findMany({
                where: { date: { gte: todayStart } },
                select: { student: { select: { classId: true } } },
            });
            const submittedClassIds = new Set(
                submittedRaw.map((r) => r.student?.classId).filter(Boolean)
            );

            let sent = 0;
            for (const cls of allClasses) {
                if (submittedClassIds.has(cls.id)) continue; // already done
                const phone = cls.teacher?.phone;
                if (!phone) continue;
                const msg =
                    `*Tusmo School — Xusuusin*\n\n` +
                    `Salaan macalin *${cls.teacher!.firstName}*,\n` +
                    `Maanta weli ma aadan soo gudbin xaadirinta fasalka *${cls.name}*.\n` +
                    `Fadlan isla hadda dhammaystir si ardaydu u helaan diiwaanka.\n\n` +
                    `_${dateStr}_`;
                const ok = await sendWhatsApp(phone, msg);
                if (ok) sent++;
            }

            logCron("INFO", `[12:00] Teacher reminders sent: ${sent}`);
            return NextResponse.json({ success: true, type: "TEACHER_REMINDER", count: sent });
        }

        // ══════════════════════════════════════════════════════
        // 15:00 — Dismissal Notification → All Parents
        // ══════════════════════════════════════════════════════
        if (somaliHour === 15) {
            const students = await prisma.student.findMany({
                where: { guardianPhone: { not: null } },
                select: { guardianPhone: true, guardianName: true }
            });

            // Deduplicate parents
            const distinctParents = new Map<string, string>();
            for (const s of students) {
              if (s.guardianPhone) distinctParents.set(s.guardianPhone, s.guardianName || "Waalid");
            }

            logCron("INFO", `[15:00] Sending dismissal to ${distinctParents.size} distinct parents.`);
            let sent = 0;

            for (const [phone, name] of distinctParents.entries()) {
                const msg =
                    `*Tusmo School — Ogeysiis*\n\n` +
                    `Salaan mudan/marwo *${name}*,\n` +
                    `Waxaan kugu ogeysiinaynaa in dugsigu *dhammaaday* maanta (_${dateStr}_).\n` +
                    `Carruurtu waxay ku soo jiraan wadada. Dee soo dhawoow!\n\n` +
                    `📍 Degmada Tusmo, Muqdisho`;
                const ok = await sendWhatsApp(phone, msg);
                if (ok) sent++;
            }

            return NextResponse.json({ success: true, type: "DISMISSAL", count: sent });
        }

        // ══════════════════════════════════════════════════════
        // 20:00 — Daily XP Progress Report → Parents
        // ══════════════════════════════════════════════════════
        if (somaliHour === 20) {
            const transactions = await prisma.pointTransaction.findMany({
                where: { createdAt: { gte: todayStart } },
                include: {
                    student: { include: { parent: true } },
                },
            });

            // Aggregate XP per student
            const statsMap: Record<string, { name: string; xp: number; phone: string | null; guardianName: string | null; level: number }> = {};
            for (const tx of transactions) {
                if (!statsMap[tx.studentId]) {
                    statsMap[tx.studentId] = {
                        name: `${tx.student.firstName} ${tx.student.lastName}`,
                        xp: 0,
                        phone: tx.student.guardianPhone || null,
                        guardianName: tx.student.guardianName || "Waalid",
                        level: tx.student.level,
                    };
                }
                statsMap[tx.studentId].xp += tx.points;
            }

            let sent = 0;
            for (const sid in statsMap) {
                const s = statsMap[sid];
                if (!s.phone || s.xp <= 0) continue;
                const msg =
                    `*Tusmo School — Warbixinta Maanta*\n\n` +
                    `Salaan mudan/marwo *${s.guardianName}*,\n` +
                    `Ardayga *${s.name}* maanta wuxuu helay:\n` +
                    `⭐ *${s.xp} XP* (dhibcood)\n` +
                    `🏆 Heerkiisu: Level *${s.level}*\n\n` +
                    `Hambalyo dadaalka socda! Keep it up! 💪\n` +
                    `_Tusmo School — ${dateStr}_`;
                const ok = await sendWhatsApp(s.phone, msg);
                if (ok) sent++;
            }

            logCron("INFO", `[20:00] XP Reports sent: ${sent}`);
            return NextResponse.json({ success: true, type: "PROGRESS_REPORT", count: sent });
        }

        // No matching hour
        logCron("INFO", `No cron action defined for hour ${somaliHour}.`);
        return NextResponse.json({ success: true, message: "No action for this hour.", hour: somaliHour });

    } catch (err: any) {
        logCron("ERROR", `CRON CRASH: ${err.message}\n${err.stack}`);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
