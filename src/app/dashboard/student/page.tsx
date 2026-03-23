"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Star,
  Zap,
  Award,
  Target,
  Flame,
  ChevronRight,
  PlayCircle,
  Bell,
  UserCircle, 
  Sparkles, 
  Trophy, 
  Calendar,
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  ShoppingCart,
  Users, 
  Share2, 
  Loader2, 
  Image as ImageIcon
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { ShareRankCard } from "@/components/dashboard/ShareRankCard"
import { 
  getStudentDashboardOverview, 
  verifyStudentId, 
  redeemXpForShieldAction, 
  claimShareBonus 
} from "./actions"
import { updateStudentSocialProfile } from "@/app/student/[username]/actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatePresence, motion } from "framer-motion"
import { fetchStudentCourses } from "./courses/actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

// ─── Fallback Mock Data ────────────────────────────────────────────────────────
const mockCourses = [
  { name: "Mathematics", progress: 65, grade: "B+", color: "violet" },
  { name: "Physics", progress: 42, grade: "B", color: "blue" },
  { name: "Computer Science", progress: 88, grade: "A", color: "emerald" },
  { name: "History", progress: 55, grade: "B-", color: "amber" },
]

const deadlines = [
  { title: "Algebra Quiz", due: "Tomorrow", urgency: "high", subject: "Math" },
  { title: "Physics Lab Report", due: "Friday", urgency: "medium", subject: "Physics" },
  { title: "CS Project Phase 2", due: "Next Wed", urgency: "low", subject: "CS" },
]

const recentGrades = [
  { subject: "Computer Science", title: "Mid-term Exam", grade: "A", score: "94/100", date: "Mar 10" },
  { subject: "Mathematics", title: "Chapter 5 Test", grade: "B+", score: "87/100", date: "Mar 7" },
  { subject: "Physics", title: "Lab Practical", grade: "B", score: "80/100", date: "Mar 5" },
]

export default function StudentDashboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const firstName = user?.firstName || (userLoading ? null : "Student")
  const [verifying, setVerifying] = React.useState(false)
  const [studentIdInput, setStudentIdInput] = React.useState("")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)

  const [realCourses, setRealCourses] = React.useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = React.useState(true)
  const [overview, setOverview] = React.useState<any>(null)
  const [loadingOverview, setLoadingOverview] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (user?.id) {
        try {
          // Fetch courses
          const courseRes = await fetchStudentCourses(user.id)
          if (courseRes.success && courseRes.courses) {
            setRealCourses(courseRes.courses)
          }
          setLoadingCourses(false)

          // Fetch overview
          const overviewData = await getStudentDashboardOverview(user.id)
          if (overviewData) {
            setOverview(overviewData)
          }
          setLoadingOverview(false)
        } catch (error) {
          console.error("Failed to load dashboard data", error)
          setLoadingCourses(false)
          setLoadingOverview(false)
        }
      }
    }
    if (user && !userLoading) {
      loadData()
    }
  }, [user, userLoading])

  const displayCourses = realCourses.length > 0 ? realCourses : mockCourses

  // Canvas-confetti celebration logic
  React.useEffect(() => {
    if (!loadingCourses && displayCourses.length > 0) {
      const hasPerfectCourse = displayCourses.some((c: any) => c.progress === 100)
      if (hasPerfectCourse) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#D946EF', '#22C55E']
        })
      }
    }
  }, [loadingCourses, displayCourses])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentIdInput.trim()) return toast.error("Please enter your Student ID.")
    
    setVerifying(true)
    try {
      const res = await verifyStudentId(user?.id || "", studentIdInput)
      if (res.success) {
        toast.success("Congratulations! Your account has been verified.")
        window.location.reload()
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error("An error occurred.")
    } finally {
      setVerifying(false)
    }
  }

  // Profile Edit State
  const [profileForm, setProfileForm] = React.useState({
    username: user?.username || "",
    bio: user?.bio || "",
    coverImage: user?.coverImage || ""
  })
  const [savingProfile, setSavingProfile] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        bio: user.bio || "",
        coverImage: user.coverImage || ""
      })
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user?.studentId) return toast.error("Please verify your account first!")
    setSavingProfile(true)
    try {
      const res = await updateStudentSocialProfile(user.studentId, profileForm)
      if (res.success) {
        toast.success(res.message)
        window.location.reload()
      } else {
        toast.error(res.error || "Update failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setSavingProfile(false)
    }
  }

  if (userLoading || loadingOverview) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-48 w-full bg-slate-100 rounded-[36px]" />
        <div className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-3xl" />)}
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="pb-24 pt-4 md:py-8 px-4 md:px-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── App-style Header for Mobile & Desktop ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[36px] p-6 md:p-10 text-white shadow-2xl shadow-violet-200 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/10 backdrop-blur-md">
              <SparklesIcon className="h-3 w-3 text-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Student Portal</span>
            </div>
            {!loadingOverview && overview?.currentStreak > 0 && (
              <div className="flex items-center gap-2">
                <StreakFlame streak={overview.currentStreak} />
                {overview?.streakShields > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500 border border-indigo-400/50 shadow-lg text-white">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black">{overview.streakShields}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter shrink-0 break-words max-w-full">
            Welcome, <br className="md:hidden" />
            <span className="text-yellow-300">{firstName}</span>
          </h1>
          <p className="text-violet-100 font-medium text-sm md:text-base max-w-md leading-relaxed">
            You have <strong className="text-white">{loadingOverview ? "..." : (overview?.pendingAssignments || 0)} assignments</strong> due soon. Your progress is looking excellent. Keep it up!
          </p>
        </div>

        {/* Action Button for mobile header */}
        <div className="relative z-10 mt-2 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-3">
          <Button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-full md:w-auto rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold h-12 px-6 shadow-xl shadow-amber-900/20 border-none group transition-transform active:scale-95"
          >
            <Share2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Share My Rank
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-indigo-700 font-bold h-12 px-6 shadow-lg transition-all">
                <UserCircle className="mr-2 h-5 w-5" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-950 border-white/10 rounded-[2.5rem] text-white overflow-hidden p-0">
               <div className="p-8 space-y-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[60px] blur-2xl" />
                  <DialogHeader className="text-left space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-1">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none">Gamer Profile</DialogTitle>
                    <p className="text-slate-500 text-sm font-medium">Complete your profile to earn +200 XP! 🏆</p>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Unique Username</label>
                      <Input 
                        placeholder="gamer_pro_2024"
                        className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-indigo-500"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Your Bio / Motto</label>
                      <Textarea 
                        placeholder="Consistency is key to mastery. 🔥"
                        className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:ring-indigo-500"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-1">Cover Image URL</label>
                      <div className="relative">
                        <Input 
                          placeholder="https://images.unsplash.com/..."
                          className="bg-white/5 border-white/10 h-12 rounded-xl pl-10 focus:ring-indigo-500"
                          value={profileForm.coverImage}
                          onChange={(e) => setProfileForm({ ...profileForm, coverImage: e.target.value })}
                        />
                        <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-xl shadow-indigo-900/40 transition-transform active:scale-95 group disabled:opacity-50"
                      onClick={handleUpdateProfile}
                      disabled={savingProfile}
                    >
                      {savingProfile ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                      Save Multi-player Profile
                    </Button>
                  </div>
               </div>
            </DialogContent>
          </Dialog>

          <Button className="w-full md:w-auto rounded-2xl bg-white text-violet-700 hover:bg-slate-50 font-black h-12 px-6 shadow-lg shadow-black/10" asChild>
            <Link href="/dashboard/student/courses" scroll={false}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Continue Learning
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Stats Cards (Horizontal Scroll on Mobile) ── */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 no-scrollbar snap-x">
        <StatCard
          title="User Level"
          value={loadingOverview ? "..." : (user?.level || overview?.level || 1).toString()}
          icon={<Zap className="h-5 w-5 md:h-6 md:w-6" />}
          color="amber"
          href="#"
        />
        <StatCard
          title="Total XP"
          value={loadingOverview ? "..." : (overview?.totalXp || 0).toLocaleString()}
          icon={<Star className="h-5 w-5 md:h-6 md:w-6" />}
          color="emerald"
          href="/dashboard/student/leaderboard"
        />
        <StatCard
          title="Courses"
          value={loadingOverview ? "..." : (overview?.coursesCount || realCourses.length || 0).toString()}
          icon={<BookOpen className="h-5 w-5 md:h-6 md:w-6" />}
          color="violet"
          href="/dashboard/student/courses"
        />
        <StatCard
          title="Assignments"
          value={loadingOverview ? "..." : (overview?.pendingAssignments || 0).toString()}
          icon={<ClipboardList className="h-5 w-5 md:h-6 md:w-6" />}
          color="blue"
          href="/dashboard/student/assignments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* ── Left Column: Courses ── */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Courses</h2>
              <p className="text-sm text-slate-500 font-medium">Semester progress</p>
            </div>
            <Button variant="ghost" className="text-violet-600 font-bold hidden md:flex" asChild>
              <Link href="/dashboard/student/courses">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {loadingCourses ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[28px]" />)
            ) : (
              displayCourses.slice(0, 4).map((course, i) => (
                <CourseAppCard key={course.id || i} course={course} />
              ))
            )}
          </div>
          
          {/* Mobile view all button */}
          <Button variant="outline" className="w-full rounded-2xl h-14 font-bold border-slate-200 text-slate-700 md:hidden" asChild>
            <Link href="/dashboard/student/courses">View All Courses</Link>
          </Button>

        </div>

        {/* ── Right Column: Deadlines & Activity ── */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Assignments</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Upcoming deadlines</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-4">
              {loadingOverview ? (
                [1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)
              ) : (overview?.recentAssignments?.length > 0 || deadlines.length > 0) ? (
                (overview?.recentAssignments || deadlines).slice(0, 3).map((task: any, i: number) => (
                  <DeadlineItem key={i} task={task} />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No assignments due soon</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[32px] overflow-hidden bg-white bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-black text-white">Recent Grades</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Latest results</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-700 text-white" asChild>
                <Link href="/dashboard/student/grades" scroll={false}>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-6 md:px-8 pb-8 space-y-5">
              {loadingOverview ? (
                [1,2].map(i => <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-2xl" />)
              ) : (overview?.recentResults?.length > 0) ? (
                overview.recentResults.slice(0, 2).map((g: any, i: number) => (
                  <GradeDarkItem key={i} grade={g} />
                ))
              ) : (
                recentGrades.slice(0, 2).map((g, i) => (
                  <GradeDarkItem key={i} grade={g} />
                ))
              )}
            </CardContent>
          </Card>

          {/* XP Economy: Streak Shield Shop */}
          <Card className="border-none shadow-xl shadow-indigo-100/50 rounded-[32px] overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-1">
             <div className="bg-white/5 backdrop-blur-3xl p-6 md:p-8 rounded-[30px] h-full space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-[22px] bg-white/10 flex items-center justify-center border border-white/20">
                      <ShieldCheck className="h-6 w-6 text-white" />
                   </div>
                   <div>
                     <h3 className="font-black text-xl leading-tight">Streak Shield</h3>
                     <p className="text-xs text-white/60 font-medium">Protect your hard-earned streak!</p>
                     {/* Dynamic Shield Count */}
                     <p className={cn(
                       "text-[10px] font-black uppercase tracking-wider mt-1.5 px-2 py-0.5 rounded-md w-fit",
                       (overview?.streakShields || 0) > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"
                     )}>
                       {(overview?.streakShields || 0) > 0 
                         ? `Active Shields: ${overview.streakShields} 🛡️` 
                         : "No Shields active. Protect your streak now!"}
                     </p>
                   </div>
                </div>

                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-center text-sm font-bold bg-white/10 p-4 rounded-2xl border border-white/5">
                      <span className="text-white/70">Cost per Shield</span>
                      <span className="text-yellow-300 flex items-center gap-1.5 font-black">
                        <Star className="h-4 w-4 fill-yellow-300" />
                        250 XP
                      </span>
                   </div>

                   <Button 
                    variant="secondary"
                    className="w-full h-14 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 font-black shadow-xl shadow-indigo-900/40 transition-transform active:scale-95 group"
                    onClick={async () => {
                      if (!user?.studentId) return toast.error("Please verify your account first!");
                      const res = await redeemXpForShieldAction(user.studentId);
                      if (res.success) {
                        toast.success("Woohoo! Streak Shield added to your inventory! 🛡️");
                        window.location.reload(); 
                      } else {
                        toast.error(res.error);
                      }
                    }}
                   >
                     <ShoppingCart className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                     Redeem XP Now
                   </Button>
                </div>
             </div>
          </Card>

        </div>
      </div>
    </div>
    
    <AnimatePresence>
      {isShareModalOpen && (
        <ShareRankCard 
          student={{ 
            ...user?.student, 
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  )
}

function StatCard({ title, value, icon, color, href }: any) {
  const colorMap: any = {
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  }
  return (
    <Link href={href} className="inline-block md:block min-w-[140px] md:min-w-0 snap-center">
      <Card className="border-none shadow-lg shadow-slate-100/50 rounded-[28px] p-5 md:p-6 group hover:scale-[1.03] transition-transform bg-white cursor-pointer h-full border border-slate-50">
        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-[18px] flex items-center justify-center mb-3 md:mb-4", colorMap[color])}>
          {icon}
        </div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </Card>
    </Link>
  )
}

function CourseAppCard({ course }: any) {
  const cColor = course.color || "violet"
  const colorMap: Record<string, string> = {
    violet: "from-violet-500 to-purple-600 shadow-violet-200",
    blue: "from-blue-500 to-cyan-500 shadow-blue-200",
    emerald: "from-emerald-400 to-teal-500 shadow-emerald-200",
    amber: "from-amber-400 to-orange-500 shadow-amber-200",
    rose: "from-rose-400 to-red-500 shadow-rose-200",
    lime: "from-lime-400 to-green-500 shadow-lime-200",
  }
  const bgClass = colorMap[cColor] || colorMap.violet

  // Realistic mock progress if real data has 0
  const progress = course.progress > 0 ? course.progress : Math.floor(Math.random() * 60) + 15

  return (
    <Link href={`/dashboard/student/courses/${course.id || '#'}`}>
      <Card className="border-none shadow-xl rounded-[32px] p-6 hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group min-h-[160px] flex flex-col justify-between" style={{ backgroundColor: "#ffffff" }}>
        
        {/* The cool colored background shape */}
        <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-bl-[60px] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity", bgClass)} />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight">{course.name}</h4>
            {course.teacher && <p className="text-xs font-bold text-slate-400">{course.teacher}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white", bgClass)}>
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="relative z-10 mt-6 md:mt-8 space-y-2.5">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", bgClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function DeadlineItem({ task }: any) {
  const urgencyMap: any = {
    high: { icon: "bg-red-50 text-red-500", text: "text-red-600" },
    medium: { icon: "bg-orange-50 text-orange-500", text: "text-orange-600" },
    low: { icon: "bg-slate-50 text-slate-500", text: "text-slate-500" },
  }
  const u = urgencyMap[task.urgency || 'low']
  return (
    <div className="flex items-center gap-4 group">
      <div className={cn("h-12 w-12 rounded-[20px] flex items-center justify-center shrink-0 transition-colors", u.icon)}>
        <Clock className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{task.subject}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-xs font-black", u.text)}>{task.due}</p>
      </div>
    </div>
  )
}

function GradeDarkItem({ grade }: any) {
  return (
    <div className="flex items-center gap-4 group border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{grade.title}</p>
        <p className="text-[11px] font-semibold text-slate-400">{grade.subject}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm mb-1">
          {grade.grade}
        </div>
        <p className="text-[10px] font-bold text-slate-500 block">{grade.date}</p>
      </div>
    </div>
  )
}

function StreakFlame({ streak }: { streak: number }) {
  if (streak < 1) return null;
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [1, 1.1, 1], opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 border border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.6)] backdrop-blur-md"
    >
      <Flame className="h-4 w-4 text-white fill-white" />
      <span className="text-xs font-black text-white">{streak} Day Streak!</span>
    </motion.div>
  )
}
