"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Bell, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  publishedAt: string;
  slug: string;
}

interface NewsListProps {
  news: NewsItem[];
  title?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export function NewsList({
  news,
  title = "Latest News & Updates",
  showViewAll = true,
  viewAllLink = "/informasi/news"
}: NewsListProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(dateString));
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="academic-accent font-semibold mb-2 tracking-wide">BERITA & ARTIKEL</div>
          <h2 className="text-4xl font-bold text-blue-900 mb-4">{title}</h2>
          <div className="w-24 h-1 academic-accent-bg mx-auto mb-6"></div>
          {showViewAll && (
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-6 py-3 academic-accent-bg text-white rounded-lg hover:opacity-90 transition-all duration-300 font-medium"
            >
              View All News
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {news.slice(0, 3).map(item => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
              >
                <Link href={`/informasi/news/${item.slug}`}>
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="relative w-full sm:w-64 h-56 shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                      <div className="absolute top-3 left-3">
                        <Badge className="academic-accent-bg text-blue-900 hover:academic-accent-bg font-semibold">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {/* Date */}
                        <div className="flex items-center gap-2 text-gray-500 mb-3 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-blue-900 mb-3 hover-accent transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>

                      {/* Read More */}
                      <div>
                        <Button
                          variant="link"
                          className="text-blue-900 hover-accent p-0 h-auto font-semibold group"
                        >
                          Baca Selengkapnya
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}

            {/* View All Button */}
            {showViewAll && (
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-6 text-base font-semibold"
                  asChild
                >
                  <Link href={viewAllLink}>
                    Lihat Semua Berita
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Pengumuman */}
            <Card className="p-6 border-t-4 academic-accent-border bg-white shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 academic-accent" />
                <h3 className="text-lg font-bold text-blue-900">Pengumuman</h3>
              </div>
              <ul className="space-y-4">
                <li className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <Link href="#" className="group">
                    <div className="text-xs text-gray-500 mb-1">10 Des 2025</div>
                    <h4 className="text-sm font-semibold text-blue-900 group-hover:academic-accent transition-colors line-clamp-2">
                      Penerimaan Peserta Didik Baru (PPDB) Tahun 2025/2026
                    </h4>
                  </Link>
                </li>
                <li className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <Link href="#" className="group">
                    <div className="text-xs text-gray-500 mb-1">8 Des 2025</div>
                    <h4 className="text-sm font-semibold text-blue-900 group-hover:academic-accent transition-colors line-clamp-2">
                      Libur Semester Gasal Tahun Ajaran 2025/2026
                    </h4>
                  </Link>
                </li>
                <li className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <Link href="#" className="group">
                    <div className="text-xs text-gray-500 mb-1">5 Des 2025</div>
                    <h4 className="text-sm font-semibold text-blue-900 group-hover:academic-accent transition-colors line-clamp-2">
                      Jadwal Ujian Akhir Semester (UAS) Gasal 2025
                    </h4>
                  </Link>
                </li>
                <li className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <Link href="#" className="group">
                    <div className="text-xs text-gray-500 mb-1">1 Des 2025</div>
                    <h4 className="text-sm font-semibold text-blue-900 group-hover:academic-accent transition-colors line-clamp-2">
                      Workshop Sertifikasi Kompetensi untuk Kelas XII
                    </h4>
                  </Link>
                </li>
              </ul>
              <Link
                href="/announcements"
                className="inline-flex items-center text-sm font-semibold academic-accent hover-accent mt-4"
              >
                Lihat Semua
                <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Card>

            {/* Kalender Akademik */}
            <Card className="p-6 bg-linear-to-br from-blue-900 to-blue-800 text-white shadow-md">
              <h3 className="text-lg font-bold mb-4">Kalender Akademik</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="shrink-0 w-12 h-12 academic-accent-bg rounded-lg flex flex-col items-center justify-center text-blue-900">
                    <div className="text-xs font-semibold">DES</div>
                    <div className="text-lg font-bold leading-none">15</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Ujian Akhir Semester</div>
                    <div className="text-xs text-blue-200">15-22 Desember 2025</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="shrink-0 w-12 h-12 academic-accent-bg rounded-lg flex flex-col items-center justify-center text-blue-900">
                    <div className="text-xs font-semibold">DES</div>
                    <div className="text-lg font-bold leading-none">23</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Libur Semester</div>
                    <div className="text-xs text-blue-200">23 Des - 5 Jan 2026</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="shrink-0 w-12 h-12 academic-accent-bg rounded-lg flex flex-col items-center justify-center text-blue-900">
                    <div className="text-xs font-semibold">JAN</div>
                    <div className="text-lg font-bold leading-none">6</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Semester Genap Dimulai</div>
                    <div className="text-xs text-blue-200">6 Januari 2026</div>
                  </div>
                </div>
              </div>
              <Link
                href="/calendar"
                className="inline-flex items-center text-sm font-semibold academic-accent hover-accent mt-4"
              >
                Lihat Kalender Lengkap
                <ExternalLink className="ml-1 w-4 h-4" />
              </Link>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 border border-gray-200 bg-white shadow-md">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Tautan Cepat</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/ppdb"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">PPDB Online</span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">Portal Siswa</span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/elearning"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">E-Learning</span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">
                      Perpustakaan Digital
                    </span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">Pembayaran SPP</span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/report"
                    className="flex items-center justify-between p-3 rounded-lg hover:academic-accent-bg-light transition-colors group"
                  >
                    <span className="text-sm font-semibold text-blue-900">Rapor Online</span>
                    <ArrowRight className="w-4 h-4 academic-accent group-hover:translate-x-1 transition-transform" />
                  </Link>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
