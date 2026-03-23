"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, Star, Crown, Flame, Target, 
  TrendingUp, Maximize2, Minimize2, QrCode as QrIcon
} from "lucide-react"
import confetti from "canvas-confetti"
import QRCode from "react-qr-code"
import { getHallOfFameData, getLatestBonusAnnouncement } from "./actions"
import { cn } from "@/lib/utils"

export default function HallOfFameClient({ initialData }: { initialData: any }) {
  const [data, setData] = React.useState(initialData)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showQr, setShowQr] = React.useState(false)
  const [currentBonus, setCurrentBonus] = React.useState<any>(null)
  const [lastBonusId, setLastBonusId] = React.useState<string | null>(null)

  // ─── Sound System (Native Browser AudioContext) ───
  const playAchievementSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime) // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1) // A5
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.5)
    } catch (e) { console.error("Sound failed", e) }
  }

  // 1. Auto-refresh logic (SWR-like behavior every 60s)
  React.useEffect(() => {
    const dataInterval = setInterval(async () => {
      const res = await getHallOfFameData()
      if (res.success && res.podium?.[0]?.id !== data.podium?.[0]?.id) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#f97316'] })
      }
      if (res.success) setData(res)
    }, 60000)

    // 2. Fast Polling for Live Bonus Announcements (Every 3 seconds)
    const bonusInterval = setInterval(async () => {
      const bonus = await getLatestBonusAnnouncement()
      if (bonus && bonus.id !== lastBonusId) {
        setLastBonusId(bonus.id)
        setCurrentBonus(bonus)
        playAchievementSound()
        // Celebrate with special confetti
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.8 }, zIndex: 1000, colors: ['#6366f1', '#f59e0b', '#ffffff'] })
        
        // Hide after 6 seconds
        setTimeout(() => setCurrentBonus(null), 6000)
      }
    }, 3000)

    return () => {
      clearInterval(dataInterval)
      clearInterval(bonusInterval)
    }
  }, [data.podium?.[0]?.id, lastBonusId])

  // 2. Initial Page Load Confetti
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const podium = data.podium || []
  const leaderboard = data.leaderboard || []
  const departments = data.classes || []
  const news = data.news || []

  return (
    <div className={cn(
      "min-h-screen bg-[#020617] text-white selection:bg-amber-500 overflow-hidden font-sans relative",
      isFullscreen && "p-0"
    )}>
      
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-slate-950 to-amber-950/10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header Branding ── */}
      <div className="relative z-10 px-10 py-8 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
               <Trophy className="h-6 w-6 text-black fill-black/20" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Hall of Fame</h1>
               <p className="text-[10px] font-bold text-slate-500 tracking-[.3em] mt-1 uppercase">Tusma School Live Leaderboard</p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowQr(!showQr)}
              className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
               <QrIcon className="h-5 w-5 text-slate-400" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
               {isFullscreen ? <Minimize2 className="h-5 w-5 text-slate-400" /> : <Maximize2 className="h-5 w-5 text-slate-400" />}
            </button>
         </div>
      </div>

      {/* ── Main Podium Section ── */}
      <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 px-10 h-[calc(100vh-200px)]">
         
         {/* LEFT SIDE: Leaderboard 4-10 */}
         <div className="hidden lg:flex flex-col gap-6 py-12">
            <h3 className="text-xs font-black text-slate-600 tracking-[.4em] uppercase mb-4">Elite Challengers</h3>
            <div className="space-y-4">
               {leaderboard.map((s: any, i: number) => (
                 <motion.div 
                   key={s.id}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors"
                 >
                    <div className="flex items-center gap-4">
                       <span className="text-lg font-black text-slate-700">#{i + 4}</span>
                       <div>
                          <p className="font-bold text-sm">{s.firstName}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{s.className || 'Individual'}</p>
                       </div>
                    </div>
                    <span className="text-sm font-black text-indigo-400">{s.totalXp} XP</span>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* CENTER: The Cinematic Podium (Top 3) */}
         <div className="lg:col-span-2 flex items-end justify-center gap-6 pb-20 relative">
            
            {/* Rank 2 (Left) */}
            {podium[1] && <PodiumSlot student={podium[1]} rank={2} color="slate-400" height="h-[280px]" delay={0.2} />}
            
            {/* Rank 1 (Center) */}
            {podium[0] && <PodiumSlot student={podium[0]} rank={1} color="amber-500" height="h-[380px]" delay={0} isGold={true} />}
            
            {/* Rank 3 (Right) */}
            {podium[2] && <PodiumSlot student={podium[2]} rank={3} color="orange-700" height="h-[220px]" delay={0.4} />}

         </div>

         {/* RIGHT SIDE: Team Power & QR */}
         <div className="flex flex-col gap-10 py-12">
            
            {/* Team Rankings */}
            <div>
               <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-xs font-black text-slate-600 tracking-[.4em] uppercase">Team Power Rankings</h3>
               </div>
               <div className="space-y-6">
                  {departments.map((dep: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                      className="space-y-3"
                    >
                       <div className="flex justify-between items-end">
                          <span className="text-sm font-black uppercase tracking-tight">{dep.className}</span>
                          <span className="text-lg font-black text-indigo-300">{Math.round(dep.avgXp)} XP<span className="text-[10px] text-slate-600 font-bold"> avg</span></span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (dep.avgXp / 500) * 100)}%` }} // Scaled loosely for visualization
                            className="h-full bg-indigo-500 rounded-full"
                          />
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* QR Scan Incentive (Small Floating Card) */}
            <AnimatePresence>
               {showQr && (
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.9, opacity: 0 }}
                   className="mt-auto bg-amber-500 p-8 rounded-[40px] text-black shadow-2xl shadow-amber-500/20 relative"
                 >
                    <div className="bg-white p-4 rounded-3xl mb-4 flex items-center justify-center">
                       <QRCode 
                        value={`${window.location.origin}/sign-up`}
                        size={120}
                        viewBox={`0 0 120 120`}
                       />
                    </div>
                    <p className="text-base font-black text-center leading-tight">JOIN THE ACADEMY</p>
                    <p className="text-[9px] font-bold text-center opacity-70 uppercase tracking-[.2em] mt-1">Scan to Start Winning</p>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

      </div>

      {/* ── Live News Ticker (Bottom) ── */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-white/5 border-t border-white/5 flex items-center overflow-hidden z-20">
         <div className="bg-amber-500 h-full px-8 flex items-center shrink-0 z-30">
            <span className="text-black font-black text-sm tracking-widest italic uppercase">LIVE NEWS</span>
         </div>
         <div className="flex animate-marquee whitespace-nowrap gap-12 px-8">
            {news.map((item: any, i: number) => (
              <span key={i} className="text-slate-300 font-bold uppercase tracking-tight flex items-center gap-4 text-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {item.text}
              </span>
            ))}
            {/* Repeat for continuous marquee */}
            {news.map((item: any, i: number) => (
              <span key={i+'rep'} className="text-slate-300 font-bold uppercase tracking-tight flex items-center gap-4 text-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {item.text}
              </span>
            ))}
         </div>
      </div>

      {/* ── Live Bonus Achievement Overlay (Legendary Drop Style) ── */}
      <AnimatePresence>
        {currentBonus && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-10"
          >
            {/* Dark Backdrop Blur */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
            
            <div className="relative flex flex-col items-center">
               {/* Glowing Background Rays */}
               <div className="absolute inset-0 bg-indigo-500/20 blur-[150px] rounded-full animate-pulse" />
               
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="relative bg-gradient-to-br from-indigo-500 via-fuchsia-600 to-amber-500 p-[4px] rounded-[60px] shadow-[0_0_100px_rgba(99,102,241,0.5)]"
               >
                  <div className="bg-slate-950 rounded-[56px] px-16 py-12 flex flex-col items-center text-center max-w-2xl">
                     <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center mb-8">
                        <Trophy className="h-12 w-12 text-amber-500" />
                     </div>
                     
                     <h2 className="text-xl font-black text-indigo-400 uppercase tracking-[.4em] mb-2">XP GAIN DETECTED</h2>
                     <h1 className="text-7xl font-black tracking-tighter uppercase leading-none mb-6">
                        BOOM! {currentBonus.studentName}
                     </h1>
                     
                     <div className="flex items-center gap-6 mb-8">
                        <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                           +{currentBonus.amount} XP
                        </span>
                     </div>
                     
                     <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-full">
                        <p className="text-lg font-bold text-slate-400"> Reason: <span className="text-white uppercase italic">{currentBonus.reason}</span></p>
                     </div>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tailwind Marquee Styles (Inserted Inline) */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

    </div>
  )
}

function PodiumSlot({ student, rank, color, height, delay, isGold }: any) {
  return (
    <motion.div 
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, delay }}
      className="flex flex-col items-center group w-full max-w-[240px]"
    >
       {/* Avatar Circle */}
       <div className="relative mb-8">
          <div className={cn(
             "h-32 w-32 rounded-full bg-slate-900 border-[1px] border-white/10 p-2 shadow-2xl relative z-10",
             isGold && "border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)]"
          )}>
             <div className="h-full w-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-black text-indigo-400 overflow-hidden">
                {student.firstName?.charAt(0)}
             </div>
          </div>
          {/* Top Rank Badge */}
          <div className={cn(
             "absolute -top-4 -right-4 h-12 w-12 rounded-2xl flex items-center justify-center shadow-2xl border-[4px] border-[#020617] z-20",
             isGold ? "bg-amber-500 text-black" : "bg-slate-800 text-white"
          )}>
             {isGold ? <Crown className="h-6 w-6" /> : <span className="font-black">#{rank}</span>}
          </div>
          {/* Glow Aura */}
          {isGold && (
            <motion.div 
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset--10 bg-amber-500 blur-[80px] rounded-full pointer-events-none" 
            />
          )}
       </div>

       {/* Student Name */}
       <div className="text-center mb-6">
          <h4 className="text-2xl font-black uppercase tracking-tight truncate w-full">{student.firstName}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">@{student.username || 'rival'}</p>
       </div>

       {/* The Physical Podium Box */}
       <div className={cn(
          "w-full rounded-t-[40px] bg-gradient-to-b relative overflow-hidden flex flex-col items-center justify-start py-8",
          height,
          isGold ? "from-amber-600/20 to-transparent border-t-2 border-amber-500/30" : "from-white/5 to-transparent border-t border-white/10"
       )}>
          <div className="text-4xl font-black tracking-tighter mb-1 select-none opacity-20">{student.totalXp}</div>
          <div className="text-[10px] font-black tracking-[.2em] uppercase opacity-20">TOTAL XP POINTS</div>
          
          {/* Confetti Spawner hidden behind Rank1 */}
          {isGold && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />}
       </div>
    </motion.div>
  )
}
