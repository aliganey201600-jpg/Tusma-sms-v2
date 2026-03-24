"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BellRing, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function PushManager() {
    const [title, setTitle] = useState("Tusmo School Ogeysiis");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("/dashboard");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ sent: number; failed: number, cleaned: number } | null>(null);

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
        <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white mt-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <BellRing className="h-5 w-5 text-indigo-600" />
                </div>
                Browser Push Notifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notification Title</label>
                    <Input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Tusmo School"
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target URL (On Click)</label>
                    <Input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="/dashboard"
                        className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notification Body</label>
                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Qor ogeysiiska aad rabto in browser-yada ardayda laga tuso..."
                    className="min-h-[100px] bg-slate-50 border-slate-100 rounded-2xl font-medium text-slate-800 placeholder:text-slate-400 focus:ring-indigo-500"
                    maxLength={200}
                />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <Button
                    onClick={handleSend}
                    disabled={isPending || !body.trim() || !title.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl gap-2 w-full md:w-auto"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isPending ? "Sending Push..." : "SEND TO ALL BROWSERS"}
                </Button>

                {result && (
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        <Badge className="bg-emerald-50 text-emerald-700 border-0 gap-1 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> {result.sent} Sent
                        </Badge>
                        {result.failed > 0 && (
                            <Badge className="bg-red-50 text-red-600 border-0 gap-1 font-bold">
                                <XCircle className="h-3 w-3" /> {result.failed} Failed
                            </Badge>
                        )}
                        {result.cleaned > 0 && (
                            <Badge className="bg-amber-50 text-amber-700 border-0 gap-1 font-bold">
                                {result.cleaned} Cleaned (Expired)
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
