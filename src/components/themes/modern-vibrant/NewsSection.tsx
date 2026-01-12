"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

interface NewsArticle {
  id: string | number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt: string;
  slug: string;
}

interface NewsSectionProps {
  news: NewsArticle[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Prestasi: "from-yellow-400 to-orange-500",
      Kegiatan: "from-cyan-400 to-blue-500",
      Pengumuman: "from-purple-400 to-pink-500",
      Info: "from-cyan-400 to-purple-500"
    };
    return colors[category] || "from-gray-400 to-gray-500";
  };

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-linear-to-br from-cyan-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-orange-100 to-pink-100 text-orange-700 px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <span>📰</span>
            <span>Berita & Artikel</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Kabar Terbaru
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Update terkini seputar kegiatan, prestasi, dan pengumuman penting dari sekolah
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {news.map((article, index) => (
            <div
              key={article.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={400}
                  height={224}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-block bg-linear-to-r ${getCategoryColor(
                      article.category
                    )} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg`}
                  >
                    {article.category}
                  </span>
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{article.publishedAt}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Read More */}
                <button className="flex items-center gap-2 text-sm font-semibold text-orange-600 group-hover:gap-3 transition-all duration-300">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/informasi/news"
            className="btn-glow px-10 py-4 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-block"
          >
            Lihat Semua Berita
          </Link>
        </div>
      </div>
    </section>
  );
}
