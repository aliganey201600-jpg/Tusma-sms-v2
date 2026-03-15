"use client"

import * as React from "react"
import { Trophy, Medal, Star, Flame, Target, ArrowUp, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getLeaderboardData } from "./actions"
import { cn } from "@/lib/utils"

export default function LeaderboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [students, setStudents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchLeaderboard() {
      const data = await getLeaderboardData()
      if (data.success) setStudents(data.students)
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

  const top3 = students.slice(0, 3)
  const rest = students.slice(3)

  const myRank = students.find(s => s.id === user?.studentId)?.rank || "-"

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
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Student Leaderboard</h1>
             <p className="text-white/60 font-medium text-lg leading-relaxed">
               Compete with your peers, earn XP by watching lessons and taking quizzes, and climb to the top of the ranks!
             </p>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl shrink-0 min-w-[200px]">
             <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-2">My Current Rank</p>
             <div className="flex items-baseline gap-2">
               <span className="text-6xl font-black text-amber-400">#{myRank}</span>
             </div>
             <div className="mt-4 flex flex-col items-center gap-1">
               <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Total XP</p>
               <div className="flex items-center gap-1.5 text-xl font-black text-white">
                 <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                 {user?.totalXp || 0}
               </div>
             </div>
          </div>
       </div>

       {/* ── Top 3 Podium ── */}
       {top3.length > 0 && (
         <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-12 pb-8">
            {/* 2nd Place */}
            {top3[1] && (
               <div className="flex flex-col items-center order-2 md:order-1 relative group w-full md:w-64">
                  <div className="h-24 w-24 rounded-full bg-slate-200 border-4 border-slate-300 shadow-xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-3xl font-black text-slate-500 uppercase">
                     {top3[1].avatarUrl ? <img src={top3[1].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[1].name.substring(0,2)}
                  </div>
                  <Badge className="absolute -top-4 bg-slate-400 text-white font-black text-xs px-3 py-1 shadow-lg shadow-slate-400/30">#2</Badge>
                  <p className="font-bold text-lg text-slate-800 text-center mb-1">{top3[1].name}</p>
                  <p className="text-slate-500 font-semibold mb-6 flex items-center gap-1.5"><Star className="h-3 w-3 fill-slate-400 text-slate-400" /> {top3[1].xp} XP</p>
                  <div className="w-full h-40 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-3xl shadow-inner border border-b-0 border-slate-200" />
               </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
               <div className="flex flex-col items-center order-1 md:order-2 relative group w-full md:w-72 -translate-y-8 md:-translate-y-12 transition-transform hover:-translate-y-14">
                  <Crown className="h-12 w-12 text-amber-400 drop-shadow-lg mb-2 z-20" />
                  <div className="h-32 w-32 rounded-full bg-amber-100 border-4 border-amber-400 shadow-2xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-5xl font-black text-amber-600 uppercase">
                     {top3[0].avatarUrl ? <img src={top3[0].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[0].name.substring(0,2)}
                  </div>
                  <Badge className="absolute top-8 bg-amber-400 text-indigo-950 font-black text-xs px-4 py-1.5 shadow-lg shadow-amber-400/30">#1</Badge>
                  <p className="font-black text-2xl text-slate-900 text-center mb-1">{top3[0].name}</p>
                  <p className="text-amber-600 font-black text-lg mb-6 flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-500" /> {top3[0].xp} XP</p>
                  <div className="w-full h-56 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-3xl shadow-inner border border-b-0 border-amber-400 flex py-8 justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                     <Trophy className="h-16 w-16 text-amber-500 opacity-50" />
                  </div>
               </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
               <div className="flex flex-col items-center order-3 md:order-3 relative group w-full md:w-64">
                  <div className="h-20 w-20 rounded-full bg-amber-900/10 border-4 border-amber-700/50 shadow-xl overflow-hidden mb-4 relative z-10 flex items-center justify-center text-3xl font-black text-amber-800 uppercase">
                     {top3[2].avatarUrl ? <img src={top3[2].avatarUrl} alt="" className="h-full w-full object-cover" /> : top3[2].name.substring(0,2)}
                  </div>
                  <Badge className="absolute -top-4 bg-amber-700/60 text-white font-black text-xs px-3 py-1 shadow-lg shadow-amber-900/20">#3</Badge>
                  <p className="font-bold text-lg text-slate-800 text-center mb-1">{top3[2].name}</p>
                  <p className="text-slate-500 font-semibold mb-6 flex items-center gap-1.5"><Star className="h-3 w-3 fill-amber-700/50 text-amber-700/50" /> {top3[2].xp} XP</p>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-900/10 to-amber-800/5 rounded-t-3xl shadow-inner border border-b-0 border-amber-900/10" />
               </div>
            )}
         </div>
       )}

       {/* ── Table List ── */}
       {rest.length > 0 && (
         <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardContent className="p-0">
               {rest.map((student, idx) => (
                  <div 
                     key={student.id} 
                     className={cn(
                        "flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors",
                        idx !== rest.length - 1 ? "border-b border-slate-100" : "",
                        student.id === user?.studentId ? "bg-indigo-50/50" : ""
                     )}
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-10 text-center font-black text-xl text-slate-300">
                           #{student.rank}
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-black text-slate-500 overflow-hidden shrink-0">
                           {student.avatarUrl ? <img src={student.avatarUrl} alt="" className="h-full w-full object-cover" /> : student.name.substring(0,2)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-base md:text-lg">{student.name}</p>
                           {student.id === user?.studentId && <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">You</p>}
                        </div>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-black text-slate-700">{student.xp}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">XP</span>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
       )}
    </div>
  )
}
