"use client";

import Image from "next/image";
import React from "react";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  image: string;
}

interface MinimalTestimonialsProps {
  testimonials: Testimonial[];
  badge?: string;
  title: string;
}

export default function MinimalTestimonials({
  testimonials,
  badge = "Testimoni",
  title
}: MinimalTestimonialsProps) {
  return (
    <section className="py-20 md:py-32 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="text-sm font-bold mb-6 tracking-wide uppercase text-neutral-500">
            {badge}
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight">{title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map(testimonial => (
            <div key={testimonial.id}>
              <div className="quote-minimal mb-6">
                <p className="text-lg leading-relaxed">{testimonial.quote}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-neutral-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
