"use client"

import React from "react"
import { useChat } from "ai/react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiTutorChatProps {
  lessonId: string
  lessonObjectives: string
  userName: string
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export function AiTutorChat({ lessonId, lessonObjectives, userName }: AiTutorChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      question_text: `Lesson ID: ${lessonId}`,
      lesson_objectives: lessonObjectives,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Soo dhawow ${userName}! 👋\n\nAniga waxaan ahay Macalinkaaga AI-ga. Waxaan kaa caawin karaa:\n\n• **Su'aalaha** adiga kugu adagtahay\n• **Sharaxaada** fikradaha adag\n• **Diyaarinta** imtixaannada\n\nMaxaan kaa caawiyaa maanta?`,
      }
    ]
  })

  const chatEndRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const renderText = (str: string) =>
    str.split(/(\*\*.*?\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="text-blue-300 font-black">{p.slice(2, -2)}</strong>
        : p
    )

  return (
    <div
      className="flex-1 flex flex-col h-full w-full overflow-hidden"
      style={{ background: '#0b141a' }}
    >
      {/* WhatsApp Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: '#202c33' }}>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">AI</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">Tusmo AI Tutor</p>
          <p className="text-[11px] leading-tight" style={{ color: isLoading ? '#f59e0b' : '#25d366' }}>
            {isLoading ? 'Wuu qorayo...' : 'Online'}
          </p>
        </div>
        <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5 uppercase tracking-widest">
          AI Tutor
        </span>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-md relative",
                msg.role === 'user' ? "rounded-tr-sm" : "rounded-tl-sm"
              )}
              style={{ background: msg.role === 'user' ? '#005c4b' : '#202c33' }}
            >
              {/* Bubble tail - user */}
              {msg.role === 'user' && (
                <div className="absolute -right-1.5 top-0 w-3 h-3 overflow-hidden">
                  <div className="w-4 h-4 rounded-bl-full" style={{ background: '#005c4b', marginLeft: '-4px' }} />
                </div>
              )}
              {/* Bubble tail - AI */}
              {msg.role !== 'user' && (
                <div className="absolute -left-1.5 top-0 w-3 h-3 overflow-hidden">
                  <div className="w-4 h-4 rounded-br-full" style={{ background: '#202c33', marginRight: '-4px' }} />
                </div>
              )}

              <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                {renderText(msg.content)}
              </p>
              <p className={cn("text-[10px] mt-1.5 opacity-60", msg.role === 'user' ? "text-right" : "text-left")} style={{ color: '#aebac1' }}>
                {now()}
                {msg.role === 'user' && <span className="ml-1" style={{ color: '#53bdeb' }}>✓✓</span>}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-5 py-4 shadow-md" style={{ background: '#202c33' }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((delay, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* WhatsApp-style Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (input.trim() && !isLoading) handleSubmit(e); }}
        className="shrink-0 px-3 py-3 flex items-center gap-3"
        style={{ background: '#202c33' }}
      >
        <div className="flex-1 flex items-center rounded-full px-4 py-2.5 gap-3" style={{ background: '#2a3942' }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Su'aal ku weydii macalinka AI-ga..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: '#00a884' }}
        >
          <ArrowRight className="h-5 w-5 text-white" />
        </button>
      </form>
    </div>
  )
}
