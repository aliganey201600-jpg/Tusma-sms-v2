"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { 
  Trophy, Medal, Star, Flame, Target, 
  Crown, Users, Share2, Shield, Calendar, MapPin, 
  Sparkles, Award, Zap
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
// @ts-ignore
import { getPublicProfile } from "./actions"

export default function StudentPublicProfile() {
  const { username } = useParams()
  const [profile, setProfile] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchProfile() {
      const res = await getPublicProfile(username as string)
      if (res.success) {
        setProfile(res.profile)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
         <div className="animate-spin rounded-full h-16 w-16 border-[4px] border-indigo-500/20 border-t-indigo-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center italic">
         <Trophy className="h-20 w-20 text-slate-800 mb-6" />
         <h1 className="text-3xl font-black mb-2 tracking-tighter">Student Not Found</h1>
         <p className="text-slate-500 font-medium">This profile is as elusive as a perfect score on an Algebra quiz.</p>
      </div>
    )
  }

  const isHighLevel = (profile.level || 1) >= 20

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500">
      
      {/* ── Cover Image ── */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        {profile.coverImage ? (
          <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent" />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative -mt-32 pb-32">
        
        {/* ── Profile Header ── */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          
          {/* Avatar with Glow Frame */}
          <div className="relative shrink-0 group">
             {isHighLevel && (
               <motion.div 
                 animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                 transition={{ rotate: { repeat: Infinity, duration: 10, ease: "linear" }, scale: { repeat: Infinity, duration: 2 } }}
                 className="absolute -inset-4 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" 
               />
             )}
             <div className={cn(
               "h-48 w-48 rounded-full bg-slate-800 border-8 border-slate-950 relative overflow-hidden z-10 flex items-center justify-center text-6xl font-black uppercase text-indigo-400 shadow-2xl transition-transform group-hover:scale-[1.02]",
               isHighLevel ? "border-amber-400 shadow-amber-900/40" : ""
             )}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} className="h-full w-full object-cover" alt="" />
                ) : profile.firstName?.substring(0, 1)}
             </div>
             
             {/* Level Badge */}
             <div className="absolute -bottom-2 right-4 z-20 bg-indigo-600 border-4 border-slate-950 px-5 py-1.5 rounded-2xl text-xl font-black shadow-xl">
               LVL {profile.level}
             </div>
          </div>

          {/* Name & Bio */}
          <div className="flex-1 text-center md:text-left space-y-4 pb-4">
             <div>
               <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{profile.firstName} {profile.lastName}</h1>
                 {isHighLevel && <Badge className="bg-amber-400 text-slate-950 font-black h-7 px-3 rounded-lg border-none shadow-lg shadow-amber-400/20">ELITE</Badge>}
               </div>
               <p className="text-indigo-400 font-bold text-lg lowercase tracking-tight">@{profile.username || 'student'}</p>
             </div>
             <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl italic">
               "{profile.bio || "Acclaiming victory one lesson at a time. No bio, just brilliance."}"
             </p>

             <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <MapPin className="h-4 w-4" />
                  {profile.class?.name || 'Academy'}
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Profile Link Copied!");
                     }}
                     className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 transition-colors"
                   >
                     <Share2 className="h-5 w-5 text-indigo-400" />
                   </button>
                   <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm transition-all shadow-xl shadow-indigo-900/40 border border-white/10 group">
                      <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Add to Squad
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* ── Grid Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left Column: Stats & Skills */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* Core Stats Card */}
              <Card className="bg-slate-900 border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[40px] blur-2xl group-hover:opacity-40 transition-opacity" />
                 <CardContent className="p-10 space-y-8">
                    <div className="flex justify-between items-center text-center">
                       <div>
                         <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Total XP</p>
                         <p className="text-3xl font-black tracking-tighter text-white">{profile.totalXp}</p>
                       </div>
                       <div className="h-10 w-px bg-white/10" />
                       <div>
                         <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Daily Streak</p>
                         <p className="text-3xl font-black tracking-tighter text-orange-400 flex items-center gap-1.5 animate-pulse">
                           <Flame className="h-6 w-6 fill-orange-500/30" />
                           {profile.currentStreak}
                         </p>
                       </div>
                       <div className="h-10 w-px bg-white/10" />
                       <div>
                         <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Rank</p>
                         <p className="text-3xl font-black tracking-tighter text-indigo-400">#{profile.globalRank}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[11px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-4">Subject Mastery</p>
                       {profile.mastery?.map((skill: any, index: number) => (
                         <div key={skill.name} className="space-y-2">
                           <div className="flex justify-between text-xs font-bold text-slate-300">
                             <span>{skill.name}</span>
                             <span>{skill.progress}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.progress}%` }}
                                transition={{ duration: 1.5, delay: index * 0.1 }}
                                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                              />
                           </div>
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              {/* Character Details */}
              <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Character Gear</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Streak Protection</p>
                       <p className="text-lg font-black">{profile.streakShields} Shields</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Lesson XP Bonus</p>
                       <p className="text-lg font-black text-emerald-400">+15%</p>
                    </div>
                 </div>
              </div>

           </div>

           {/* Right Column: Trophy Case & Feed */}
           <div className="lg:col-span-8 space-y-8">
              
              {/* Featured Badges (Trophy Case) */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                     <Trophy className="h-5 w-5 text-amber-500" />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Trophy Case</h2>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.badges?.filter((sb: any) => sb.isFeatured).map((sb: any, i: number) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5, scale: 1.05 }}
                        className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-black/40 relative overflow-hidden group"
                      >
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="h-20 w-20 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-indigo-500/20 transition-all border border-white/5">
                            <Sparkles className="h-10 w-10 text-amber-400" />
                         </div>
                         <div>
                            <p className="font-black text-lg tracking-tight group-hover:text-indigo-400 transition-colors uppercase leading-none">{sb.badge.name}</p>
                            <p className="text-xs text-slate-500 font-medium mt-2">{sb.badge.description}</p>
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 pt-2">{new Date(sb.earnedAt).toLocaleDateString()}</div>
                      </motion.div>
                    ))}
                    {(!profile.badges || profile.badges.filter((sb: any) => sb.isFeatured).length === 0) && (
                      <div className="col-span-full py-12 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 italic text-slate-500 font-medium">
                         Achievements locked. High score in progress...
                      </div>
                    )}
                 </div>
              </div>

              {/* Learning Roadmap / Portfolio */}
              <div className="space-y-6 pt-6">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                     <Award className="h-5 w-5 text-indigo-500" />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Recent Achievements</h2>
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

           </div>
        </div>
      </div>
    </div>
  )
}
