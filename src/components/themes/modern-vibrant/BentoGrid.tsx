"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  size: "small" | "medium" | "large";
  color: string;
}

interface BentoGridProps {
  items: BentoItem[];
}

export default function BentoGrid({ items }: BentoGridProps) {
  const getSizeClass = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2";
      case "medium":
        return "md:col-span-2 md:row-span-1";
      case "small":
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <section className="py-20 px-4 bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Explore Our School</h2>
          <p className="text-xl text-slate-600">Discover what makes us unique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]">
          {items.map(item => (
            <a
              key={item.id}
              href={item.link}
              className={`group relative overflow-hidden rounded-3xl ${getSizeClass(
                item.size
              )} hover:scale-[1.02] transition-all duration-500 shadow-lg hover:shadow-2xl`}
              style={{ backgroundColor: item.color }}
            >
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-700">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                  />
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
