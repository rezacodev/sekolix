"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
}

export function Hero({ title, subtitle, body, image }: HeroProps) {
  return (
    <section className="hero-bg text-white py-32 relative overflow-hidden">
      {image && (
        <div className="absolute inset-0 z-0">
          <Image src={image} alt="Hero background" fill className="object-cover opacity-20" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl fade-in">
          {/* Badge */}
          <div className="inline-block academic-accent-bg text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🏆 Terakreditasi A
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {title || "Membangun Generasi Unggul dan Berkarakter"}
          </h1>

          {/* Subtitle */}
          {subtitle && <p className="text-2xl mb-4 text-blue-100 font-semibold">{subtitle}</p>}

          {/* Description */}
          <p className="text-xl mb-8 text-gray-100 leading-relaxed">
            {body ||
              "SMK Negeri 1 Jakarta hadir sebagai lembaga pendidikan terdepan yang menghasilkan lulusan kompeten, professional, dan berakhlak mulia sesuai dengan tuntutan dunia industri."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="#"
              className="btn-primary-ac academic-accent-bg academic-accent-border text-blue-900 hover:opacity-90"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="#"
              className="btn-outline-ac border-white text-white hover:bg-white hover:text-blue-900"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
