"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export function Welcome() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div className="academic-accent font-semibold mb-2">SELAMAT DATANG</div>
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              SMK Negeri 1 Jakarta
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              SMK Negeri 1 Jakarta merupakan institusi pendidikan kejuruan terkemuka yang telah berdiri sejak tahun 1985. Dengan komitmen penuh terhadap keunggulan akademik dan pembentukan karakter, kami telah menghasilkan ribuan lulusan yang sukses berkarir di berbagai industri.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Didukung oleh fasilitas modern, kurikulum yang relevan dengan kebutuhan industri, dan tenaga pendidik profesional, kami siap membimbing siswa menuju masa depan gemilang.
            </p>
            
            {/* Achievement Badges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-900">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">Terakreditasi A</div>
                  <div className="text-sm text-gray-600">BAN-S/M</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-900">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">ISO 9001:2015</div>
                  <div className="text-sm text-gray-600">Bersertifikat</div>
                </div>
              </div>
            </div>
            
            <Link href="#profil" className="btn-primary-ac">
              Profil Lengkap
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative w-full h-[500px] rounded-lg shadow-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80"
                alt="Gedung Sekolah"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 academic-accent-bg text-blue-900 p-6 rounded-lg shadow-xl">
              <div className="text-3xl font-bold">38+</div>
              <div className="font-semibold">Tahun Pengalaman</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
