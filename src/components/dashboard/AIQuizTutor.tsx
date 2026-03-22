"use client"

import React from "react"
import { useChat } from "ai/react"
import { Sparkles, MessageCircle, Send, X, Bot, HelpCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface AIQuizTutorProps {
  questionText: string
  lessonObjectives: string
}

export function AIQuizTutor({ questionText, lessonObjectives }: AIQuizTutorProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      question_text: questionText,
      lesson_objectives: lessonObjectives,
    },
  })

  // Scroll to bottom on new message
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight)
    }
  }, [messages, isLoading])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95 group shadow-lg backdrop-blur-sm"
          title="Tutor Mode"
        >
          <Sparkles className="h-4 w-4 text-indigo-400 group-hover:animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-tight">AI HELP</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[450px] flex flex-col p-0 border-l border-indigo-100/50 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <SheetHeader className="p-6 md:p-8 bg-slate-900 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <SheetTitle className="flex items-center gap-4 text-white relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tighter leading-none text-white uppercase">Tusmo AI Tutor</p>
              <p className="text-[9px] font-black uppercase text-indigo-400 tracking-[.3em] mt-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Socratic Mentorship Active
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Chat Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth"
          style={{ background: 'radial-gradient(circle at top right, rgba(79, 70, 229, 0.05), transparent 40%)' }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[70%] text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-500/5 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                <HelpCircle className="h-12 w-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white px-8 leading-tight">U baahan tahay dhiirigelin ama fahamid hor leh?</h3>
                <p className="text-[12px] text-slate-400 max-w-[300px] mx-auto leading-relaxed font-medium uppercase tracking-wide">
                  Waxaan halkan u joogaa inaan kugu hageeyo fahamka, adigoon ku siinayn jawaabta saxda ah. Ma haysaa wax gaar ah oo aad rabto inaad i weydiiso?
                </p>
              </div>
              
              <div className="grid gap-3 w-full max-w-[320px] pt-4">
                {[
                  "Ma fahmin su'aashan, ma ii fududayn kartaa?",
                  "Fikradda (concept-ka) ka dambeeya ii sharax.",
                  "Halkee baan ka bilaabaa su'aashan?"
                ].map((suggestion) => (
                    <button 
                        key={suggestion}
                        onClick={() => handleInputChange({ target: { value: suggestion } } as any)}
                        className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 text-[11px] font-black text-slate-300 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-white transition-all text-left group flex items-center justify-between"
                    >
                        {suggestion}
                        <Sparkles className="h-3 w-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col gap-2",
                  m.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "p-6 rounded-[2rem] max-w-[90%] shadow-2xl relative",
                  m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/40" 
                    : "bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none shadow-black/40 backdrop-blur-md"
                )}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-bold">
                    {m.content}
                  </p>
                </div>
                <span className="mx-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {m.role === "user" ? "You" : "Tusmo AI"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex flex-col items-start gap-2">
              <div className="p-5 rounded-[2rem] bg-slate-900/50 border border-indigo-500/20 text-indigo-400 rounded-tl-none animate-pulse backdrop-blur-md">
                <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                </div>
              </div>
              <span className="mx-2 text-[9px] font-black text-indigo-400 uppercase tracking-[.3em] animate-pulse">Analyzing...</span>
            </div>
          )}
        </div>

        {/* Dynamic Input Section */}
        <div className="p-6 md:p-8 bg-slate-900 border-t border-white/10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && !isLoading) handleSubmit(e);
            }} 
            className="flex items-center gap-3"
          >
            <div className="relative flex-1 group">
               <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Weydii AI wax kasta..."
                  className="w-full h-16 pl-6 pr-6 rounded-[1.5rem] bg-white/5 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-950 focus:outline-none transition-all font-bold text-sm"
               />
               <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-2">
                  <Button 
                      type="submit" 
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "h-10 w-10 md:h-12 md:w-12 rounded-xl transition-all p-0",
                        input.trim() ? "bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 rotate-0" : "bg-slate-800 text-slate-600 -rotate-12 cursor-not-allowed"
                      )}
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
               </div>
            </div>
          </form>
          <p className="mt-4 text-[9px] font-black text-center text-slate-500 uppercase tracking-widest opacity-40">
            Powered by Vercel AI SDK • Gemini Pro Ultra v2.1
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
