"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { MessageSquare, Send, CornerDownRight, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getLessonDiscussions, createDiscussion, replyToDiscussion } from "./discussions-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function LessonDiscussions({ lessonId, user }: { lessonId: string, user: any }) {
  const [discussions, setDiscussions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  
  const [newPost, setNewPost] = React.useState("")
  const [newReply, setNewReply] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const fetchDiscussions = React.useCallback(async () => {
    setLoading(true)
    const res = await getLessonDiscussions(lessonId)
    if (res.success) {
      setDiscussions(res.discussions || [])
    }
    setLoading(false)
  }, [lessonId])

  React.useEffect(() => {
    fetchDiscussions()
  }, [fetchDiscussions])

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user?.id) return
    setSubmitting(true)
    const res = await createDiscussion(lessonId, user.id, newPost)
    if (res.success) {
      setNewPost("")
      toast.success("Question posted successfully!")
      fetchDiscussions()
    } else {
      toast.error(res.error || "Failed to post")
    }
    setSubmitting(false)
  }

  const handleReply = async (parentId: string) => {
    if (!newReply.trim() || !user?.id) return
    setSubmitting(true)
    const res = await replyToDiscussion(lessonId, user.id, parentId, newReply)
    if (res.success) {
      setNewReply("")
      setReplyingTo(null)
      toast.success("Reply added!")
      fetchDiscussions()
    } else {
      toast.error(res.error || "Failed to reply")
    }
    setSubmitting(false)
  }

  function getUserName(item: any) {
    if (item.user?.student) return `${item.user.student.firstName} ${item.user.student.lastName || ''}`.trim()
    if (item.user?.teacher) return `${item.user.teacher.firstName} ${item.user.teacher.lastName || ''}`.trim()
    if (item.user?.parent) return `${item.user.parent.firstName} ${item.user.parent.lastName || ''}`.trim()
    return item.user?.email || "Unknown User"
  }

  function getUserInitials(item: any) {
    return getUserName(item).substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">Q&A Discussions</h3>
          <p className="text-xs font-semibold text-slate-400">Ask questions and discuss with your teacher and peers.</p>
        </div>
      </div>

      {/* New Post Field */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
        <Textarea 
          placeholder="What's on your mind? Ask a question..." 
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          className="resize-none border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 bg-white min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleCreatePost} 
            disabled={submitting || !newPost.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100"
          >
            {submitting && !replyingTo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Ask Question
          </Button>
        </div>
      </div>

      {/* Discussion List */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 border-dashed rounded-[2rem]">
          <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <h4 className="text-slate-600 font-bold">No questions yet</h4>
          <p className="text-xs text-slate-400 font-medium mt-1">Be the first to start a discussion in this lesson!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {discussions.map(disc => (
            <div key={disc.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-[11px] font-black shrink-0",
                  disc.user?.role === 'TEACHER' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                )}>
                  {getUserInitials(disc)}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{getUserName(disc)}</span>
                    {disc.user?.role === 'TEACHER' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-black uppercase tracking-widest">Teacher</span>
                    )}
                    <span className="text-xs text-slate-400 font-medium ml-auto">{format(new Date(disc.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">{disc.content}</p>
                </div>
              </div>

              {/* Replies */}
              {disc.replies && disc.replies.length > 0 && (
                <div className="pl-12 pt-2 space-y-4 col-span-full">
                  {disc.replies.map((reply: any) => (
                    <div key={reply.id} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                      <CornerDownRight className="absolute -left-6 top-6 h-5 w-5 text-slate-200" />
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center text-[9px] font-black shrink-0",
                        reply.user?.role === 'TEACHER' ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
                      )}>
                        {getUserInitials(reply)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[13px] text-slate-900">{getUserName(reply)}</span>
                          {reply.user?.role === 'TEACHER' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest">Teacher</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium ml-auto">{format(new Date(reply.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons / Reply Field */}
              <div className="pl-16 flex items-center gap-3">
                {replyingTo !== disc.id ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyingTo(disc.id)}
                    className="text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 uppercase tracking-widest"
                  >
                    Reply
                  </Button>
                ) : (
                  <div className="w-full pl-6 border-l-2 border-indigo-100 space-y-3 mt-2">
                    <Textarea 
                      placeholder="Write a reply..." 
                      value={newReply}
                      onChange={e => setNewReply(e.target.value)}
                      className="resize-none min-h-[80px] bg-white text-sm"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleReply(disc.id)} 
                        disabled={submitting || !newReply.trim()}
                        className="bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-black tracking-widest uppercase rounded-lg"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Reply"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => { setReplyingTo(null); setNewReply(""); }}
                        className="text-[10px] font-black tracking-widest uppercase text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
