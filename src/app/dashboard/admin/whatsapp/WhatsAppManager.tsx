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
    const [progress, setProgress] = useState<{ total: number; current: number; sent: number; failed: number; failedList: { name: string; phone: string }[] } | null>(null);

    const [logs, setLogs] = useState<string[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const targets = [
        { id: "ALL_PARENTS" as Target, label: "All Parents", icon: <Users className="h-4 w-4" />, color: "bg-blue-50 text-blue-700 border-blue-100" },
        { id: "ALL_TEACHERS" as Target, label: "All Teachers", icon: <GraduationCap className="h-4 w-4" />, color: "bg-violet-50 text-violet-700 border-violet-100" },
        { id: "ALL" as Target, label: "Everyone", icon: <UsersRound className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
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

    async function runAbsenceCron() {
      toast.info("Triggering 09:00 Absence Cron...");
      try {
        const res = await fetch("/api/cron/whatsapp?secret=tusmo_secret_777&hour=9");
        const data = await res.json();
        if (data.success) {
          toast.success(`Absence Cron complete: Sent to ${data.count} parents.`);
          fetchLogs();
        } else throw new Error(data.error);
      } catch (err: any) {
         toast.error(`Cron Failed: ${err.message}`);
      }
    }

    function handleSend() {
        if (!message.trim()) { toast.error("Fadlan fariin qor!"); return; }
        
        startTransition(async () => {
            setProgress(null);
            try {
                // 1. Fetch Recipients
                const fetchRes = await fetch("/api/whatsapp/broadcast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ target }),
                });
                const fetchData = await fetchRes.json();
                if (!fetchRes.ok) throw new Error(fetchData.error || "Recipients fail");

                const recipients = fetchData.recipients;
                if (recipients.length === 0) {
                   toast.error("Ma jiraan dad u diiwaan gashan halkaan.");
                   return;
                }

                setProgress({ total: recipients.length, current: recipients.length, sent: 0, failed: 0, failedList: [] });
                
                // 2. Send in batches of 5 for UI feedback
                const batchSize = 1; // 1 by 1 for the countdown effect
                let currentSent = 0;
                let currentFailed = 0;
                let failedList: {name:string, phone:string}[] = [];

                for (let i = 0; i < recipients.length; i += batchSize) {
                    const batch = recipients.slice(i, i + batchSize);
                    const res = await fetch("/api/whatsapp/broadcast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message, recipients: batch }),
                    });
                    const data = await res.json();
                    
                    currentSent += data.sent;
                    currentFailed += data.failed;
                    if (data.failedRecipients) failedList = [...failedList, ...data.failedRecipients];

                    setProgress({ 
                      total: recipients.length, 
                      current: recipients.length - (i + batch.length), 
                      sent: currentSent, 
                      failed: currentFailed,
                      failedList: failedList
                    });
                }

                toast.success(`Dhammaatay: ${currentSent} la diray, ${currentFailed} guuldareystay.`);
                setMessage("");
                fetchLogs();
            } catch (err: any) {
                toast.error(err.message);
                setProgress(null);
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
        <div className="space-y-8 pb-20">
            {/* BROADCAST PANEL */}
            <Card className="p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
                
                <div className="flex justify-between items-center mb-10 relative">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <Send className="h-6 w-6 text-emerald-600" />
                        </div>
                        Send Manual Broadcast
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 pl-1">Target specific groups instantly</p>
                  </div>

                  <Button 
                    onClick={runAbsenceCron}
                    variant="outline"
                    className="rounded-2xl border-slate-200 text-xs font-black uppercase tracking-widest gap-2 bg-slate-50 hover:bg-slate-100"
                  >
                    <RefreshCw className="h-4 w-4" /> Run Absence Cron Now
                  </Button>
                </div>

                {/* Target Selector */}
                <div className="flex flex-wrap gap-4 mb-10">
                    {targets.map((t) => (
                        <button
                            key={t.id}
                            disabled={isPending}
                            onClick={() => setTarget(t.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 text-xs font-black transition-all active:scale-95 ${target === t.id ? t.color + " border-current ring-4 ring-current/5" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3 mb-8">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Your Message</label>
                  <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Qor fariintaada halkan... Tusaale: Dugsiga berri oo Khamiis ah wuu xiranyahay."
                      className="min-h-[150px] bg-slate-50/50 border-slate-100 rounded-[2rem] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all text-sm p-8"
                      maxLength={500}
                  />
                  <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase pl-2">{message.length}/500 Xaraf</p>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
                    <Button
                        onClick={handleSend}
                        disabled={isPending || !message.trim()}
                        className="bg-emerald-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl gap-3 shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                    >
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        {isPending ? `SENDING (${progress?.current || 0} LEFT)...` : "BROADCAST TO WHATSAPP"}
                    </Button>

                    {progress && (
                        <div className="flex-1 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex flex-col">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Progress</p>
                              <div className="flex items-center gap-3">
                                <Badge className="bg-blue-50 text-blue-700 border border-blue-100 py-1.5 px-4 rounded-xl gap-2 font-black text-[10px]">
                                    {progress.current} QUEUED
                                </Badge>
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 py-1.5 px-4 rounded-xl gap-2 font-black text-[10px]">
                                    <CheckCircle2 className="h-4 w-4" /> {progress.sent} SENT
                                </Badge>
                                {progress.failed > 0 && (
                                    <Badge className="bg-rose-50 text-rose-600 border border-rose-100 py-1.5 px-4 rounded-xl gap-2 font-black text-[10px]">
                                        <XCircle className="h-4 w-4" /> {progress.failed} FAILED
                                    </Badge>
                                )}
                              </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FAILED LIST SUMMARY */}
                {progress && progress.failedList.length > 0 && (
                  <div className="mt-10 p-8 bg-rose-50/50 rounded-[2.5rem] border border-rose-100 animate-in zoom-in-95 duration-500">
                    <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <XCircle className="h-4 w-4" /> Detailed Failure Report
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {progress.failedList.map((f, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-rose-100 flex justify-between items-center group hover:bg-rose-50 transition-colors">
                           <div>
                             <p className="text-[11px] font-black text-slate-900">{f.name}</p>
                             <p className="text-[9px] font-bold text-slate-500">{f.phone}</p>
                           </div>
                           <Badge variant="outline" className="text-[8px] font-black border-rose-200 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">FAILED</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
