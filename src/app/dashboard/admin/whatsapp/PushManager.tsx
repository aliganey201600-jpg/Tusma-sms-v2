"use client";
import React, { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BellRing, Send, Loader2, CheckCircle2, XCircle, Users, HelpCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function PushManager() {
    const [title, setTitle] = useState("Tusmo School Ogeysiis");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("/dashboard");
    const [subscribers, setSubscribers] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ sent: number; failed: number, cleaned: number } | null>(null);

    // Fetch total subscribers
    useEffect(() => {
        fetch("/api/push/subscribe")
            .then(res => res.json())
            .then(data => setSubscribers(data.count))
            .catch(() => setSubscribers(0));
    }, []);

    function handleSend() {
        if (!title.trim() || !body.trim()) { 
            toast.error("Fadlan buuxi Title iyo Body-ga fariinta!"); 
            return; 
        }

        startTransition(async () => {
            setResult(null);
            try {
                const res = await fetch("/api/push/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, body, url }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed");

                setResult({ sent: data.sent, failed: data.failed, cleaned: data.cleaned });
                toast.success(`✅ ${data.sent} notification(s) sent successfully!`);
                setBody(""); // Clear message
            } catch (err: any) {
                toast.error(err.message);
            }
        });
    }

    return (
        <Card className="p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm bg-white mt-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative">
                <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                       <div className="p-2 bg-indigo-100 rounded-xl">
                           <BellRing className="h-6 w-6 text-indigo-600" />
                       </div>
                       Browser Push Notifications
                   </h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 pl-1">Target all student & teacher browsers</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Subscribers</p>
                        <p className="text-lg font-black text-slate-900">{subscribers === null ? "..." : subscribers} Devices</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Notification Title</label>
                    <Input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Tusmo School"
                        className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Target URL (On Click)</label>
                    <Input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="/dashboard"
                        className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">Notification Body</label>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Qor ogeysiiska aad rabto in browser-yada ardayda laga tuso..."
                    className="min-h-[120px] bg-slate-50/50 border-slate-100 rounded-[2rem] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all text-sm p-6"
                    maxLength={200}
                />
            </div>

            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
                <Button
                    onClick={handleSend}
                    disabled={isPending || !body.trim() || !title.trim() || subscribers === 0}
                    className="bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs h-14 px-10 rounded-2xl gap-3 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {isPending ? "Sending Push..." : "BROADCAST TO BROWSERS"}
                </Button>

                {result && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 py-2 px-4 rounded-xl gap-2 font-black text-[10px]">
                            <CheckCircle2 className="h-4 w-4" /> {result.sent} SENT
                        </Badge>
                        {result.failed > 0 && (
                            <Badge className="bg-rose-50 text-rose-600 border border-rose-100 py-2 px-4 rounded-xl gap-2 font-black text-[10px]">
                                <XCircle className="h-4 w-4" /> {result.failed} FAILED
                            </Badge>
                        )}
                    </div>
                )}

                {subscribers === 0 && !isPending && (
                    <div className="flex items-center gap-3 text-amber-600 bg-amber-50/50 py-3 px-6 rounded-2xl border border-amber-100 animate-pulse">
                        <Info className="h-5 w-5" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">No active subscribers yet. Students must opt-in from their dashboard.</p>
                    </div>
                )}
            </div>

            {/* Help / Education Section */}
            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <HelpCircle className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">How to get more subscribers?</h4>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">
                        Browser notifications are different from WhatsApp. Students and teachers must explicitly click <span className="text-indigo-600">"Enable Notifications"</span> on their dashboard header before you can send them browser alerts.
                    </p>
                </div>
            </div>
        </Card>
    );
}
