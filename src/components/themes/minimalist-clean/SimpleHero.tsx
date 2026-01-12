"use client";

import { ArrowRight } from "lucide-react";

interface SimpleHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export default function SimpleHero({ title, subtitle, ctaText, ctaLink }: SimpleHeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        {/* Large Typography */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-slate-900 mb-8 leading-tight tracking-tight">
          {title.split(" ").map((word, index) => (
            <span
              key={index}
              className="inline-block opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              {word}
              {index < title.split(" ").length - 1 && "\u00A0"}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed opacity-0 animate-fade-in-up delay-500">
          {subtitle}
        </p>

        {/* Minimal CTA */}
        <a
          href={ctaLink}
          className="group inline-flex items-center gap-3 text-lg text-slate-900 border-b-2 border-slate-900 pb-1 hover:gap-5 transition-all duration-300 opacity-0 animate-fade-in-up delay-700"
        >
          <span className="font-medium">{ctaText}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </a>

        {/* Decorative Line */}
        <div className="mt-24 flex items-center justify-center gap-4 opacity-0 animate-fade-in-up delay-1000">
          <div className="h-px w-16 bg-slate-300" />
          <span className="text-sm text-slate-400 uppercase tracking-wider">Scroll to explore</span>
          <div className="h-px w-16 bg-slate-300" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}
