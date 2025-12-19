'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Calendar, Clock } from 'lucide-react';

interface CardData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
  readTime: string;
  link: string;
  color: string;
}

interface InteractiveCardsProps {
  cards: CardData[];
  title: string;
  subtitle: string;
}

export default function InteractiveCards({
  cards,
  title,
  subtitle,
}: InteractiveCardsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 bg-linear-to-br from-slate-50 via-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <a
              key={card.id}
              href={card.link}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative block"
            >
              <div
                className={`relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${
                  hoveredId === card.id
                    ? 'scale-105 shadow-2xl -translate-y-2'
                    : 'scale-100'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div
                    className={`relative w-full h-full transition-transform duration-700 ${
                      hoveredId === card.id ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-sm"
                      style={{ backgroundColor: card.color }}
                    >
                      {card.category}
                    </span>
                  </div>

                  {/* Hover Icon */}
                  <div
                    className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-300 ${
                      hoveredId === card.id
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-0'
                    }`}
                  >
                    <ExternalLink className="w-5 h-5 text-slate-900" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{card.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{card.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 line-clamp-3 mb-4">
                    {card.description}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 text-purple-600 font-semibold">
                    <span
                      className={`transition-transform duration-300 ${
                        hoveredId === card.id ? 'translate-x-2' : ''
                      }`}
                    >
                      Read More
                    </span>
                    <ExternalLink
                      className={`w-4 h-4 transition-transform duration-300 ${
                        hoveredId === card.id
                          ? 'translate-x-1'
                          : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Animated Border */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                    hoveredId === card.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    border: `3px solid ${card.color}`,
                  }}
                />
              </div>

              {/* Shadow Effect */}
              <div
                className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300 -z-10 ${
                  hoveredId === card.id ? 'opacity-50' : 'opacity-0'
                }`}
                style={{ backgroundColor: card.color }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
