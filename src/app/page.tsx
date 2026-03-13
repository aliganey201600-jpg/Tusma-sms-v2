import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, GraduationCap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 lg:py-40 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
            Tusmo Primary & Secondary School
          </h1>
          <p className="max-w-[800px] text-lg sm:text-xl md:text-2xl text-muted-foreground">
            Empowering students with knowledge, character, and skills for modern global challenges. We build the leaders of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" className="rounded-full font-semibold px-8 h-14 text-base" asChild>
              <Link href="/sign-up">Apply for Admission</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full font-semibold px-8 h-14 text-base bg-background" asChild>
              <Link href="/courses">Explore Programs</Link>
            </Button>
          </div>
        </div>
        {/* Abstract decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      </section>

      {/* About Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">About Tusmo School</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tusmo Primary and Secondary School is dedicated to providing an enriching educational experience. 
                Our holistic approach blends academic excellence with character development, preparing students to be responsible global citizens.
              </p>
              <ul className="grid gap-4 mt-6">
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-lg">World-class curriculum mapping multiple standards.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-lg">Highly qualified, dedicated educators.</span>
                </li>
              </ul>
            </div>
            {/* Visual placeholder for about image */}
            <div className="relative mx-auto w-full max-w-[500px] aspect-square rounded-2xl bg-muted overflow-hidden shadow-2xl flex items-center justify-center">
               <div className="text-muted-foreground font-medium">🏫 Campus Image</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50 border-y">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Featured Courses</h2>
            <p className="max-w-[700px] text-lg text-muted-foreground">Discover the wide range of subjects designed to challenge and inspire our students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Advanced Mathematics", desc: "Algebra, Geometry, and Calculus", grade: "Grade 10-12" },
              { title: "General Science", desc: "Foundations of Physics, Chemistry, and Biology", grade: "Grade 7-9" },
              { title: "Computer Science", desc: "Introduction to coding, algorithms, and logic", grade: "Grade 8-12" },
            ].map((course, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow border-none shadow-md bg-background">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-base">{course.grade}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{course.desc}</p>
                  <Button variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary hover:bg-transparent flex items-center gap-2">
                    Review Syllabus <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Upcoming Events</h2>
              <p className="text-lg text-muted-foreground">Stay up-to-date with the latest school events, workshops, and extracurricular activities.</p>
              <Button asChild>
                 <Link href="/events">See Calendar</Link>
              </Button>
            </div>
            <div className="grid gap-4 relative">
              {[
                { date: "Oct 15", title: "Science Fair 2026", time: "09:00 AM - 03:00 PM" },
                { date: "Nov 02", title: "Parent-Teacher Conference", time: "04:00 PM - 07:00 PM" },
                { date: "Dec 10", title: "End of Term Awards", time: "10:00 AM - 12:00 PM" },
              ].map((ev, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-2xl bg-muted/50 transition-colors hover:bg-muted">
                  <div className="flex flex-col items-center justify-center min-w-[80px] h-20 bg-background rounded-xl shadow-sm text-center">
                    <span className="text-sm font-medium text-primary uppercase">{ev.date.split(" ")[0]}</span>
                    <span className="text-2xl font-bold">{ev.date.split(" ")[1]}</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <h3 className="text-xl font-bold">{ev.title}</h3>
                    <div className="flex items-center text-muted-foreground gap-2">
                       <Calendar className="h-4 w-4" />
                       <span className="text-sm">{ev.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-slate-950 text-slate-50 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-12">What Our Community Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 text-left">
               <p className="text-lg text-slate-300 italic">"Tusmo has completely transformed my child's approach to learning. The teachers are incredibly supportive and genuinely care."</p>
               <div>
                 <p className="font-bold text-slate-50">Amina J.</p>
                 <p className="text-sm text-slate-400">Parent of Grade 8 Student</p>
               </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 text-left">
               <p className="text-lg text-slate-300 italic">"The learning environment here pushes you to be your best. I've discovered a passion for programming that I never knew I had."</p>
               <div>
                 <p className="font-bold text-slate-50">Hassan M.</p>
                 <p className="text-sm text-slate-400">Grade 11 Student</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 md:py-16">
        <div className="container px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Tusmo School</h3>
            <p className="text-sm text-muted-foreground mr-4">Empowering students through rigorous and holistic education to build the leaders of tomorrow.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/courses" className="hover:text-primary">Courses</Link></li>
              <li><Link href="/events" className="hover:text-primary">Events</Link></li>
              <li><Link href="/become-instructor" className="hover:text-primary">Become Instructor</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Portals</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sign-in" className="hover:text-primary">Student Portal</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Teacher Portal</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Parent Portal</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Admin Portal</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mogadishu, Somalia</li>
              <li>info@tusmoschool.com</li>
              <li>+252 61 234 5678</li>
            </ul>
          </div>
        </div>
        <div className="container px-4 md:px-6 mt-12 pt-8 border-t text-sm text-muted-foreground text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Tusmo Primary & Secondary School. All rights reserved.</p>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-primary font-medium">Privacy Policy</Link>
             <Link href="#" className="hover:text-primary font-medium">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
