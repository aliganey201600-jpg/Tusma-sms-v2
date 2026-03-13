import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

const events = [
  { id: 1, title: "Science Fair 2026", type: "Academic", date: "Oct 15, 2026", time: "09:00 AM - 03:00 PM", location: "Main Hall", desc: "Annual science exhibition showcasing student projects." },
  { id: 2, title: "Parent-Teacher Conference", type: "Meeting", date: "Nov 02, 2026", time: "04:00 PM - 07:00 PM", location: "Classrooms", desc: "Discussing student progress and academic goals for the upcoming term." },
  { id: 3, title: "End of Term Awards", type: "Ceremony", date: "Dec 10, 2026", time: "10:00 AM - 12:00 PM", location: "Auditorium", desc: "Recognizing outstanding academic and extracurricular achievements." },
  { id: 4, title: "Inter-School Sports Meet", type: "Sports", date: "Jan 20, 2027", time: "08:00 AM - 05:00 PM", location: "Sports Ground", desc: "Annual sports competition with neighboring schools." },
];

export const metadata = {
  title: "Events | Tusmo School",
  description: "Stay updated with the latest events and activities at Tusmo School.",
};

export default function EventsPage() {
  return (
    <div className="container py-12 px-4 md:px-6 max-w-5xl mx-auto flex-1">
      <div className="space-y-4 mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Upcoming Events</h1>
        <p className="text-xl text-muted-foreground">
          Mark your calendars for important school dates, ceremonies, and parent meetings.
        </p>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <Card key={event.id} className="border-none shadow-md bg-card transition-shadow hover:shadow-lg overflow-hidden group">
            <div className="flex flex-col sm:flex-row">
              <div className="bg-primary/5 sm:w-48 p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
                <Calendar className="h-8 w-8 text-primary mb-2 opacity-80" />
                <span className="font-bold text-lg">{event.date.split(",")[0]}</span>
                <span className="text-sm text-muted-foreground">{event.date.split(",")[1]}</span>
              </div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                  <Badge variant="outline" className="ml-2 bg-background">{event.type}</Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed text-base">{event.desc}</p>
                
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
                    <Clock className="h-4 w-4 text-primary" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md">
                    <MapPin className="h-4 w-4 text-primary" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
