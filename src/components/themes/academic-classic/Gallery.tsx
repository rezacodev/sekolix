"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Pembelajaran Praktik",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"
  },
  {
    id: "2",
    title: "Kegiatan Ekstrakurikuler",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80"
  },
  {
    id: "3",
    title: "Workshop & Seminar",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80"
  },
  {
    id: "4",
    title: "Kompetisi Siswa",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80"
  },
  {
    id: "5",
    title: "Kerjasama Industri",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
  },
  {
    id: "6",
    title: "Upacara Bendera",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80"
  },
  {
    id: "7",
    title: "Fasilitas Sekolah",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80"
  }
];

interface GalleryProps {
  viewAllLink?: string;
}

export function Gallery({ viewAllLink = "/gallery" }: GalleryProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="academic-accent font-semibold mb-2">GALERI</div>
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Dokumentasi Kegiatan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lihat berbagai kegiatan dan pencapaian siswa SMK Negeri 1 Jakarta
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryItems.map(item => (
            <div key={item.id} className="gallery-item">
              <div className="relative w-full h-64">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="gallery-overlay">
                <div className="font-semibold">{item.title}</div>
              </div>
            </div>
          ))}

          {/* View All Card */}
          <Link
            href={viewAllLink}
            className="bg-blue-900 flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors rounded-lg"
          >
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <div className="font-semibold">Lihat Semua</div>
              <div className="text-sm">200+ Foto</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
