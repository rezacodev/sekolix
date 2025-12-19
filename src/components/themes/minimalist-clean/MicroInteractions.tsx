'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Award, BookOpen } from 'lucide-react';

interface StatItem {
  id: string;
  icon: 'trending' | 'users' | 'award' | 'book';
  value: string;
  label: string;
}

interface MicroInteractionsProps {
  stats: StatItem[];
  title: string;
  subtitle: string;
}

export default function MicroInteractions({
  stats,
  title,
  subtitle,
}: MicroInteractionsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const getIcon = (iconName: string) => {
    const iconProps = { className: 'w-8 h-8 text-slate-900' };
    switch (iconName) {
      case 'trending':
        return <TrendingUp {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'award':
        return <Award {...iconProps} />;
      case 'book':
        return <BookOpen {...iconProps} />;
      default:
        return <TrendingUp {...iconProps} />;
    }
  };

  return (
    <section className="py-32 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 font-light">{subtitle}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              onMouseEnter={() => setHoveredId(stat.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative group text-center transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div
                className={`inline-flex items-center justify-center w-20 h-20 mb-6 transition-all duration-500 ${
                  hoveredId === stat.id
                    ? 'scale-110 rotate-6'
                    : 'scale-100 rotate-0'
                }`}
              >
                <div
                  className={`w-full h-full flex items-center justify-center border-2 border-slate-900 transition-all duration-300 ${
                    hoveredId === stat.id ? 'bg-slate-900' : 'bg-transparent'
                  }`}
                >
                  <div
                    className={`transition-colors duration-300 ${
                      hoveredId === stat.id ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {getIcon(stat.icon)}
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="text-5xl font-light text-slate-900 mb-3">
                {stat.value}
              </div>

              {/* Label */}
              <p className="text-sm uppercase tracking-wider text-slate-600 font-medium">
                {stat.label}
              </p>

              {/* Animated Underline */}
              <div className="mt-6 h-px bg-slate-200 overflow-hidden">
                <div
                  className={`h-full bg-slate-900 transition-all duration-500 ${
                    hoveredId === stat.id ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
