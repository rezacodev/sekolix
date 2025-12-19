"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: "academic" | "sports" | "cultural" | "holiday" | "other";
  description?: string;
}

interface EventsSectionProps {
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

export function EventsSection({
  events,
  title = "Upcoming Events",
  subtitle = "Stay connected with our vibrant community events",
  viewAllLink = "/informasi/events"
}: EventsSectionProps) {
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

  // Sort events by date and take first 6
  const sortedEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-4">
            <Calendar className="h-4 w-4" />
            Events Calendar
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              View All Events
              <Calendar className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedEvents.map((event) => {
            const dateInfo = formatDate(event.date);
            const categoryStyle = categoryStyles[event.category];

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white group hover:-translate-y-2"
              >
                <div className="relative">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-6">
                    {/* Date Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
                        <div className="text-sm font-bold">{dateInfo.day}</div>
                        <div className="text-xs uppercase">{dateInfo.month}</div>
                      </div>
                      <Badge className={`${categoryStyle.bg} text-white`}>
                        {categoryStyle.label}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Time & Location */}
                    <div className="space-y-2">
                      {event.time && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Hover Effect Line */}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}