'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface AnimatedHeroProps {
  title?: string;
  subtitle?: string;
  body?: string;
  videoUrl?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function AnimatedHero({
  title,
  subtitle,
  body,
  videoUrl,
  imageUrl,
  ctaText,
  ctaLink,
}: AnimatedHeroProps) {
  useEffect(() => {
    // placeholder effect in case future enhancements need scroll
    return () => {};
  }, []);

  return (
    <section className="hero-modern relative min-h-screen flex items-center pt-24 pb-16 md:pb-20">
      {/* Floating Shapes Background */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-white">
              {/* Badge */}
              <div className="inline-block bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full text-sm font-bold mb-6 border border-white/30">
                🚀 #1 SMK di Jakarta
              </div>

              {/* Title */}
              <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                {title || "Wujudkan"} <span className="text-white drop-shadow-lg">{subtitle || "Impianmu"}</span> Bersama Kami
              </h1>

              {/* Body */}
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                {body || "Bergabunglah dengan sekolah kejuruan terbaik yang menghadirkan pembelajaran inovatif, fasilitas modern, dan koneksi industri untuk masa depan gemilang! 🌟"}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <a href={ctaLink || "#"} className="btn-glow inline-flex items-center justify-center">
                  {ctaText || "Daftar Sekarang 🎓"}
                </a>
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noreferrer" className="bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-bold border-2 border-white/30 hover:bg-white hover:text-cyan-600 transition-all">
                    Virtual Tour 🎥
                  </a>
                )}
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-black">1200+</div>
                  <div className="text-sm text-white/80">Siswa Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black">95%</div>
                  <div className="text-sm text-white/80">Kelulusan</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black">50+</div>
                  <div className="text-sm text-white/80">Mitra Industri</div>
                </div>
              </div>
            </div>

            {/* Image with Floating Cards */}
            <div className="relative hidden md:block">
              <div className="absolute -inset-4 bg-white/20 backdrop-blur-lg rounded-3xl transform rotate-6 -z-10"></div>
              <div className="relative rounded-3xl shadow-2xl transform hover:rotate-3 transition-transform w-full overflow-hidden">
                <Image
                  src={imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"}
                  alt={title || "Hero image"}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl p-4 shadow-xl icon-float max-w-[140px]">
                <div className="text-4xl mb-2">🏆</div>
                <div className="font-bold text-sm text-gray-800">Terakreditasi A</div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-2xl p-4 shadow-xl icon-float max-w-[140px]" style={{ animationDelay: "1s" }}>
                <div className="text-4xl mb-2">💼</div>
                <div className="font-bold text-sm text-gray-800">Job Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
