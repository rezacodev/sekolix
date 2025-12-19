"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: "academic" | "sports" | "cultural" | "holiday" | "other";
  description?: string;
}

interface MinimalEventsProps {
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

export function MinimalEvents({
  events,
  title = "Upcoming Events",
  subtitle = "Stay informed about important dates and events",
  viewAllLink = "/informasi/events"
}: MinimalEventsProps) {
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-full text-gray-600 text-sm mb-4">
            <Calendar className="h-4 w-4" />
            Events
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
          <a
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
          >
            View All Events
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {sortedEvents.map((event) => {
            const dateInfo = formatDate(event.date);
            const categoryStyle = categoryStyles[event.category];

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Column */}
                  <div className="md:w-32 p-6 bg-gray-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{dateInfo.day}</div>
                      <div className="text-sm text-gray-600 uppercase">{dateInfo.month}</div>
                      <div className="text-xs text-gray-500 mt-1">{dateInfo.year}</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <Badge className={`${categoryStyle.bg} text-white text-xs`}>
                            {categoryStyle.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {event.title}
                        </h3>

                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {event.description}
                          </p>
                        )}

                        {/* Time & Location */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="mt-4 md:mt-0 md:ml-4">
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
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