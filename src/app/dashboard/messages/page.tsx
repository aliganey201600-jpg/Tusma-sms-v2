"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Send, Plus, MoreVertical, Paperclip, Smile } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const contacts = [
  { id: "1", name: "Ahmed Farah", role: "Student", lastMsg: "Thank you teacher!", time: "10:30 AM", unread: 2 },
  { id: "2", name: "Mrs. Halima Ali", role: "Teacher", lastMsg: "The science fair is next week.", time: "9:15 AM", unread: 0 },
  { id: "3", name: "Parent of Ibrahim", role: "Parent", lastMsg: "About the progress report...", time: "Yesterday", unread: 0 },
  { id: "4", name: "Admin Office", role: "Admin", lastMsg: "System maintenance scheduled.", time: "Monday", unread: 0 },
]

export default function MessagingPage() {
  const [activeChat, setActiveChat] = React.useState(contacts[0])

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-6 overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Internal communication within the Tusmo School community.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Contacts Sidebar */}
        <Card className="w-full md:w-80 border-none shadow-sm flex flex-col overflow-hidden bg-background">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9 h-10 rounded-xl bg-slate-50 border-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-900">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveChat(contact)}
                className={cn(
                  "w-full p-4 flex gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors text-left",
                  activeChat.id === contact.id && "bg-slate-50 dark:bg-slate-900 border-r-4 border-primary"
                )}
              >
                <Avatar className="h-11 w-11 shrink-0 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-bold truncate">{contact.name}</p>
                    <span className="text-[10px] text-muted-foreground font-medium">{contact.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMsg}</p>
                </div>
                {contact.unread > 0 && (
                   <div className="h-4 w-4 rounded-full bg-primary text-[8px] flex items-center justify-center text-primary-foreground font-bold shrink-0">
                      {contact.unread}
                   </div>
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t">
             <Button className="w-full gap-2 rounded-xl h-10">
                <Plus className="h-4 w-4" /> New Message
             </Button>
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="hidden md:flex flex-1 border-none shadow-sm flex-col overflow-hidden bg-background">
           <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{activeChat.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="text-sm font-bold">{activeChat.name}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
           </div>

           <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Mock messages */}
              <div className="flex flex-col items-start gap-2 max-w-[80%]">
                 <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                    Hello teacher, I have a question about the Algebra quiz. Is it covering Chapter 4?
                 </div>
                 <span className="text-[10px] text-muted-foreground font-medium ml-1">10:28 AM</span>
              </div>

              <div className="flex flex-col items-end gap-2 max-w-[80%] ml-auto">
                 <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-none text-sm shadow-md leading-relaxed">
                    Yes Ahmed. It covers Chapters 3 and 4. Make sure to review the systems of equations.
                 </div>
                 <span className="text-[10px] text-muted-foreground font-medium mr-1">10:30 AM</span>
              </div>
           </div>

           <div className="p-4 border-t flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl shrink-0">
                 <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <div className="relative flex-1">
                 <Input placeholder="Type a message..." className="h-11 rounded-xl bg-slate-50 border-none pr-10" />
                 <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-9 w-9 rounded-lg">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                 </Button>
              </div>
              <Button className="h-11 w-11 rounded-xl shrink-0 p-0">
                 <Send className="h-5 w-5" />
              </Button>
           </div>
        </Card>
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
