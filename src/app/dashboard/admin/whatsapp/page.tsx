import prisma from "@/lib/prisma"
import { Shield, Smartphone, QrCode, Link as LinkIcon, RefreshCw, Smartphone as PhoneIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import QRCode from "react-qr-code"
import WhatsAppManager from "./WhatsAppManager"
import PushManager from "./PushManager"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getWhatsAppConfig() {
  try {
    const config = await prisma.whatsAppConfig.findUnique({
       where: { id: "default" }
    });
    return config || { status: 'DISCONNECTED', qrCode: null };
  } catch (error) {
    console.error("Error fetching WhatsApp config:", error);
    return { status: 'DISCONNECTED', qrCode: null };
  }
}

export default async function WhatsAppSettingsPage() {
  const config = await getWhatsAppConfig();
  const isConnected = config.status === 'CONNECTED';

  return (
    <div className="flex-1 space-y-8 p-10 bg-slate-50/30 min-h-screen animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                 <Smartphone className="h-5 w-5 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">WhatsApp Automation</h1>
           </div>
           <p className="text-slate-500 font-medium text-sm pl-11 tracking-wider uppercase">Tusmo School Notification Gateway</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Badge className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none ${isConnected ? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/50' : 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100/50'}`}>
              <div className={`h-2 w-2 rounded-full mr-2 inline-block ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {config.status}
           </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Instructions / Setup */}
        <Card className="lg:col-span-2 p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="relative space-y-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <QrCode className="h-6 w-6 text-emerald-600" /> Authentication Setup
            </h2>
            
            {!isConnected ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-6">
                    <p className="text-slate-600 text-base leading-relaxed font-medium">Link your school&apos;s WhatsApp account to trigger automated notifications for attendance and grades.</p>
                    <ul className="space-y-5">
                      {[
                        "Open WhatsApp on your phone",
                        "Tap Menu or Settings and select Linked Devices",
                        "Tap on Link a Device",
                        "Point your phone to this screen to capture the code"
                      ].map((step, i) => (
                        <li key={i} className="flex gap-4 items-center">
                           <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg">{i + 1}</span>
                           <span className="text-sm font-bold text-slate-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-center">
                     {config.qrCode ? (
                       <div className="p-8 bg-white rounded-[2.5rem] border-4 border-slate-50 shadow-2xl relative group">
                          <QRCode value={config.qrCode} size={256} viewBox="0 0 256 256" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                          <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.2rem]" />
                       </div>
                     ) : (
                       <div className="h-64 w-64 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                          <RefreshCw className="h-10 w-10 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Waiting for code...</p>
                       </div>
                     )}
                  </div>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-6 items-center">
                   <Shield className="h-8 w-8 text-amber-600 shrink-0" />
                   <div>
                      <p className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">Session Security</p>
                      <p className="text-xs font-bold text-amber-700/80 leading-relaxed">This session is only stored on this server. Anti-ban delays of 10–20s are applied per message.</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="h-32 w-32 rounded-[3.5rem] bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-100/50 relative">
                    <Smartphone className="h-16 w-16" />
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                       <LinkIcon className="h-5 w-5 text-white" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Successfully Connected</h3>
                    <p className="text-slate-500 font-bold text-sm mt-2">Linked Device Active</p>
                 </div>
                 <Badge variant="outline" className="mt-8 bg-emerald-50/50 text-emerald-700 border-emerald-100 font-black text-[10px] py-2 px-6 tracking-[0.2em] rounded-full uppercase">
                    All notifications are online
                 </Badge>
                 <form action={async () => {
                    'use server'
                    await prisma.whatsAppConfig.update({ where: { id: "default" }, data: { status: 'DISCONNECTED', qrCode: null } });
                 }}>
                    <Button variant="ghost" className="mt-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest gap-2">
                       DISCONNECT DEVICE
                    </Button>
                 </form>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Stats and Schedule */}
        <div className="space-y-10">
           <Card className="p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 h-full w-24 bg-emerald-500/5 -skew-x-12 translate-x-10 group-hover:translate-x-5 transition-transform duration-700" />
              <div className="relative">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Health</p>
                 <h3 className="text-2xl font-black text-slate-900 leading-none">Excellent</h3>
                 <div className="mt-6 flex gap-1 h-2">
                    {[1,2,3,4,5].map(i => <div key={i} className={`flex-1 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-100'}`} />)}
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">Anti-ban: 10-20s delay</p>
              </div>
           </Card>

           <Card className="p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 h-full w-24 bg-white/5 -skew-x-12 translate-x-10 group-hover:translate-x-5 transition-transform duration-700" />
              <div className="relative">
                 <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                    <PhoneIcon className="h-6 w-6 text-emerald-400" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight mb-4 uppercase">Cron Schedule</h3>
                 <ul className="text-slate-400 text-xs font-bold leading-relaxed space-y-2">
                    <li>🕘 <span className="text-white">09:00</span> — Maqnaanshaha waalidiinta</li>
                    <li>🕛 <span className="text-white">12:00</span> — Xaadirinta macallimiinta</li>
                    <li>🕒 <span className="text-white">15:00</span> — Dhammayska dugsiga</li>
                    <li>🕗 <span className="text-white">20:00</span> — Warbixinta XP-ga</li>
                 </ul>
              </div>
           </Card>
        </div>
      </div>

      {/* ── BROADCAST & LOG MANAGER ────────────────────── */}
      <WhatsAppManager />
      <PushManager />
    </div>
  )
}
