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
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  getCourseStructure 
} from "../../builder-actions"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const totalLessons = course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0
  const totalQuizzes = course?.sections?.reduce((acc: number, s: any) => acc + (s.quizzes?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Dynamic Hero Section */}
      <div className="bg-slate-900 pt-12 pb-20 px-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            className="text-white/60 hover:text-white mb-8 gap-2 p-0 h-auto"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Back to Builder
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-4 py-1 text-xs font-black uppercase tracking-widest">
                {course?.category || 'General'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">{course?.name}</h1>
              <p className="text-xl text-white/60 max-w-xl font-medium leading-relaxed">
                {course?.description || "Master the concepts and skills of this curriculum through our structured learning path and assessments."}
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Video className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-black tracking-widest">Lessons</p>
                    <p className="text-sm font-bold">{totalLessons} Video Units</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-black tracking-widest">Quizzes</p>
                    <p className="text-sm font-bold">{totalQuizzes} Assessments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-black tracking-widest">Estimated</p>
                    <p className="text-sm font-bold">Self-Paced</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[40px] overflow-hidden">
                <div className="aspect-video bg-indigo-500/20 flex items-center justify-center group cursor-pointer">
                  <PlayCircle className="h-20 w-20 text-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
                </div>
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-lg font-black tracking-tight">Course Introduction</h3>
                  <p className="text-sm text-white/60">Watch a quick overview of what you'll learn in this course.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10 pb-24">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Curriculum View */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              Detailed Curriculum
            </h2>
            
            <div className="space-y-4">
              {course?.sections?.map((section: any, idx: number) => (
                <Card key={section.id} className="border-none shadow-sm rounded-[30px] overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-slate-900">{section.title}</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {section.lessons?.length || 0} Lessons • {section.quizzes?.length || 0} Quizzes
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {section.lessons?.map((lesson: any) => (
                      <div 
                        key={lesson.id} 
                        onClick={() => setActiveLesson(lesson)}
                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                            <Video className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{lesson.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">Video Lesson • {lesson.duration || 0} Minutes</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="bg-slate-100 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white">
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {section.quizzes?.map((quiz: any) => (
                      <div key={quiz.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-amber-500 transition-colors">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{quiz.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">Knowledge Check • {quiz.passingScore}% to pass</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="bg-slate-100 text-slate-400 rounded-lg group-hover:bg-amber-500 group-hover:text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Course Progress</h3>
                  <Progress value={0} className="h-3 rounded-full bg-slate-100" />
                  <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 tracking-widest">
                    <span>0% Complete</span>
                    <span>0/{totalLessons + totalQuizzes} items</span>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 gap-2">
                    Start Learning <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-100 text-slate-600 font-bold hover:bg-slate-50">
                    Syllabus Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[30px] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="p-6 border-b border-slate-50">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Faculty Member</p>
                    <p className="text-xs text-slate-500 font-medium">Department Lead</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!activeLesson} onOpenChange={() => setActiveLesson(null)}>
        <DialogContent className="max-w-4xl p-0 bg-white border-none rounded-[40px] overflow-hidden shadow-2xl">
          <div className="bg-slate-900 aspect-video flex items-center justify-center relative">
            {activeLesson?.videoUrl ? (
              <iframe
                src={activeLesson.videoUrl.replace("watch?v=", "embed/").replace("vimeo.com/", "player.vimeo.com/video/")}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                   <Video className="h-10 w-10 text-white/20" />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No Video Content Provided</p>
              </div>
            )}
          </div>
          <div className="p-10 space-y-6 overflow-y-auto max-h-[40vh]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                 <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] uppercase tracking-widest">Video Lesson</Badge>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {activeLesson?.duration || 0} Minutes</span>
              </div>
              <DialogTitle className="text-3xl font-black text-slate-900">{activeLesson?.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-slate max-w-none">
               <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                 {activeLesson?.content || "No narrative content provided for this lesson."}
               </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
