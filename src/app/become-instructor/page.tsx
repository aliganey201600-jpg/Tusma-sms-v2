import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Become an Instructor | Tusmo School",
  description: "Join our team of dedicated educators at Tusmo School.",
};

export default function BecomeInstructorPage() {
  return (
    <div className="container py-16 px-4 md:px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full px-4 py-1.5 text-sm">Join Our Team</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Shape the Minds of Tomorrow</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are always looking for passionate, experienced, and innovative educators to join our faculty. 
            Bring your expertise to Tusmo and help us inspire the next generation.
          </p>
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-2xl font-bold">Why teach at Tusmo?</h3>
          <ul className="grid gap-4">
            {[
              "Competitive salary and comprehensive benefits package.",
              "State-of-the-art facilities and smart classrooms.",
              "Professional development and continuous training programs.",
              "A supportive community of collaborative educators."
            ].map((benefit, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-lg text-slate-700 dark:text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Card className="flex-1 w-full border-none shadow-xl bg-card rounded-3xl p-2">
        <CardHeader className="text-center pb-8 pt-6">
          <CardTitle className="text-3xl">Apply Now</CardTitle>
          <CardDescription className="text-base mt-2">Submit your details and we will get back to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="John" required className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Doe" required className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" required className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject of Expertise</Label>
              <Input id="subject" placeholder="e.g. Mathematics, Science" required className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" min="0" placeholder="0" required className="bg-slate-50 dark:bg-slate-900 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Cover Letter / Short Bio</Label>
              <Textarea id="message" placeholder="Tell us briefly about yourself..." className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 resize-none" />
            </div>
            <Button type="submit" className="w-full text-base h-12 rounded-xl mt-4">
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
