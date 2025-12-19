"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description1?: string;
  description2?: string;
  features?: Array<{ text: string }>;
  imageUrl?: string;
}

export function AboutSection({
  title = "Membangun Masa Depan Melalui Pendidikan",
  subtitle = "Tentang Kami",
  description1 = "Sejak 1985, SMK Negeri 1 Jakarta telah menjadi institusi pendidikan kejuruan terkemuka yang menghasilkan lulusan berkualitas tinggi.",
  description2 = "Kami menggabungkan pendekatan akademik yang ketat dengan pelatihan praktis berbasis industri untuk memastikan siswa siap menghadapi dunia kerja.",
  features = [
    { text: "Terakreditasi A oleh BAN-S/M" },
    { text: "Fasilitas modern dan lengkap" },
    { text: "Kerjasama dengan 50+ industri terkemuka" },
    { text: "Kurikulum berbasis kompetensi industri" },
  ],
  imageUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
}: AboutSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border" style={{borderWidth: '1px'}}>
                <div className="w-2 h-2 academic-accent-bg rounded-full" />
                <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                  {subtitle}
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-6">
              {title}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {description1}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {description2}
            </p>

            {/* Achievement Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 academic-accent-bg-light rounded-full flex items-center justify-center academic-accent">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#001f3f]">{feature.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/profil" className="inline-flex items-center gap-2 px-6 py-3 academic-accent-bg text-white rounded-lg hover:opacity-90 transition-all duration-300 font-medium">
              Profil Lengkap
              <Check className="w-4 h-4" />
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={imageUrl}
                alt="SMK Negeri 1 Jakarta"
                fill
                className="object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/30 to-transparent" />
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border-l-4 academic-accent-border">
              <div className="text-3xl font-bold text-[#001f3f] mb-1">38+</div>
              <div className="text-sm text-gray-600">Tahun Pengalaman</div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-xl shadow-xl border-l-4 academic-accent-border">
              <div className="text-3xl font-bold text-[#001f3f] mb-1">5000+</div>
              <div className="text-sm text-gray-600">Alumni Sukses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}