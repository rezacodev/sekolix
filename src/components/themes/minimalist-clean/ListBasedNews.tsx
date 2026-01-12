"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  link: string;
}

interface ListBasedNewsProps {
  news: NewsItem[];
  title: string;
}

export default function ListBasedNews({ news, title }: ListBasedNewsProps) {
  return (
    <section className="py-32 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-4">{title}</h2>
          <div className="h-px w-24 bg-slate-900" />
        </div>

        {/* News List */}
        <div className="space-y-12">
          {news.map(item => (
            <article key={item.id} className="group border-b border-slate-200 pb-12 last:border-0">
              <Link href={item.link} className="block">
                {/* Meta */}
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time>{item.date}</time>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="uppercase tracking-wider">{item.category}</span>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-4 group-hover:text-slate-600 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p className="text-lg text-slate-600 mb-6 leading-relaxed font-light">
                  {item.excerpt}
                </p>

                {/* Read More Link */}
                <div className="inline-flex items-center gap-2 text-slate-900 group-hover:gap-4 transition-all duration-300">
                  <span className="text-sm uppercase tracking-wider font-medium">Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-20 text-center">
          <Link
            href="/informasi/news"
            className="inline-flex items-center gap-3 text-lg text-slate-900 border-b-2 border-slate-900 pb-1 hover:gap-5 transition-all duration-300"
          >
            <span className="font-medium">View All News</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
