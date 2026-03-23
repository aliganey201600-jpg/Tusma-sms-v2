"use client"

import * as React from "react"
import { 
  Users, Search, Star, Trophy, Sparkles, 
  Target, GraduationCap, ChevronRight, CheckCircle2,
  XCircle, Zap, Shield
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchStudents, awardTeacherBonus } from "./actions"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TeacherRemotePage() {
  const [query, setQuery] = React.useState("")
  const [students, setStudents] = React.useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSearching, setIsSearching] = React.useState(false)
  const [customAmount, setCustomAmount] = React.useState("")

  // Real-time search
  React.useEffect(() => {
    if (query.length < 2) {
      setStudents([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchStudents(query)
      setStudents(results)
      setIsSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const handleAward = async (amount: number, reason: string) => {
    if (!selectedStudent) return
    
    setIsLoading(true)
    const res = await awardTeacherBonus(selectedStudent.id, amount, reason)
    setIsLoading(false)

    if (res.success) {
      toast.success(`AWARDED! +${amount} XP sent to ${selectedStudent.firstName}.`, {
        description: "It will now appear on the Hall of Fame TV!",
        duration: 5000,
        position: 'top-center'
      })
      // Reset after success
      setSelectedStudent(null)
      setQuery("")
      setCustomAmount("")
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 font-sans p-4 md:p-10 flex flex-col items-center">
      
      {/* ── Mobile Branding Header ── */}
      <div className="w-full max-w-md flex flex-col items-center mb-10 text-center">
         <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-fuchsia-600 rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] mb-4">
            <Zap className="h-8 w-8 text-white fill-white/20" />
         </div>
         <h1 className="text-3xl font-black tracking-tighter uppercase italic">Teacher Remote</h1>
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[.3em] mt-1 italic">Tusma XP Control Unit</p>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* ── Search Mode ── */}
        {!selectedStudent ? (
          <div className="space-y-6">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input 
                  placeholder="Find student (e.g. Liban)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 rounded-[20px] pl-12 h-16 text-lg font-bold focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600 shadow-2xl"
                />
                {isSearching && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                )}
             </div>

             <div className="space-y-3">
               <AnimatePresence>
                 {students.map((s) => (
                   <motion.div 
                     key={s.id}
                     initial={{ x: -10, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: 10, opacity: 0 }}
                     onClick={() => setSelectedStudent(s)}
                     className="bg-slate-900 border border-slate-800/50 p-4 rounded-[24px] flex items-center justify-between cursor-pointer hover:bg-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <Avatar className="h-12 w-12 border border-white/5 ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
                            <AvatarFallback className="bg-slate-800 text-white font-black">{s.firstName?.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div>
                            <p className="font-black text-slate-100">{s.firstName} {s.lastName}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">@{s.username || 'noid'}</p>
                         </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-700" />
                   </motion.div>
                 ))}
               </AnimatePresence>
               {query.length >= 2 && students.length === 0 && !isSearching && (
                  <p className="text-center text-slate-600 font-bold py-8 italic uppercase text-[10px] tracking-widest">Target not found in Academy Database</p>
               )}
             </div>
          </div>
        ) : (
          /* ── Award Mode ── */
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
             {/* Selected HUD */}
             <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[40px] flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 scale-150">
                   <Target className="h-24 w-24 text-indigo-500" />
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-6 left-6 h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
                <div className="h-20 w-20 rounded-full bg-slate-800 border-2 border-indigo-500 mb-4 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                   {selectedStudent.firstName?.charAt(0)}
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedStudent.firstName}</h2>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-[10px] font-black bg-indigo-500 px-3 py-1 rounded-full text-white uppercase tracking-widest">LVL {selectedStudent.level || 1}</span>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedStudent.totalXp} XP CURRENT</span>
                </div>
             </div>

             {/* Preset Options */}
             <div className="grid grid-cols-1 gap-4">
                <BonusButton 
                  label="Good Participation 🙋‍♂️" 
                  xp={20} 
                  reason="Participation"
                  onClick={() => handleAward(20, "Participation")} 
                  isLoading={isLoading}
                />
                <BonusButton 
                  label="Teamwork / Helping 🤝" 
                  xp={50} 
                  reason="Teamwork"
                  onClick={() => handleAward(50, "Teamwork")} 
                  isLoading={isLoading}
                />
                <BonusButton 
                  label="Exceptional Work 🌟" 
                  xp={100} 
                  reason="Exceptional Effort"
                  onClick={() => handleAward(100, "Exceptional Effort")} 
                  isLoading={isLoading}
                />
             </div>

             {/* Custom Input */}
             <div className="space-y-3 pt-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Manual Bonus Input</p>
                <div className="flex gap-2">
                   <Input 
                      type="number" 
                      placeholder="XP" 
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="bg-slate-900 border-slate-800 rounded-[20px] h-14 font-black text-xl text-center"
                   />
                   <Button 
                      disabled={isLoading || !customAmount} 
                      onClick={() => handleAward(Number(customAmount), "Manual Bonus")}
                      className="h-14 bg-white text-black font-black hover:bg-slate-200 rounded-[20px] px-8 uppercase"
                   >
                      Send
                   </Button>
                </div>
             </div>
          </motion.div>
        )}

      </div>

      {/* ── Background Subtle Aesthetics ── */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />

    </div>
  )
}

function BonusButton({ label, xp, onClick, isLoading }: any) {
  return (
    <button 
      disabled={isLoading}
      onClick={onClick}
      className="group bg-slate-900 border border-white/5 h-20 rounded-[28px] px-8 flex items-center justify-between hover:bg-white hover:text-black transition-all active:scale-[0.97] disabled:opacity-50"
    >
       <div className="text-left">
          <p className="font-black text-sm uppercase tracking-tight group-hover:text-black">{label}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Perk</p>
       </div>
       <div className="flex flex-col items-center">
          <span className="text-xl font-black group-hover:text-indigo-600">+{xp}</span>
          <span className="text-[8px] font-black uppercase group-hover:text-black/50">Bonus XP</span>
       </div>
    </button>
  )
}
