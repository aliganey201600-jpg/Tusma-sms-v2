"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Flame, Trophy, Timer, Crosshair, Sparkles, MapPin, Phone, Mail, Facebook, Twitter, Instagram, ChevronRight, PlayCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomeClient({ stats, topStudents }: { stats: any, topStudents: any[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen text-slate-50 pt-8 md:pt-16">
      
      {/* 1. HERO - Level Up */}
      <section className="relative w-full pb-20 overflow-hidden">
        {/* Neon Glows */}
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

      {/* 2. SCHOOL PULSE (Real Stats & Leaderboard) */}
      <section className="relative w-full max-w-7xl mx-auto px-4 lg:px-8 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Background Element */}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             
             {/* Left: Global Stats */}
             <div className="lg:col-span-1 flex flex-col gap-6">
               <div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5 group hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                     <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">{t.learningHours}</p>
                     <Timer className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {stats.totalLessons?.toLocaleString() || "1,240"}
                  </span>
                  <p className="text-xs text-emerald-400 font-bold mt-2 uppercase tracking-tight">Active Learning Pulse</p>
               </div>
               
               <div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5 group hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                     <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">{t.achievements}</p>
                     <Trophy className="h-5 w-5 text-fuchsia-500" />
                  </div>
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {stats.totalBadges?.toLocaleString() || "8,920"}
                  </span>
                  <p className="text-xs text-fuchsia-400 font-bold mt-2 uppercase tracking-tight">Badges Unlocked</p>
               </div>
             </div>

             {/* Right: Leaderboard (Real Data) */}
             <div className="lg:col-span-2 bg-slate-800/20 rounded-[35px] border border-white/5 p-8 md:p-10">
               <h4 className="text-lg font-black text-slate-200 mb-8 flex items-center gap-3">
                  <Crown className="h-6 w-6 text-yellow-500" /> {t.topStudents}
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className={`flex flex-col items-center p-6 rounded-[32px] border border-white/5 ${theme.bg} relative group`}
                      >
                         <span className="absolute -top-4 -left-4 text-3xl">{theme.icon}</span>
                         <Avatar className={`h-20 w-20 ring-4 ${theme.color} ring-offset-4 ring-offset-slate-900 mb-4 shadow-2xl`}>
                            <AvatarFallback className="bg-slate-800 text-white text-2xl font-black">
                              {student.firstName?.charAt(0)}
                            </AvatarFallback>
                         </Avatar>
                         <span className="font-black text-slate-100 text-lg uppercase tracking-tighter">{student.firstName}</span>
                         <span className={`font-black text-sm ${theme.accent} mt-1`}>{student.totalXp} XP</span>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-3">LVL {student.level || 1}</p>
                      </motion.div>
                    )
                  })}
                  {topStudents.length === 0 && (
                     <div className="col-span-full py-12 text-center text-slate-600 font-black uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-[32px]">
                        Retrieving Leaderboard Data...
                     </div>
                  )}
               </div>
             </div>
             
          </div>
        </motion.div>
      </section>

      {/* 3. LEVELS SECTION */}
      <section id="levels" className="py-24 md:py-32">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-4"
          >
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-white">
              {t.educationLevels}
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium">
              {t.educationLevelsDesc}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            {[ 
              { title: t.level1, desc: t.level1Desc, body: t.level1Body, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
              { title: t.level2, desc: t.level2Desc, body: t.level2Body, color: "from-fuchsia-500 to-pink-600", shadow: "shadow-fuchsia-500/20" },
              { title: t.level3, desc: t.level3Desc, body: t.level3Body, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" }
            ].map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl hover:${level.shadow} rounded-3xl`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <CardHeader className="pb-4 relative z-10 border-b border-slate-800/50">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${level.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                      <Crosshair className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black text-white">{level.title}</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{level.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    <p className="text-slate-400 mb-6 font-medium leading-relaxed">
                      {level.body}
                    </p>
                    <Button variant="ghost" className={`p-0 h-auto font-bold text-transparent bg-clip-text bg-gradient-to-r ${level.color} group-hover:opacity-80 transition-opacity`}>
                      {t.details} <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER (Dark App Style) */}
      <footer className="bg-slate-950/80 backdrop-blur-3xl text-slate-400 py-16 md:py-20 border-t border-slate-800">
        <div className="w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-start">
            
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-fuchsia-500" /> Tusma
              </h3>
              <p className="leading-relaxed text-sm font-medium">
                {t.footerAbout}
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white uppercase tracking-widest text-[10px]">{t.quickLinks}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-blue-400 transition-colors">{t.home}</Link></li>
                <li><Link href="/hall-of-fame" className="hover:text-blue-400 transition-colors font-bold text-indigo-400 underline decoration-indigo-400/30 underline-offset-4">Hall of Fame</Link></li>
                <li><Link href="/courses" className="hover:text-blue-400 transition-colors">{t.courses}</Link></li>
                <li><Link href="/events" className="hover:text-blue-400 transition-colors">{t.events}</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">{t.contactUs}</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>{t.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                  <span dir="ltr">+252 61 5328006</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>info@tusmaschool.edu.so</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">{t.socialMedia}</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 gap-4 font-medium">
            <p>© {new Date().getFullYear()} Tusma. {t.rightsReserved}</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">{t.privacyPolicy}</Link>
              <Link href="#" className="hover:text-white transition-colors">{t.termsOfService}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
