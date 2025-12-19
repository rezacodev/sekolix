"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: "academic" | "sports" | "cultural" | "holiday" | "other";
  description?: string;
}

interface AcademicCalendarProps {
  events: CalendarEvent[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}

const categoryStyles = {
  academic: { bg: "bg-blue-500", text: "text-blue-500", label: "Academic" },
  sports: { bg: "bg-green-500", text: "text-green-500", label: "Sports" },
  cultural: { bg: "bg-purple-500", text: "text-purple-500", label: "Cultural" },
  holiday: { bg: "bg-red-500", text: "text-red-500", label: "Holiday" },
  other: { bg: "bg-gray-500", text: "text-gray-500", label: "Other" },
};

export function AcademicCalendar({
  events,
  title = "Academic Calendar",
  subtitle = "Stay updated with upcoming events and important dates",
  viewAllLink = "/events"
}: AcademicCalendarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "short",
    });

    const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

    return {
      day: parts.day || date.getDate().toString(),
      month: parts.month || date.toLocaleDateString("id-ID", { month: "short" }),
      year: parts.year || date.getFullYear().toString(),
      weekday: parts.weekday || date.toLocaleDateString("id-ID", { weekday: "short" }),
    };
  };

  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border" style={{borderWidth: '1px'}}>
              <div className="w-2 h-2 academic-accent-bg rounded-full" />
              <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                Events & Calendar
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            {subtitle}
          </p>
          <div className="flex justify-center mb-6">
            <a
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-6 py-3 academic-accent-bg text-white rounded-lg hover:opacity-90 transition-all duration-300 font-medium"
            >
              View All Events
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="w-24 h-1 academic-accent-bg mx-auto" />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => {
            const dateInfo = formatDate(event.date);
            const categoryStyle = categoryStyles[event.category];

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group"
              >
                <div className="flex">
                  {/* Date Column */}
                  <div className="w-24 bg-[#001f3f] p-4 flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-(--theme-accent)/20 to-transparent" />
                    <div className="relative z-10 text-center">
                      <div className="academic-accent text-xs font-semibold uppercase tracking-wider">
                        {dateInfo.month}
                      </div>
                      <div className="text-white text-3xl font-bold font-serif">
                        {dateInfo.day}
                      </div>
                      <div className="text-gray-300 text-xs">{dateInfo.year}</div>
                      <div className="academic-accent text-xs font-semibold mt-1">
                        {dateInfo.weekday}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <Badge
                        className={`${categoryStyle.bg} text-white text-xs`}
                      >
                        {categoryStyle.label}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-[#001f3f] text-lg mb-3 group-hover:academic-accent transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Time & Location */}
                    <div className="space-y-1">
                      {event.time && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="h-4 w-4 academic-accent" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 academic-accent" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div className={`h-1 ${categoryStyle.bg} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
