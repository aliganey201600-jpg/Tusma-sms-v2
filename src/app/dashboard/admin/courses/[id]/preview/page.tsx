"use client"

import * as React from "react"
import { 
  BookOpen, 
  ChevronLeft, 
  PlayCircle, 
  Clock, 
  FileText, 
  Lock,
  CheckCircle2,
  Video,
  Zap,
  ArrowRight,
  X,
  FileDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  getCourseStructure 
} from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function CoursePreviewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeLesson, setActiveLesson] = React.useState<any>(null)

  React.useEffect(() => {
    async function load() {
      const data = await getCourseStructure(id as string)
      if (data) setCourse(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Environment...</p>
      </div>
    </div>
  )

  const totalLessons = course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0

  // If activeLesson is selected, we enter "Learning Mode" (Full Screen)
  if (activeLesson) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-500">
         {/* Navigation Bar */}
         <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-[110]">
            <div className="flex items-center gap-6">
               <Button variant="ghost" size="icon" onClick={() => setActiveLesson(null)} className="h-12 w-12 rounded-2xl hover:bg-slate-50 text-slate-400">
                  <ChevronLeft className="h-6 w-6" />
               </Button>
               <div className="h-12 w-1 bg-slate-100 rounded-full" />
               <div>
                  <h2 className="text-lg font-black text-slate-900 leading-none">{activeLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                     <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] uppercase tracking-widest h-5">Currently Syncing</Badge>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course?.name}</p>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="ghost" className="h-12 px-6 rounded-2xl text-slate-600 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-50 transition-all" onClick={() => setActiveLesson(null)}>
                  Close Experience <X className="h-4 w-4" />
               </Button>
               <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200">
                  Mark Complete
               </Button>
            </div>
         </header>

         <div className="flex-1 overflow-hidden flex flex-col lg:row-reverse lg:flex-row">
            {/* Main Content Area (Video + Details) */}
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
               <div className="max-w-6xl mx-auto p-12 space-y-12">
                  {/* High-End Video Player Container */}
                  <div className="bg-slate-950 rounded-[50px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] aspect-video relative ring-1 ring-white/10 group">
                     {activeLesson.videoUrl ? (
                        <iframe
                          src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("vimeo.com/", "player.vimeo.com/video/")}
                          className="w-full h-full transform group-hover:scale-[1.005] transition-transform duration-700"
                          allowFullScreen
                        />
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                           <div className="h-24 w-24 rounded-[30px] bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                              <Video className="h-10 w-10 text-white/10" />
                           </div>
                           <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Transmission Pending</p>
                        </div>
                     )}
                  </div>

                  {/* Tabs System for Lesson Info */}
                  <div className="space-y-8 pb-32">
                    <Tabs defaultValue="overview" className="w-full">
                       <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-auto p-0 gap-10 mb-10">
                          <TabsTrigger value="overview" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-[3px] border-transparent rounded-none px-0 py-5 font-black uppercase tracking-[0.2em] text-[10px] bg-transparent shadow-none transition-all">
                             Deep Narrative
                          </TabsTrigger>
                          <TabsTrigger value="objectives" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-[3px] border-transparent rounded-none px-0 py-5 font-black uppercase tracking-[0.2em] text-[10px] bg-transparent shadow-none transition-all">
                             Learning Vectors
                          </TabsTrigger>
                          <TabsTrigger value="vault" className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-[3px] border-transparent rounded-none px-0 py-5 font-black uppercase tracking-[0.2em] text-[10px] bg-transparent shadow-none transition-all text-amber-500">
                             Knowledge Vault
                          </TabsTrigger>
                       </TabsList>

                       <TabsContent value="overview" className="focus-visible:outline-none">
                          <Card className="border-none shadow-none bg-transparent">
                             <div className="grid grid-cols-12 gap-12">
                                <div className="col-span-12 lg:col-span-8 space-y-6">
                                   <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Concept Mastery & Applied Knowledge</h3>
                                   <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-[2] text-lg whitespace-pre-wrap">
                                      {activeLesson.content || "Experience high-fidelity education. The narrative for this unit is currently being architected by the instructor."}
                                   </div>
                                </div>
                                <div className="col-span-12 lg:col-span-4">
                                   <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                                      <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                                            {activeLesson.duration || 0}
                                         </div>
                                         <span className="text-xs font-black uppercase tracking-widest text-slate-400">Minutes Density</span>
                                      </div>
                                      <Separator className="bg-slate-50" />
                                      <div className="space-y-4">
                                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Instructor Note</p>
                                         <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-4">
                                            "Pay close attention to the second half of the demonstration, as it covers critical implementation patterns."
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </Card>
                       </TabsContent>

                       <TabsContent value="objectives" className="focus-visible:outline-none">
                          <div className="bg-indigo-600 rounded-[50px] p-16 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
                             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px] animate-pulse" />
                             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-[80px]" />
                             
                             <div className="relative z-10 max-w-3xl space-y-10 text-center mx-auto lg:text-left lg:mx-0">
                                <div className="h-20 w-20 bg-white/10 rounded-[30px] flex items-center justify-center backdrop-blur-md ring-1 ring-white/20">
                                   <Zap className="h-10 w-10 text-indigo-100" />
                                </div>
                                <div className="space-y-6">
                                   <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">What You Will Achieve</h3>
                                   <p className="text-indigo-50 text-xl font-medium leading-[1.8] whitespace-pre-wrap">
                                      {activeLesson.objectives || "Define strategic learning goals and master the core pillars of this specific curriculum segment."}
                                   </p>
                                </div>
                                <div className="flex flex-wrap gap-4 pt-4">
                                   <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-[10px] tracking-widest font-black uppercase">Critical Skill</Badge>
                                   <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-[10px] tracking-widest font-black uppercase">Advanced Concept</Badge>
                                   <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-[10px] tracking-widest font-black uppercase">Performance Vector</Badge>
                                </div>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="vault" className="focus-visible:outline-none">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between group hover:border-amber-200 transition-all duration-500 min-h-[300px]">
                                <div className="space-y-6">
                                   <div className="h-20 w-20 bg-amber-50 rounded-[30px] flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                                      <FileDown className="h-10 w-10" />
                                   </div>
                                   <div>
                                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Lesson Master-Guide</h4>
                                      <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mt-2">Comprehensive PDF documentation covering all session demonstrations and examples.</p>
                                   </div>
                                </div>
                                <div className="pt-8 flex items-center justify-between">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Format</span>
                                      <span className="text-xs font-black text-slate-900">Adobe PDF Document</span>
                                   </div>
                                   {activeLesson.attachmentUrl ? (
                                      <a href={activeLesson.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                         <Button className="h-14 px-8 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-100 font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all flex gap-2">
                                            Open Vault <ArrowRight className="h-4 w-4" />
                                         </Button>
                                      </a>
                                   ) : (
                                      <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-black text-[10px] tracking-widest h-12 px-6 rounded-2xl uppercase">Vault Locked</Badge>
                                   )}
                                </div>
                             </div>
                          </div>
                       </TabsContent>
                    </Tabs>
                  </div>
               </div>
            </div>

            {/* Premium Learning Sidebar */}
            <div className="w-full lg:w-96 border-r border-slate-100 bg-white flex flex-col z-[105]">
               <div className="p-10 border-b border-slate-50 bg-slate-50/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">Curriculum Flow</p>
                  <div className="flex items-center justify-between gap-4">
                     <h3 className="text-xl font-black text-slate-900">Total Progress</h3>
                     <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                        {Math.round(((course.sections.flatMap((s:any) => s.lessons).findIndex((l:any) => l.id === activeLesson.id) + 1) / totalLessons) * 100)}%
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                  {course.sections.map((section: any, sIdx: number) => (
                     <div key={section.id} className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                           <div className="h-5 w-5 bg-slate-900 text-white text-[9px] font-black rounded flex items-center justify-center">0{sIdx+1}</div>
                           <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{section.title}</span>
                        </div>
                        <div className="space-y-2">
                           {section.lessons.map((lesson: any) => (
                              <div 
                                key={lesson.id} 
                                onClick={() => setActiveLesson(lesson)}
                                className={cn(
                                  "group flex items-center gap-4 p-4 rounded-[24px] cursor-pointer transition-all duration-300 border-2",
                                  activeLesson.id === lesson.id 
                                    ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100" 
                                    : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50 shadow-sm"
                                )}
                              >
                                 <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                    activeLesson.id === lesson.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-50"
                                 )}>
                                    <Video className="h-4 w-4" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className={cn(
                                       "text-xs font-black truncate",
                                       activeLesson.id === lesson.id ? "text-white" : "text-slate-900"
                                    )}>{lesson.title}</p>
                                    <p className={cn(
                                       "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                                       activeLesson.id === lesson.id ? "text-indigo-200" : "text-slate-400"
                                    )}>{lesson.duration || 0}m Duration</p>
                                 </div>
                                 {activeLesson.id === lesson.id && (
                                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                  <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-800 transition-all">
                     <Clock className="h-4 w-4" /> Learning Statistics
                  </Button>
               </div>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Rest of the original overview page remains roughly the same but with style tweaks for consistency */}
      <div className="bg-slate-900 pt-16 pb-28 px-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            className="text-white/40 hover:text-white hover:bg-white/5 mb-10 gap-2 p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px]"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Curriculum Architect
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-3">
                 <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1.5 text-[9px] font-black uppercase tracking-widest">
                   {course?.category || 'General'}
                 </Badge>
                 <div className="h-1 w-8 bg-white/10 rounded-full" />
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Preview Mode</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-white">
                {course?.name}
              </h1>
              <p className="text-xl text-white/50 max-w-xl font-medium leading-relaxed">
                {course?.description || "Experience the next generation of digital learning. This course is architected for maximum retention and deep conceptual understanding."}
              </p>
              
              <div className="flex flex-wrap gap-10 pt-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-indigo-400" />
                      <span className="text-2xl font-black">{totalLessons}</span>
                   </div>
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Mastery Lessons</p>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="text-2xl font-black">{totalQuizzes}</span>
                   </div>
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Assessments</p>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span className="text-2xl font-black">Self</span>
                   </div>
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Paced Learning</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block lg:col-span-5">
              <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[60px] overflow-hidden group shadow-2xl relative ring-1 ring-white/10">
                <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150"></div>
                  <PlayCircle className="h-24 w-24 text-white/10 group-hover:text-white group-hover:scale-110 transition-all duration-700 relative z-10" />
                </div>
                <CardContent className="p-10 space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black tracking-tight">Introduction</h3>
                     <Badge variant="outline" className="border-white/20 text-white/40 rounded-full font-black text-[9px] uppercase tracking-widest">2:45m</Badge>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">A high-fidelity welcome to the curriculum structure and learning goals.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 -mt-14 pb-32">
        <div className="grid grid-cols-12 gap-12">
          {/* Main Curriculum View */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
              <Separator className="w-8 bg-indigo-500 h-0.5" />
              Syllabus Architecture
            </h2>
            
            <div className="space-y-6">
              {course?.sections?.map((section: any, idx: number) => (
                <Card key={section.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[40px] overflow-hidden bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group">
                  <CardHeader className="p-8 bg-slate-50/30 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 text-lg group-hover:text-indigo-600 transition-colors">
                        0{idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{section.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {section.lessons?.length || 0} Modules
                           </p>
                           <Separator orientation="vertical" className="h-2 bg-slate-200" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {section.quizzes?.length || 0} Assessments
                           </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {section.lessons?.map((lesson: any) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => setActiveLesson(lesson)}
                        className="group/lesson flex items-center justify-between p-5 rounded-[28px] hover:bg-indigo-50/50 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-100"
                      >
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-slate-300 group-hover/lesson:text-indigo-600 group-hover/lesson:bg-white transition-all ring-1 ring-slate-100 group-hover/lesson:ring-indigo-100">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-slate-800 tracking-tight">{lesson.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Stream • {lesson.duration || 0}m Content</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-slate-50 text-slate-300 rounded-xl group-hover/lesson:bg-indigo-600 group-hover/lesson:text-white transition-all">
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    {section.quizzes?.map((quiz: any) => (
                      <div key={quiz.id} className="group/quiz flex items-center justify-between p-5 rounded-[28px] hover:bg-amber-50/50 transition-all cursor-pointer border-2 border-transparent hover:border-amber-100">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 shadow-sm flex items-center justify-center text-slate-300 group-hover/quiz:text-amber-500 group-hover/quiz:bg-white transition-all ring-1 ring-slate-100 group-hover/quiz:ring-amber-100">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-slate-800 tracking-tight">{quiz.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assessment • {quiz.passingScore}% Pass Mark</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-slate-50 text-slate-300 rounded-xl group-hover/quiz:bg-amber-500 group-hover/quiz:text-white transition-all">
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[50px] overflow-hidden bg-white ring-1 ring-slate-100 p-2">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight">Mastery Progress</h3>
                     <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] tracking-widest">Enrolled</Badge>
                  </div>
                  <Progress value={0} className="h-4 rounded-full bg-slate-50" />
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                    <span>0% Completion Index</span>
                    <span className="text-indigo-600">0/{totalLessons + totalQuizzes} Nodes</span>
                  </div>
                </div>
                
                <div className="pt-4 space-y-4">
                  <Button className="w-full h-16 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-100 animate-pulse hover:animate-none hover:bg-indigo-700 transition-all gap-3">
                    Launch Learning Center <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="w-full h-16 rounded-3xl border-slate-100 text-slate-600 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 hover:border-slate-200 transition-all flex gap-3">
                    <FileDown className="h-4 w-4" /> Download Narrative PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white ring-1 ring-slate-100 group">
              <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Chief Investigator</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Lock className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-tight">Faculty Lead</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Primary Architect</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
