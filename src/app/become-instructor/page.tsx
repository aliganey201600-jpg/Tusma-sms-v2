import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ChevronLeft, 
  GraduationCap, 
  Heart, 
  Layers, 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  Trophy,
  Globe,
  Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Join Our Faculty | Tusmo SMS",
  description: "Shape the future of education by joining the Tusmo School instructor team.",
};

export default function BecomeInstructorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
            T
          </div>
          <span className="font-black text-slate-900 tracking-tighter">Tusmo.</span>
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">
            Sign In
          </Button>
        </Link>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/professional_teaching_environment_1773728339016.png" 
            alt="Teaching Environment" 
            fill 
            className="object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -mr-80 -mt-80" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-8">
            <Badge className="bg-indigo-500 text-white border-none py-2 px-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5 mr-2" /> Elevate Your Career
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
               Shape the <span className="text-indigo-400">Future</span> <br /> of Learning.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              We're building the most innovative education platform in the region. Bring your expertise to Tusmo and inspire the next generation of leaders.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
               {[
                 { label: "Faculty", value: "150+" },
                 { label: "Live Courses", value: "480+" },
                 { label: "Students", value: "12k+" }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-16 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Benefits & Culture */}
          <div className="lg:col-span-7 space-y-16 py-12">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Why Teach at Tusmo?</h2>
                  <p className="text-slate-500 font-medium max-w-lg">Join a community where your impact is amplified by cutting-edge technology and a culture of excellence.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { title: "Advanced Platform", desc: "Use our proprietary AI-assisted course builder and dashboard to manage your curriculum effortlessly.", icon: Layers, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { title: "Global Impact", desc: "Reach thousands of students across the country and leave a lasting academic legacy.", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { title: "Elite Community", desc: "Collaborate with top-tier educators and industry experts from various disciplines.", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Career Growth", desc: "Benefit from continuous training, professional workshops, and clear leadership paths.", icon: Rocket, color: "text-rose-500", bg: "bg-rose-50" }
                  ].map((benefit, i) => (
                    <div key={i} className="group space-y-4 p-4 -ml-4 rounded-3xl hover:bg-slate-50 transition-all">
                       <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", benefit.bg, benefit.color)}>
                          <benefit.icon className="h-6 w-6" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{benefit.title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-950 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
               <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                  <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                     <Trophy className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black tracking-tight leading-tight">Elite Faculty Program</h3>
                     <p className="text-slate-400 font-medium max-w-md mx-auto">
                        High-performing instructors qualify for our Elite Program, featuring increased revenue shares, dedicated support, and research grants.
                     </p>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 font-black py-2 px-6 rounded-xl uppercase tracking-widest">
                     Launching Fall 2026
                  </Badge>
               </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-5 relative z-20">
            <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
              <div className="bg-indigo-600 p-10 py-12 text-white overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mb-16" />
                  <div className="relative z-10 space-y-2">
                    <CardTitle className="text-4xl font-black tracking-tight">Apply Now.</CardTitle>
                    <CardDescription className="text-indigo-100 font-medium text-base">We'll review your profile and reach out in 48 hours.</CardDescription>
                  </div>
              </div>
              <CardContent className="p-10 pt-12">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">First Name</Label>
                      <Input placeholder="Ali" required className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Name</Label>
                      <Input placeholder="Ahmed" required className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Professional Email</Label>
                    <Input type="email" placeholder="ali.ahmed@example.com" required className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Expertise Area</Label>
                      <Input placeholder="e.g. Physics" required className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Exp. (Years)</Label>
                      <Input type="number" placeholder="5" required className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Brief Academic Bio</Label>
                    <Textarea 
                      placeholder="Tell us about your teaching philosophy and experience..." 
                      className="min-h-[140px] rounded-[2rem] bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium resize-none p-6" 
                    />
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all duration-300 relative overflow-hidden group/btn mt-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                       Send Application <Rocket className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                  
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest pt-2">
                    By submitting, you agree to our Faculty terms.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 Tusmo SMS. Excellence in Education.</p>
      </footer>
    </div>
  );
}
