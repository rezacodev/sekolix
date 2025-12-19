"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface Statistic {
  id: string;
  value: number;
  label: string;
  suffix?: string;
}

interface MinimalStatsProps {
  statistics: Statistic[];
}

export default function MinimalStats({ statistics }: MinimalStatsProps) {
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const animateCounters = useCallback(() => {
    statistics.forEach((stat) => {
      let current = 0;
      const increment = stat.value / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCounts((prev) => ({ ...prev, [stat.id]: stat.value }));
          clearInterval(timer);
        } else {
          setCounts((prev) => ({ ...prev, [stat.id]: Math.floor(current) }));
        }
      }, 30);
    });
  }, [statistics]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, animateCounters]);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {statistics.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="number-large mb-4">
                {counts[stat.id] || 0}
                {stat.suffix && (
                  <span className="text-5xl">{stat.suffix}</span>
                )}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
