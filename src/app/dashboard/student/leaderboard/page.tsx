"use client"

import * as React from "react"
import { 
  Trophy, Medal, Star, Flame, Target, 
  Crown, Users, Share2, Download, Check 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getLeaderboardData } from "./actions"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"

export default function LeaderboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [category, setCategory] = React.useState<'ACADEMIC' | 'XP' | 'CLASS'>('ACADEMIC')
  const [data, setData] = React.useState<{xpStudents: any[], academicStudents: any[], classRankings: any[]}>({ 
    xpStudents: [], 
    academicStudents: [],
    classRankings: []
  })
  const [loading, setLoading] = React.useState(true)
  const [isShareOpen, setIsShareOpen] = React.useState(false)

  React.useEffect(() => {
    async function fetchLeaderboard() {
      const res = await getLeaderboardData()
      if (res.success) {
        setData({
          xpStudents: res.xpStudents || [],
          academicStudents: res.academicStudents || [],
          classRankings: res.classRankings || []
        })
      }
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-indigo-100 border-t-indigo-600" />
      </div>
    )
  }

  const currentList = category === 'ACADEMIC' 
    ? data.academicStudents 
    : (category === 'XP' ? data.xpStudents : data.classRankings)

  const top3 = currentList.slice(0, 3)
  const rest = currentList.slice(3)

  const myRank = category === 'CLASS' 
    ? (data.classRankings.find(c => c.id === user?.classId)?.rank || "-")
    : (currentList.find(s => s.id === user?.studentId)?.rank || "-")

  const myValue = category === 'ACADEMIC' 
    ? 'Processing...' 
    : (category === 'XP' ? (user?.totalXp || 0) : (data.classRankings.find(c => c.id === user?.classId)?.xp || 0))

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32">
       {/* ── Header ── */}
       <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="z-10 space-y-4 md:max-w-xl text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
               <Trophy className="h-4 w-4 text-amber-400" />
               <span className="text-xs font-black uppercase tracking-widest text-white/90">Hall of Fame</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
               {category === 'CLASS' ? 'Department Battles' : 'Student Leaderboard'}
             </h1>
             <p className="text-white/60 font-medium text-lg leading-relaxed">
               {category === 'ACADEMIC' && "Our brightest minds. Rankings based on GPA, Quizzes, and Exam performance."}
               {category === 'XP' && "Most active learners. Rankings based on XP earned through lessons and participation."}
               {category === 'CLASS' && "Team spirit! Which class has the most dedicated students? AVG XP per student defines the rank."}
             </p>
             
             <div className="pt-2">
                <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-900/40 border border-white/10 group">
                      <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Share My Rank
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-slate-950 border-white/10 text-white rounded-[2.5rem]">
                    <DialogHeader>
                      <DialogTitle className="text-center text-xl font-black">Share Your Achievement</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 mt-4 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-center space-y-4 shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                       <Crown className="h-16 w-16 text-amber-400 mx-auto drop-shadow-lg" />
                       <div>
                         <p className="text-xs uppercase tracking-[0.2em] font-black text-indigo-100 mb-1">Tusmo School Champion</p>
                         <h2 className="text-3xl font-black tracking-tighter">{user?.fullName || 'Student'}</h2>
                       </div>
                       <div className="flex justify-center gap-8 py-4 border-y border-white/10">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-indigo-200">Weekly Rank</p>
                            <p className="text-3xl font-black text-white">#{myRank}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-indigo-200">Total XP</p>
                            <p className="text-3xl font-black text-white">{user?.totalXp || 0}</p>
                          </div>
                       </div>
                       <p className="text-sm font-medium text-indigo-100 italic">"Anigaa lambarka {myRank}-aad ka ah Tusma School usbuucan! 🔥"</p>
                       <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest pt-2">tusmo.education</div>
                    </div>
                    <div className="flex gap-3 mt-4">
                       <button 
                         className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-sm font-bold transition-colors"
                         onClick={() => {
                           navigator.clipboard.writeText(`Anigaa lambarka ${myRank}-aad ka ah Tusma School usbuucan! 🔥\nCheck out my profile on Tusmo Education!`);
                           alert("Rank copied to clipboard!");
                         }}
                       >
                         <Download className="h-4 w-4" /> Save Link
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 rounded-2xl py-3 text-sm font-bold transition-colors shadow-lg shadow-green-900/20">
                         WhatsApp
                       </button>
                    </div>
                  </DialogContent>
                </Dialog>
             </div>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl shrink-0 min-w-[200px]">
             <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-2">My Current Rank</p>
             <div className="flex items-baseline gap-2">
               <span className="text-6xl font-black text-amber-400">#{myRank}</span>
             </div>
             <div className="mt-4 flex flex-col items-center gap-1">
               <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                 {category === 'ACADEMIC' ? 'AVG Score' : 'Team / My XP'}
               </p>
               <div className="flex items-center gap-1.5 text-xl font-black text-white">
                 {category === 'ACADEMIC' ? <Target className="h-5 w-5 text-emerald-400" /> : <Star className="h-5 w-5 fill-amber-400 text-amber-400" />}
                 {myValue}
               </div>
             </div>
          </div>
       </div>

       {/* ── 3-Way Category Switcher ── */}
       <div className="flex justify-center">
          <div className="bg-slate-100 p-2 rounded-[2.5rem] flex flex-wrap justify-center gap-2 border-2 border-slate-50 shadow-inner max-w-full overflow-hidden">
             <button 
                onClick={() => setCategory('ACADEMIC')}
                className={cn(
                   "px-6 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                   category === 'ACADEMIC' ? "bg-white text-indigo-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
             >
                <Medal className="h-4 w-4" />
                Academic
             </button>
             <button 
                onClick={() => setCategory('XP')}
                className={cn(
                   "px-6 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                   category === 'XP' ? "bg-white text-amber-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
             >
                <Flame className="h-4 w-4" />
                Individual
             </button>
             <button 
                onClick={() => setCategory('CLASS')}
                className={cn(
                   "px-6 md:px-8 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                   category === 'CLASS' ? "bg-white text-emerald-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
             >
                <Users className="h-4 w-4" />
                Department
             </button>
          </div>
       </div>

       {/* ── Top 3 Podium ── */}
       {top3.length > 0 ? (
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-12 pb-8">
             {/* 2nd Place */}
             {top3[1] && (
                <div className="flex flex-col items-center order-2 md:order-1 relative group w-full md:w-64">
                   <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-slate-300 shadow-xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-3xl font-black text-slate-500 uppercase">
                      {category === 'CLASS' ? <Users className="h-10 w-10" /> : (top3[1].avatarUrl ? <img src={top3[1].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[1].name.substring(0,2))}
                   </div>
                   <Badge className="absolute -top-4 bg-slate-400 text-white font-black text-xs px-3 py-1 shadow-lg shadow-slate-400/30">#2</Badge>
                   <p className="font-bold text-lg text-slate-800 text-center mb-1 uppercase tracking-tight">{top3[1].name}</p>
                   <p className="text-slate-500 font-semibold mb-6 flex items-center gap-1.5">
                      {category === 'ACADEMIC' ? <Target className="h-3 w-3 text-emerald-500" /> : <Star className="h-3 w-3 fill-slate-400 text-slate-400" />}
                      {category === 'ACADEMIC' ? `${top3[1].score}%` : `${top3[1].xp} XP`}
                   </p>
                   <div className="w-full h-40 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-3xl shadow-inner border border-b-0 border-slate-200" />
                </div>
             )}

             {/* 1st Place */}
             {top3[0] && (
                <div className="flex flex-col items-center order-1 md:order-2 relative group w-full md:w-72 -translate-y-8 md:-translate-y-12 transition-transform hover:-translate-y-14">
                   <Crown className="h-12 w-12 text-amber-400 drop-shadow-lg mb-2 z-20" />
                   <div className="h-32 w-32 rounded-full bg-amber-100 border-4 border-amber-400 shadow-2xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-5xl font-black text-amber-600 uppercase">
                      {category === 'CLASS' ? <Trophy className="h-16 w-16" /> : (top3[0].avatarUrl ? <img src={top3[0].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[0].name.substring(0,2))}
                   </div>
                   <Badge className="absolute top-8 bg-amber-400 text-indigo-950 font-black text-xs px-4 py-1.5 shadow-lg shadow-amber-400/30">#1</Badge>
                   <p className="font-black text-2xl text-slate-900 text-center mb-1 uppercase tracking-tighter">{top3[0].name}</p>
                   <p className="text-amber-600 font-black text-xl mb-6 flex items-center gap-1.5">
                      {category === 'ACADEMIC' ? <Target className="h-5 w-5 text-emerald-500" /> : <Star className="h-5 w-5 fill-amber-500" />}
                      {category === 'ACADEMIC' ? `${top3[0].score}%` : `${top3[0].xp} XP`}
                   </p>
                   <div className="w-full h-56 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-3xl shadow-inner border border-b-0 border-amber-400 flex py-8 justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                      <Trophy className="h-20 w-20 text-amber-500 opacity-50" />
                   </div>
                </div>
             )}

             {/* 3rd Place */}
             {top3[2] && (
                <div className="flex flex-col items-center order-3 md:order-3 relative group w-full md:w-64">
                   <div className="h-20 w-20 rounded-full bg-amber-900/10 border-4 border-amber-700/50 shadow-xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-3xl font-black text-amber-800 uppercase">
                      {category === 'CLASS' ? <Users className="h-8 w-8" /> : (top3[2].avatarUrl ? <img src={top3[2].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[2].name.substring(0,2))}
                   </div>
                   <Badge className="absolute -top-4 bg-amber-700/60 text-white font-black text-xs px-3 py-1 shadow-lg shadow-amber-900/20">#3</Badge>
                   <p className="font-bold text-lg text-slate-800 text-center mb-1 uppercase tracking-tight">{top3[2].name}</p>
                   <p className="text-slate-500 font-semibold mb-6 flex items-center gap-1.5">
                      {category === 'ACADEMIC' ? <Target className="h-3 w-3 text-emerald-500" /> : <Star className="h-3 w-3 fill-amber-700/50 text-amber-700/50" />}
                      {category === 'ACADEMIC' ? `${top3[2].score}%` : `${top3[2].xp} XP`}
                   </p>
                   <div className="w-full h-32 bg-gradient-to-t from-amber-900/10 to-amber-800/5 rounded-t-3xl shadow-inner border border-b-0 border-amber-900/10" />
                </div>
             )}
          </div>
       ) : (
          <div className="py-20 text-center">
             <Trophy className="h-16 w-16 text-slate-100 mx-auto mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No data available for this category yet</p>
          </div>
       )}

       {/* ── Table List ── */}
       {rest.length > 0 && (
         <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardContent className="p-0">
               {rest.map((item, idx) => (
                  <div 
                     key={item.id} 
                     className={cn(
                        "flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors",
                        idx !== rest.length - 1 ? "border-b border-slate-100" : "",
                        (category === 'CLASS' ? item.id === user?.classId : item.id === user?.studentId) ? "bg-indigo-50/50" : ""
                     )}
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-10 text-center font-black text-xl text-slate-300">
                           #{item.rank}
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-500 overflow-hidden shrink-0 uppercase">
                           {category === 'CLASS' ? <Users className="h-6 w-6" /> : (item.avatarUrl ? <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" /> : item.name.substring(0,2))}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-base md:text-lg uppercase tracking-tight">{item.name}</p>
                           {(category === 'CLASS' ? item.id === user?.classId : item.id === user?.studentId) && <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">You / Your Class</p>}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                        {category === 'ACADEMIC' ? <Target className="h-4 w-4 text-emerald-500" /> : <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                        <span className="font-black text-slate-700">{category === 'ACADEMIC' ? item.score : item.xp}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">{category === 'ACADEMIC' ? '%' : 'XP'}</span>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
       )}
    </div>
  )
}
