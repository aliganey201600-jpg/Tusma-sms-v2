"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero({ t }: { t: any }) {
  return (
    <section className="relative w-full pb-20 overflow-hidden">
      <div className="absolute top-10 start-10 w-72 h-72 bg-blue-600/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 end-10 w-96 h-96 bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-sm font-bold text-fuchsia-300 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <Sparkles className="h-4 w-4 text-fuchsia-400" />
            <span>LIVE: {t.dailyStreak}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            {t.heroTitlePart1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {t.heroTitlePart2}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button size="lg" className="rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] font-bold px-8 h-14 text-base bg-blue-600 hover:bg-blue-500 text-white transition-all w-full sm:w-auto" asChild>
                <Link href="/sign-up">{t.missionStart} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" /></Link>
             </Button>
             <Button size="lg" variant="outline" className="rounded-2xl font-bold px-8 h-14 text-base border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 backdrop-blur-md transition-all w-full sm:w-auto" asChild>
                <Link href="/hall-of-fame">
                  <Trophy className="me-2 h-5 w-5 text-amber-500" /> Hall of Fame
                </Link>
             </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
