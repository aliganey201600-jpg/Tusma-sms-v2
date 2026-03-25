"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  UserCircle, 
  Sparkles, 
  Loader2, 
  ImageIcon, 
  Share2, 
  ShieldCheck, 
  ShoppingCart,
  Star
} from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence } from "framer-motion"
import { ShareRankCard } from "@/components/dashboard/ShareRankCard"
import { 
  verifyStudentId, 
  redeemXpForShieldAction 
} from "./actions"
import { updateStudentSocialProfile } from "@/app/student/[username]/actions"
import { cn } from "@/lib/utils"

interface StudentDashboardClientProps {
  user: any
  overview: any
}

export function StudentDashboardClient({ user, overview }: StudentDashboardClientProps) {
  const router = useRouter()
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [studentIdInput, setStudentIdInput] = React.useState("")
  
  const [profileForm, setProfileForm] = React.useState({
    username: user?.username || "",
    bio: user?.bio || "",
    coverImage: user?.coverImage || ""
  })

  const handleUpdateProfile = async () => {
    if (!user?.studentId) return toast.error("Fadlan marka hore xaqiiji account-kaaga!")
    setSavingProfile(true)
    try {
      const res = await updateStudentSocialProfile(user.studentId, profileForm)
      if (res.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error(res.error || "Update failed")
      }
    } catch (err) {
      toast.error("Cillad ayaa dhacday")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentIdInput.trim()) return toast.error("Fadlan gali Student ID-gaaga.")
    
    setVerifying(true)
    try {
      const res = await verifyStudentId(user?.id || "", studentIdInput)
      if (res.success) {
        toast.success("Hambalyo! Account-kaaga waa la xaqiijiyay.")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error("Cillad ayaa dhacday")
    } finally {
      setVerifying(false)
    }
  }

  const handleRedeemShield = async () => {
    if (!user?.studentId) return toast.error("Fadlan marka hore xaqiiji account-kaaga!");
    const res = await redeemXpForShieldAction(user.studentId);
    if (res.success) {
      toast.success("Woohoo! Streak Shield ayaa lagu daray inventory-gaaga! 🛡️");
      router.refresh(); 
    } else {
      toast.error(res.error);
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <Button 
          onClick={() => setIsShareModalOpen(true)}
          className="w-full md:w-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold h-11 px-6 shadow-sm border-none group transition-all"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share My Rank
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-11 px-6 shadow-sm transition-all">
              <UserCircle className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-slate-200 rounded-3xl text-slate-900 p-0 overflow-hidden shadow-2xl">
             <div className="p-8 space-y-6">
                <DialogHeader className="text-left space-y-1">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">Gamer Profile</DialogTitle>
                  <p className="text-slate-500 text-sm">Complete your profile to earn +200 XP! 🏆</p>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Username</label>
                    <Input 
                      placeholder="gamer_pro_2024"
                      className="bg-slate-50 border-slate-200 h-11 rounded-xl focus:ring-indigo-500"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Bio / Motto</label>
                    <Textarea 
                      placeholder="Consistency is key to mastery. 🔥"
                      className="bg-slate-50 border-slate-200 rounded-xl min-h-[100px] focus:ring-indigo-500"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Cover Image URL</label>
                    <div className="relative">
                      <Input 
                        placeholder="https://images.unsplash.com/..."
                        className="bg-slate-50 border-slate-200 h-11 rounded-xl pl-10 focus:ring-indigo-500"
                        value={profileForm.coverImage}
                        onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                      />
                      <ImageIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Save Profile
                </Button>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareRankCard 
            student={{ 
              ...user, 
              id: user?.studentId || "",
              globalRank: overview?.globalRank || 1, 
              totalXp: overview?.totalXp || 0,
              username: user?.username || user?.firstName?.toLowerCase() || 'student'
            }} 
            onClose={() => setIsShareModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function StreakShieldShop({ overview, user }: { overview: any, user: any }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleRedeem = async () => {
    if (!user?.studentId) return toast.error("Please verify your account first!");
    setLoading(true)
    const res = await redeemXpForShieldAction(user.studentId);
    if (res.success) {
      toast.success("Woohoo! Streak Shield added! 🛡️");
      router.refresh(); 
    } else {
      toast.error(res.error);
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
           </div>
           <div>
             <h3 className="font-bold text-lg text-slate-900">Streak Shield</h3>
             <p className="text-xs text-slate-500 font-medium">Protect your hard-earned streak!</p>
             <p className={cn(
               "text-[10px] font-bold uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md w-fit",
               (overview?.streakShields || 0) > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
             )}>
               {(overview?.streakShields || 0) > 0 
                 ? `Active Shields: ${overview.streakShields} 🛡️` 
                 : "No Shields active."}
             </p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-slate-500 text-xs">Cost per Shield</span>
              <span className="text-indigo-600 flex items-center gap-1.5 font-bold">
                <Star className="h-4 w-4 fill-indigo-600" />
                250 XP
              </span>
           </div>

           <Button 
            variant="outline"
            className="w-full h-11 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all group"
            onClick={handleRedeem}
            disabled={loading}
           >
             {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
             Redeem XP Now
           </Button>
        </div>
    </div>
  )
}
