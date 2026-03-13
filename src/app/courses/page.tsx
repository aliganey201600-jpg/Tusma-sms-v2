import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock data for courses
const courses = [
  { id: 1, title: "Advanced Mathematics", desc: "Algebra, Geometry, and Calculus", grade: "Grade 10-12", level: "Advanced", teacher: "Mr. Abdi" },
  { id: 2, title: "General Science", desc: "Foundations of Physics, Chemistry, and Biology", grade: "Grade 7-9", level: "Beginner", teacher: "Mrs. Halima" },
  { id: 3, title: "Computer Science", desc: "Introduction to coding, algorithms, and logic", grade: "Grade 8-12", level: "Intermediate", teacher: "Ms. Yasmin" },
  { id: 4, title: "World History", desc: "Global historical events and their impact on modern society", grade: "Grade 9-12", level: "Intermediate", teacher: "Mr. Hassan" },
  { id: 5, title: "English Literature", desc: "Analyzing classic and modern literary works", grade: "Grade 10-12", level: "Advanced", teacher: "Mrs. Fadumo" },
  { id: 6, title: "Physical Education", desc: "Health, fitness, and team sports", grade: "Grade 7-12", level: "All Levels", teacher: "Mr. Jama" },
];

export const metadata = {
  title: "Courses | Tusmo School",
  description: "Browse the diverse range of courses offered at Tusmo Primary and Secondary School.",
};

export default function CoursesPage() {
  return (
    <div className="container py-12 px-4 md:px-6 max-w-7xl mx-auto flex-1">
      <div className="flex flex-col gap-8 md:flex-row md:items-end justify-between mb-12">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Academic Courses</h1>
          <p className="text-xl text-muted-foreground">
            Explore our comprehensive curriculum designed to foster academic excellence and critical thinking.
          </p>
        </div>
        <div className="w-full md:w-[350px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10 h-12 rounded-full bg-slate-100/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 bg-card rounded-2xl overflow-hidden group">
            <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="rounded-full">{course.level}</Badge>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="text-base text-primary/80 font-medium">{course.grade}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 line-clamp-2">{course.desc}</p>
              <div className="pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                <span className="font-medium">Instructor:</span>
                <span>{course.teacher}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
