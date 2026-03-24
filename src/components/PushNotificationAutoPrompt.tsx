"use client";
import React, { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BellRing, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PushNotificationAutoPrompt() {
    const { supported, subscribed, loading, permission, subscribe } = usePushNotifications();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show if supported, not subscribed, and not blocked
        if (supported && !subscribed && !loading && permission !== "denied") {
            // Check if we already showed it in this session to avoid annoyance
            const lastShown = sessionStorage.getItem("push_prompt_shown");
            if (!lastShown) {
                const timer = setTimeout(() => {
                    setShow(true);
                    sessionStorage.setItem("push_prompt_shown", "true");
                }, 3000); // Wait 3s after load
                return () => clearTimeout(timer);
            }
        }
    }, [supported, subscribed, loading, permission]);

    if (!show || subscribed || permission === "denied") return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] max-w-[350px] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden group">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20" />
                
                <button 
                    onClick={() => setShow(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex gap-4 items-start relative">
                    <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <BellRing className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase tracking-tight">Hel ogeysiisyada</h4>
                        <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">
                            Ha seegin wararka dugsiga, imtixaanada iyo dhibcahaaga cusub. Shid ogeysiiska browser-ka.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 relative">
                    <Button 
                        onClick={async () => {
                            await subscribe();
                            setShow(false);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl"
                    >
                        <Send className="h-3 w-3 mr-2" /> HEE OGAW (SHID)
                    </Button>
                    <button 
                        onClick={() => setShow(false)}
                        className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors py-2"
                    >
                        Hadda Maya (Later)
                    </button>
                </div>
            </div>
        </div>
    );
}
