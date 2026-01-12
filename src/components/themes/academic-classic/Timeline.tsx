"use client";

import { Card } from "@/components/ui/card";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
  subtitle?: string;
}

export function Timeline({
  events,
  title = "Our Journey Through Time",
  subtitle = "Decades of excellence in education and achievement"
}: TimelineProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div
              className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border"
              style={{ borderWidth: "1px" }}
            >
              <div className="w-2 h-2 academic-accent-bg rounded-full" />
              <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                History & Milestones
              </span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">{subtitle}</p>
          <div className="w-24 h-1 academic-accent-bg mx-auto" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 academic-accent-bg hidden md:block" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {events.map((event, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={event.id}
                  className={`relative flex items-center ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col`}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${isLeft ? "md:pr-12" : "md:pl-12"}`}>
                    <Card className="p-6 hover:shadow-xl transition-shadow duration-300 border-none relative">
                      {/* Arrow for Desktop */}
                      <div
                        className={`hidden md:block absolute top-8 ${
                          isLeft ? "right-0 translate-x-full" : "left-0 -translate-x-full"
                        }`}
                      >
                        <div
                          className={`w-0 h-0 border-t-8 border-b-8 border-transparent ${
                            isLeft ? "border-l-8 border-l-white" : "border-r-8 border-r-white"
                          }`}
                        />
                      </div>

                      {/* Year Badge */}
                      <div className="inline-block mb-4">
                        <span className="bg-[#001f3f] academic-accent px-4 py-2 rounded-full font-serif text-lg font-bold">
                          {event.year}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-serif font-bold text-[#001f3f] mb-3">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </Card>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 academic-accent-bg rounded-full border-4 border-white shadow-lg z-10" />

                  {/* Empty Space for Alternating Layout */}
                  <div className="hidden md:block w-5/12" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
