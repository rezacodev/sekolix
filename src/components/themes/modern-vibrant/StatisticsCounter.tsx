'use client';

import { useEffect, useRef, useState } from 'react';

interface Statistic {
  id: string;
  value: number;
  label: string;
  icon: 'users' | 'books' | 'awards' | 'globe';
  suffix?: string;
  color: string;
}

interface StatisticsCounterProps {
  statistics: Statistic[];
}

export default function StatisticsCounter({
  statistics,
}: StatisticsCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return '👨‍🎓';
      case 'books':
        return '👨‍🏫';
      case 'awards':
        return '🎯';
      case 'globe':
        return '✨';
      default:
        return '👨‍🎓';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 px-4 md:px-6 bg-white relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-cyan-50 to-purple-50 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              isVisible={isVisible}
              delay={index * 200}
              getIcon={getIcon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  isVisible,
  delay,
  getIcon,
}: {
  stat: Statistic;
  isVisible: boolean;
  delay: number;
  getIcon: (name: string) => string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = stat.value / steps;
    const stepDuration = duration / steps;

    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, stat.value, delay]);

  return (
    <div
      className="text-center transform hover:scale-110 transition-transform"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Icon with gradient background */}
      <div
        className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl pulse-ring"
        style={{ 
          background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
        }}
      >
        <span className="text-white text-5xl">{getIcon(stat.icon)}</span>
      </div>

      {/* Counter */}
      <div className="stat-number">
        {count.toLocaleString()}
        {stat.suffix}
      </div>

      {/* Label */}
      <div className="text-gray-600 font-semibold mt-2">{stat.label}</div>
    </div>
  );
}
