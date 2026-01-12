"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

interface Program {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  link: string;
}

const programs: Program[] = [
  {
    id: "1",
    title: "Rekayasa Perangkat Lunak",
    category: "TEKNIK KOMPUTER",
    description:
      "Menjadi programmer profesional dengan menguasai berbagai bahasa pemrograman dan framework modern.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    link: "#rpl"
  },
  {
    id: "2",
    title: "Teknik Komputer & Jaringan",
    category: "TEKNIK KOMPUTER",
    description:
      "Ahli dalam merancang, mengimplementasikan, dan mengelola infrastruktur jaringan komputer.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80",
    link: "#tkj"
  },
  {
    id: "3",
    title: "Akuntansi & Keuangan",
    category: "BISNIS & MANAJEMEN",
    description:
      "Menguasai sistem akuntansi modern dan manajemen keuangan untuk berbagai jenis bisnis.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    link: "#akuntansi"
  },
  {
    id: "4",
    title: "Desain Komunikasi Visual",
    category: "DESAIN & KREATIF",
    description:
      "Ciptakan karya visual yang menarik untuk berbagai media digital dan cetak dengan kreativitas tanpa batas.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80",
    link: "#dkv"
  },
  {
    id: "5",
    title: "Otomatisasi Tata Kelola Perkantoran",
    category: "BISNIS & MANAJEMEN",
    description:
      "Menjadi profesional dalam administrasi perkantoran dengan kemampuan teknologi informasi terkini.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
    link: "#otkp"
  }
];

export function Programs() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="academic-accent font-semibold mb-2">PROGRAM KEAHLIAN</div>
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Jurusan yang Tersedia</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilih jurusan yang sesuai dengan minat dan bakatmu untuk membangun karir masa depan
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map(program => (
            <div
              key={program.id}
              className="program-card border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative w-full h-48">
                <Image src={program.image} alt={program.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="academic-accent font-semibold text-sm mb-2">{program.category}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <Link
                  href={program.link}
                  className="text-blue-900 font-semibold hover-accent inline-flex items-center gap-1"
                >
                  Selengkapnya
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* View All Card */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-3">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Jurusan Lainnya</h3>
              <Link
                href="#jurusan"
                className="text-blue-900 font-semibold hover-accent inline-flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
