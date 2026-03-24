"use client";
import React, { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Send, Users, GraduationCap, UsersRound, RefreshCw,
    Trash2, CheckCircle2, XCircle, Loader2, Terminal
} from "lucide-react";
import { toast } from "sonner";

type Target = "ALL_PARENTS" | "ALL_TEACHERS" | "ALL";

interface LogEntry {
    line: string;
    level: "INFO" | "ERROR" | "WARN" | string;
}

export default function WhatsAppManager() {
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState<Target>("ALL_PARENTS");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

    const [logs, setLogs] = useState<string[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const targets = [
        { id: "ALL_PARENTS" as Target, label: "All Parents", icon: <Users className="h-4 w-4" />, color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100" },
        { id: "ALL_TEACHERS" as Target, label: "All Teachers", icon: <GraduationCap className="h-4 w-4" />, color: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100" },
        { id: "ALL" as Target, label: "Everyone", icon: <UsersRound className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" },
    ];

    async function fetchLogs() {
        setLogsLoading(true);
        try {
            const res = await fetch("/api/whatsapp/logs?lines=50");
            const data = await res.json();
            setLogs(data.logs || []);
        } catch {
            toast.error("Failed to fetch logs");
        } finally {
            setLogsLoading(false);
        }
    }

    async function clearLogs() {
        if (!confirm("Are you sure you want to clear all logs?")) return;
        await fetch("/api/whatsapp/logs", { method: "DELETE" });
        setLogs([]);
        toast.success("Logs cleared.");
    }

    useEffect(() => { fetchLogs(); }, []);

    function handleSend() {
        if (!message.trim()) { toast.error("Fadlan fariin qor!"); return; }
        startTransition(async () => {
            setResult(null);
            try {
                const res = await fetch("/api/whatsapp/broadcast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message, target }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed");
                setResult({ sent: data.sent, failed: data.failed });
                toast.success(`✅ ${data.sent} fariin waa la queueeyay!`);
                setMessage("");
                setTimeout(fetchLogs, 2000);
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    }

    function getLogColor(line: string) {
        if (line.includes("[ERROR]")) return "text-red-400";
        if (line.includes("[WARN]")) return "text-yellow-400";
        if (line.includes("✅")) return "text-emerald-400";
        if (line.includes("❌")) return "text-red-400";
        return "text-slate-300";
    }

    return (
        <div className="space-y-8">
            {/* BROADCAST PANEL */}
            <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                    <Send className="h-5 w-5 text-emerald-600" /> Send Broadcast
                </h3>

                {/* Target Selector */}
                <div className="flex gap-3 mb-6">
                    {targets.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTarget(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${target === t.id ? t.color + " ring-2 ring-offset-1 ring-current" : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Qor fariintaada halkan... (Tusaale: Dugsiga berri ayuu xidnaan doonaa maalinta xafladda.)"
                    className="min-h-[120px] bg-slate-50 border-slate-100 rounded-2xl font-medium text-slate-800 placeholder:text-slate-400 focus:ring-emerald-500"
                    maxLength={500}
                />
                <p className="text-[10px] text-slate-400 font-bold mt-1">{message.length}/500 xaraf</p>

                <div className="flex items-center gap-4 mt-6">
                    <Button
                        onClick={handleSend}
                        disabled={isPending || !message.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl gap-2"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {isPending ? "Sending..." : "BROADCAST"}
                    </Button>

                    {result && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 gap-1 font-bold">
                                <CheckCircle2 className="h-3 w-3" /> {result.sent} Queued
                            </Badge>
                            {result.failed > 0 && (
                                <Badge className="bg-red-50 text-red-600 border-0 gap-1 font-bold">
                                    <XCircle className="h-3 w-3" /> {result.failed} Failed
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* CRON LOG VIEWER */}
            <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-slate-900">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-emerald-400" /> Cron Activity Log
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchLogs}
                            disabled={logsLoading}
                            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl gap-1"
                        >
                            <RefreshCw className={`h-3 w-3 ${logsLoading ? "animate-spin" : ""}`} /> Refresh
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearLogs}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-xl gap-1"
                        >
                            <Trash2 className="h-3 w-3" /> Clear
                        </Button>
                    </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 h-72 overflow-y-auto font-mono text-xs space-y-1">
                    {logsLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                        </div>
                    )}
                    {!logsLoading && logs.length === 0 && (
                        <div className="flex items-center justify-center h-full text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                            No log entries yet. Run the cron to see activity.
                        </div>
                    )}
                    {!logsLoading && logs.map((line, i) => (
                        <p key={i} className={`leading-relaxed ${getLogColor(line)}`}>{line}</p>
                    ))}
                </div>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2">
                    Showing last 50 entries · Newest first
                </p>
            </Card>
        </div>
    );
}
