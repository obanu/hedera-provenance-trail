import { CheckCircle2, Circle, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Event {
  type: string;
  timestamp: string;
  location: string;
  notes: string;
  status: "completed" | "pending";
}

interface EventTimelineProps {
  events: Event[];
}

const EventTimeline = ({ events }: EventTimelineProps) => {
  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={index} className="relative pb-8 last:pb-0">
          {/* Timeline line */}
          {index !== events.length - 1 && (
            <div className="absolute left-4 top-8 h-full w-0.5 bg-gradient-to-b from-primary to-accent" />
          )}
          
          {/* Event card */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              {event.status === "completed" ? (
                <CheckCircle2 className="h-8 w-8 text-success bg-background rounded-full" />
              ) : (
                <Circle className="h-8 w-8 text-muted-foreground bg-background" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-elegant transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-primary">{event.type}</h3>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
              
              <p className="text-sm text-foreground">{event.notes}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventTimeline;
