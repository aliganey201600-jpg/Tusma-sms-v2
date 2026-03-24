"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Flame, ExternalLink, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard({ t, topStudents, topClasses }: { t: any, topStudents: any[], topClasses: any[] }) {
  const classes = topClasses || [];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 lg:px-8 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
           <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                 <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t.schoolPulse}</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time academic energy</p>
              </div>
           </div>

           <Button variant="ghost" className="text-indigo-400 font-black hover:bg-indigo-500/10 rounded-xl" asChild>
             <Link href="/hall-of-fame">View All Rankings <ExternalLink className="ml-2 h-4 w-4" /></Link>
           </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="bg-slate-800/20 rounded-[35px] border border-white/5 p-8 md:p-10">
             <h4 className="text-lg font-black text-slate-200 mb-8 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-indigo-500" /> Top Classes
             </h4>
             <div className="space-y-4">
                {classes.map((cls, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-900/50 border border-white/5 group hover:bg-slate-800/80 transition-all">
                     <div className="flex items-center gap-4">
                       <span className="h-10 w-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-lg">
                         #{i + 1}
                       </span>
                       <div>
                          <p className="font-black text-slate-100 uppercase tracking-tight">{cls.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Class Squad</p>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">{Math.round(cls.avgXp)}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase">AVG XP</p>
                     </div>
                  </div>
                ))}
                {classes.length === 0 && (
                   <div className="py-12 text-center text-slate-600 font-bold uppercase text-[10px]">Verifying Squads...</div>
                )}
             </div>
           </div>

           <div className="bg-slate-800/20 rounded-[35px] border border-white/5 p-8 md:p-10">
             <h4 className="text-lg font-black text-slate-200 mb-8 flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-500" /> Top Students
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topStudents.map((student, i) => {
                  const themes = [
                    { color: "ring-yellow-400", bg: "bg-yellow-400/5", icon: "🥇", accent: "text-yellow-400" },
                    { color: "ring-slate-300", bg: "bg-slate-300/5", icon: "🥈", accent: "text-slate-300" },
                    { color: "ring-amber-600", bg: "bg-amber-600/5", icon: "🥉", accent: "text-amber-600" }
                  ]
                  const theme = themes[i] || themes[0]

                  return (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className={`flex flex-col items-center p-5 rounded-[32px] border border-white/5 ${theme.bg} relative group`}
                    >
                       <span className="absolute -top-3 -left-3 text-2xl">{theme.icon}</span>
                       <Avatar className={`h-14 w-14 ring-2 ${theme.color} ring-offset-2 ring-offset-slate-900 mb-3`}>
                          <AvatarFallback className="bg-slate-800 text-white text-base font-black">
                            {student.firstName?.charAt(0)}
                          </AvatarFallback>
                       </Avatar>
                       <span className="font-black text-slate-100 text-sm uppercase tracking-tighter truncate w-full text-center">{student.firstName}</span>
                       <span className={`font-black text-xs ${theme.accent} mt-1`}>{student.totalXp} XP</span>
                    </motion.div>
                  )
                })}
             </div>
           </div>
        </div>
      </motion.div>
    </section>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
