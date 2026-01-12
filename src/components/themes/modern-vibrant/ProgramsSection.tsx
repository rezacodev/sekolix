"use client";

import React from "react";
import { Code, Palette, Cpu, Briefcase, Camera, Users } from "lucide-react";

export default function ProgramsSection() {
  const programs = [
    {
      icon: Code,
      title: "Rekayasa Perangkat Lunak",
      description: "Belajar coding, web development, mobile apps, dan software engineering",
      gradient: "from-cyan-400 to-blue-500",
      students: "250+ Siswa"
    },
    {
      icon: Palette,
      title: "Desain Komunikasi Visual",
      description: "Kuasai graphic design, UI/UX, branding, dan multimedia production",
      gradient: "from-purple-400 to-pink-500",
      students: "180+ Siswa"
    },
    {
      icon: Cpu,
      title: "Teknik Komputer Jaringan",
      description: "Ahli dalam networking, sistem administrasi, dan cyber security",
      gradient: "from-orange-400 to-red-500",
      students: "220+ Siswa"
    },
    {
      icon: Briefcase,
      title: "Bisnis Digital",
      description: "E-commerce, digital marketing, dan entrepreneurship modern",
      gradient: "from-cyan-400 to-purple-500",
      students: "150+ Siswa"
    },
    {
      icon: Camera,
      title: "Multimedia",
      description: "Video editing, fotografi, animasi, dan content creation",
      gradient: "from-pink-400 to-orange-500",
      students: "190+ Siswa"
    },
    {
      icon: Users,
      title: "Manajemen Perkantoran",
      description: "Administrasi, komunikasi bisnis, dan office management",
      gradient: "from-blue-400 to-cyan-500",
      students: "160+ Siswa"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-linear-to-br from-white via-purple-50/30 to-cyan-50/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-linear-to-br from-cyan-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-linear-to-tr from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-100 to-purple-100 text-cyan-700 px-6 py-2 rounded-full text-sm font-semibold mb-4">
            <span>📚</span>
            <span>Program Keahlian</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Pilih Jurusan Impianmu
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Berbagai program keahlian dengan kurikulum terkini dan fasilitas lengkap untuk
            mengembangkan potensi terbaikmu
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Overlay on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${program.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-linear-to-br ${program.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <program.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-cyan-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {program.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">{program.description}</p>

                {/* Students Count */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{program.students}</span>
                </div>

                {/* Learn More Link */}
                <button className="mt-6 text-sm font-semibold text-purple-600 flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                  Pelajari Lebih Lanjut
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-linear-to-r from-cyan-500 via-purple-500 to-orange-500 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Belum Yakin Pilih Jurusan?
              </h3>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Konsultasikan dengan tim kami untuk mendapatkan rekomendasi jurusan yang sesuai
                dengan minat dan bakatmu
              </p>
              <button className="bg-white text-purple-600 px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Konsultasi Gratis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
