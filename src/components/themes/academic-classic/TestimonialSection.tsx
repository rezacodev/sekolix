"use client";

import Image from "next/image";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  year?: string;
}

interface TestimonialSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="academic-accent font-semibold mb-2">TESTIMONI</div>
          <h2 className="text-4xl font-bold mb-4">Kata Alumni & Orang Tua</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Cerita sukses dari alumni dan kepercayaan orang tua terhadap pendidikan di SMK Negeri 1 Jakarta
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full border-4 academic-accent-border overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg">{testimonial.name}</div>
                  <div className="text-sm text-blue-200">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="flex gap-1 academic-accent text-2xl mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              
              <p className="text-blue-100 leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
