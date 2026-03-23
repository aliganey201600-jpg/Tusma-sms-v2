"use client"

import * as React from "react"
import { 
  Trophy, Medal, Star, Flame, Target, 
  Crown, Users, Share2, Shield, Calendar, MapPin, 
  Sparkles, Award, Zap
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function ProfileClient({ profile }: { profile: any }) {
  const isHighLevel = (profile.level || 1) >= 20

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500">
      
      {/* ── Cover Image ── */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        {profile.coverImage ? (
          <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10 pb-24">
        
        {/* ── Profile Header Section ── */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-10 mb-16 px-4">
           <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              {/* Avatar Frame Wrapper */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group shrink-0"
              >
                 <div className={cn(
                    "h-48 w-48 rounded-[60px] p-2 bg-slate-900 border-[1px] border-white/10 shadow-2xl relative overflow-hidden",
                    isHighLevel && "border-amber-500/50 shadow-amber-500/20"
                 )}>
                    {isHighLevel && (
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-[-50%] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-50"
                       />
                    )}
                    <div className="h-full w-full rounded-[50px] bg-slate-800 flex items-center justify-center text-6xl font-black text-indigo-400 relative z-10 overflow-hidden">
                       {profile.firstName?.charAt(0).toUpperCase()}
                    </div>
                 </div>
                 {/* Level Badge Hooked */}
                 <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-indigo-600 border-[4px] border-slate-950 flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-[10px] font-black uppercase text-indigo-200 leading-none">LVL</span>
                    <span className="text-xl font-black text-white leading-none">{profile.level || 1}</span>
                 </div>
              </motion.div>

              <div className="text-center md:text-left space-y-3 pb-2">
                 <div className="flex items-center gap-4 justify-center md:justify-start">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">{profile.firstName} {profile.lastName}</h1>
                    {isHighLevel && (
                       <Badge className="h-8 px-4 bg-amber-500 text-black font-black border-none rounded-xl hidden md:flex">ELITE</Badge>
                    )}
                 </div>
                 <p className="text-indigo-400 font-bold text-xl tracking-tight">@{profile.username || "student"}</p>
                 <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed">
                   {profile.bio || "No bio set. This student is keeping their achievements humble... for now."}
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <Button onClick={() => {
                if(navigator.share) {
                  navigator.share({
                    title: `${profile.firstName}'s Tusma Profile`,
                    text: `Check out my Rank #${profile.globalRank || 1} status at Tusma School! 🔥`,
                    url: window.location.href
                  })
                }
              }} className="h-16 px-10 rounded-[28px] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg gap-3 shadow-2xl shadow-indigo-500/20 border-none transition-transform active:scale-95">
                 <Share2 className="h-5 w-5" />
                 Share Profile
              </Button>
           </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
           <StatsCard 
             label="TOTAL XP" 
             value={profile.totalXp?.toLocaleString() || "0"} 
             icon={<Star className="h-6 w-6 text-yellow-400 fill-yellow-400/20" />} 
           />
           <StatsCard 
             label="CURRENT STREAK" 
             value={`${profile.currentStreak || 0} DAYS`} 
             icon={
               <div className="relative">
                 <Flame className="h-6 w-6 text-orange-500 fill-orange-500/20" />
                 <motion.div 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 blur-md bg-orange-500"
                 />
               </div>
             } 
           />
           <StatsCard 
             label="GLOBAL RANK" 
             value={`#${profile.globalRank || 1}`} 
             icon={<Crown className="h-6 w-6 text-amber-500" />} 
           />
           <StatsCard 
             label="STREAK SHIELDS" 
             value={profile.streakShields || "0"} 
             icon={<Shield className="h-6 w-6 text-indigo-400" />} 
           />
        </div>

        {/* ── Main Layout: Skills & Achievements ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Left Section (2/3) */}
           <div className="lg:col-span-2 space-y-10">
              {/* Subject Mastery / Skill Bars */}
              <div className="bg-slate-900/40 rounded-[48px] border border-white/5 p-10 md:p-14">
                 <div className="flex items-center justify-between mb-12">
                    <div>
                       <h2 className="text-3xl font-black tracking-tight uppercase mb-2">Subject Mastery</h2>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Academic performance metrics</p>
                    </div>
                    <Target className="h-10 w-10 text-indigo-500" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {profile.subjectMastery?.map((m: any, i: number) => (
                      <SkillBar key={i} label={m.subject} progress={m.percentage} color={m.color} />
                    ))}
                    {(!profile.subjectMastery || profile.subjectMastery.length === 0) && (
                      <div className="col-span-full py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/5 rounded-3xl">
                         No Mastery data found. Keep attending lessons! 📚
                      </div>
                    )}
                 </div>
              </div>

              {/* Character Gear / Items Inventory (Simplified Visual) */}
              <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-white/5 rounded-[48px] p-10 md:p-14 overflow-hidden relative group">
                 <div className="flex items-center gap-6 mb-10 overflow-x-auto no-scrollbar pb-6 scroll-smooth">
                    {[1,2,3,4,5,6].map(i => (
                       <div key={i} className="h-24 w-24 rounded-3xl bg-slate-800/50 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                          <Zap className="h-8 w-8 text-slate-700" />
                       </div>
                    ))}
                 </div>
                 <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-1 text-indigo-300">Equipped Gear</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active powerups and items</p>
                    </div>
                    <div className="text-right">
                       <p className="text-5xl font-black text-white leading-none">{profile.streakShields || 0}</p>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Active Shields</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Section (1/3) */}
           <div className="space-y-10">
              
              {/* Achievement Trophy Case */}
              <div className="bg-white/5 rounded-[48px] border border-white/10 p-10">
                 <div className="text-center mb-10">
                    <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black tracking-tight uppercase">Recent Achievements</h2>
                 </div>
                 
                 <div className="space-y-4">
                    {profile.certificates?.map((cert: any, i: number) => (
                      <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-slate-900/60 transition-colors">
                         <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-black">
                               {cert.course?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-lg group-hover:text-indigo-400 transition-colors uppercase">{cert.course?.name} Certificate</p>
                               <p className="text-xs text-slate-500 font-medium">Verified Mastery • ID: {cert.certificateUniqueId}</p>
                            </div>
                         </div>
                         <div className="text-xs text-slate-600 font-bold uppercase tracking-widest hidden md:block">
                            {new Date(cert.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </div>
                      </div>
                    ))}
                    {(!profile.certificates || profile.certificates.length === 0) && (
                      <div className="py-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 italic text-slate-500 text-sm">
                         No certificates issued yet. Keep studying! 📚
                      </div>
                    )}
                 </div>
              </div>

              {/* Social Connections (Mock) */}
              <div className="bg-slate-900/40 rounded-[48px] border border-white/5 p-10">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black tracking-tight uppercase">Squad Mates</h2>
                    <Users className="h-6 w-6 text-slate-500" />
                 </div>
                 <div className="grid grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10" />
                    ))}
                 </div>
                 <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">Class of 2024</p>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}

function StatsCard({ label, value, icon }: any) {
  return (
    <div className="bg-slate-900/60 border border-white/5 p-8 rounded-[40px] group hover:border-indigo-500/30 transition-colors">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">{label}</p>
          <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
             {icon}
          </div>
       </div>
       <div className="text-3xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
          {value}
       </div>
    </div>
  )
}

function SkillBar({ label, progress, color }: any) {
  const colors: Record<string, string> = {
    violet: "bg-violet-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  }
  const bg = colors[color] || colors.violet

  return (
    <div className="space-y-4 group">
       <div className="flex justify-between items-end">
          <span className="text-sm font-black uppercase text-slate-400 group-hover:text-white transition-colors tracking-widest">{label}</span>
          <span className="text-xl font-black text-white">{progress}%</span>
       </div>
       <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn("h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]", bg)} 
          />
       </div>
    </div>
  )
}

function Button({ children, onClick, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-center transition-all",
        className
      )}
    >
      {children}
    </button>
  )
}
