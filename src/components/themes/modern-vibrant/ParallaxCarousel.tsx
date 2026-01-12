"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

interface ParallaxCarouselProps {
  items: CarouselItem[];
}

export default function ParallaxCarousel({ items }: ParallaxCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  return (
    <section className="py-20 px-4 bg-slate-900 relative overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500 via-purple-500 to-orange-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Latest Highlights</h2>
          <p className="text-xl text-slate-300">Stay updated with our recent activities</p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentIndex
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* Background Image with Parallax */}
                <div className="absolute inset-0">
                  <div
                    className="relative w-full h-full transition-transform duration-700"
                    style={{
                      transform: index === currentIndex ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="max-w-3xl">
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-slide-up">
                      {item.title}
                    </h3>
                    <p className="text-lg md:text-xl text-white/90 mb-6 line-clamp-3 animate-slide-up delay-100">
                      {item.description}
                    </p>
                    <a
                      href={item.link}
                      className="inline-block px-8 py-4 bg-linear-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-slide-up delay-200"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-12 bg-linear-to-r from-cyan-500 to-purple-500"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
