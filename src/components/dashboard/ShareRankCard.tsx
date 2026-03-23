"use client"

import * as React from "react"
import { 
  Trophy, Share2, Star, Github as PartyPopper, 
  Flame, Award, CheckCircle2, X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { claimShareBonus } from "@/app/dashboard/student/actions"
import { toast } from "sonner"

interface ShareRankCardProps {
  student: any
  onClose: () => void
}

export function ShareRankCard({ student, onClose }: ShareRankCardProps) {
  const [isSharing, setIsSharing] = React.useState(false)
  const rank = student.globalRank || 1
  
  // Decide Theme based on Rank
  let theme = {
    name: "Bronze",
    bg: "from-orange-800 to-orange-950",
    border: "border-orange-500/30",
    accent: "text-orange-400",
    glow: "shadow-orange-500/20"
  }

  if (rank === 1) {
    theme = {
      name: "Gold",
      bg: "from-amber-500 via-yellow-600 to-amber-900",
      border: "border-yellow-400/50",
      accent: "text-yellow-300",
      glow: "shadow-yellow-500/40"
    }
  } else if (rank <= 3) {
    theme = {
      name: "Silver",
      bg: "from-slate-400 via-slate-500 to-slate-800",
      border: "border-slate-300/50",
      accent: "text-slate-200",
      glow: "shadow-slate-300/30"
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    const shareUrl = `${window.location.origin}/student/${student.username || student.id}`
    const shareText = `I'm currently Rank #${rank} at Tusma School! 🔥 Can you beat my score of ${student.totalXp} XP?`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Tusma School Rank",
          text: shareText,
          url: shareUrl,
        })
        
        // Claim Bonus
        const res = await claimShareBonus(student.id)
        if (res.success) {
          toast.success(res.message)
          // Instant UI Update
          setTimeout(() => window.location.reload(), 1500)
        } else {
          toast.error(res.error || "Claim failed")
        }
      } else {
        // Fallback: Copy to Clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        toast.info("Link copied! Share it on WhatsApp to claim your bonus. 🛡️")
        
        // Auto-claim bonus on fallback (since we can't detect actual post)
        const res = await claimShareBonus(student.id)
        if (res.success) {
          toast.success(res.message)
          setTimeout(() => window.location.reload(), 1500)
        }
      }
    } catch (err) {
      console.log("Share failed:", err)
    } finally {
      setIsSharing(false)
      onClose()
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative max-w-md w-full">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-8 w-8" />
        </button>

        <Card className={cn(
          "overflow-hidden border-2 bg-gradient-to-br rounded-[40px] shadow-2xl relative",
          theme.bg, theme.border, theme.glow
        )}>
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 pointer-events-none" />
           <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 blur-[100px] rounded-full" />
           
           <CardContent className="p-8 md:p-12 text-center relative z-10">
              {/* Header Icon */}
              <motion.div 
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                className="inline-flex h-24 w-24 rounded-[32px] bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center mb-8 shadow-2xl"
              >
                  <Trophy className={cn("h-12 w-12", theme.accent)} />
              </motion.div>

              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                 Achievement Unlocked!
              </h2>
              <p className="text-white/60 font-bold tracking-widest text-[10px] uppercase mb-8">
                {theme.name} Tier Rank • Global Leaderboard
              </p>

              {/* Rank Display */}
              <div className="bg-black/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 mb-8 relative group overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Rank</span>
                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500/20" />
                 </div>
                 <div className="text-7xl font-black text-white tracking-tighter leading-none mb-4">
                    #{rank}
                 </div>
                 <div className="flex items-center gap-2 justify-center py-2 px-4 bg-white/10 rounded-xl w-fit mx-auto">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-black text-white">{student.totalXp} XP</span>
                 </div>
              </div>

              {/* Bonus Hint */}
              <div className="flex items-center gap-3 justify-center mb-10">
                 <div className="h-1px flex-1 bg-white/10" />
                 <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                   <Award className="h-3.5 w-3.5" />
                   First Share: +50 XP
                 </span>
                 <div className="h-1px flex-1 bg-white/10" />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                 <Button 
                   onClick={handleShare}
                   disabled={isSharing}
                   className="w-full h-16 rounded-[24px] bg-white text-slate-950 font-black text-lg hover:bg-slate-100 shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 group"
                 >
                   {isSharing ? (
                     <span className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent" />
                   ) : (
                     <>
                       <Share2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                       Share My Rank Now
                     </>
                   )}
                 </Button>
                 <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                   Shares to WhatsApp, Facebook & X
                 </p>
              </div>
           </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
