import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lines = parseInt(searchParams.get("lines") || "100");

    const logFile = path.join(process.cwd(), "logs", "whatsapp_cron.log");

    if (!fs.existsSync(logFile)) {
        return NextResponse.json({ logs: [], message: "Log file not yet created." });
    }

    const content = fs.readFileSync(logFile, "utf-8");
    const allLines = content.trim().split("\n").filter(Boolean);
    const recent = allLines.slice(-lines).reverse(); // newest first

    return NextResponse.json({ logs: recent, total: allLines.length });
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    if (!user || role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const logFile = path.join(process.cwd(), "logs", "whatsapp_cron.log");
    if (fs.existsSync(logFile)) fs.writeFileSync(logFile, "");
    return NextResponse.json({ success: true, message: "Log cleared." });
}
