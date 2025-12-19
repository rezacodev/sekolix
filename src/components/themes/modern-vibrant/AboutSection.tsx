"use client";

import React from "react";
import { Target, Users, Award, Lightbulb } from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: Target,
      title: "Visi yang Jelas",
      description:
        "Menjadi sekolah terdepan yang menghasilkan lulusan kompeten dan siap bersaing di era digital",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: Users,
      title: "Tenaga Pengajar Profesional",
      description:
        "Guru berpengalaman dan tersertifikasi yang siap membimbing siswa meraih prestasi",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      icon: Award,
      title: "Fasilitas Modern",
      description:
        "Laboratorium, workshop, dan ruang kelas dilengkapi teknologi terkini",
      gradient: "from-orange-400 to-red-500",
    },
    {
      icon: Lightbulb,
      title: "Kurikulum Adaptif",
      description:
        "Pembelajaran yang mengikuti perkembangan industri dan kebutuhan pasar kerja",
      gradient: "from-cyan-400 to-purple-500",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-cyan-500 via-purple-500 to-orange-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-100 to-purple-100 text-cyan-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <span>🎓</span>
              <span>Tentang Kami</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Membangun Generasi{" "}
              <span className="bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Unggul & Inovatif
              </span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Sejak didirikan, kami berkomitmen untuk memberikan pendidikan
              berkualitas tinggi yang menggabungkan teori dan praktik. Dengan
              motto &ldquo;Future Ready School&rdquo;, kami mempersiapkan siswa untuk
              menghadapi tantangan dunia kerja modern.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Kami fokus pada pengembangan karakter, keterampilan teknis, dan
              soft skills yang dibutuhkan industri. Lulusan kami tidak hanya
              siap bekerja, tapi juga siap menjadi pemimpin masa depan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="btn-glow px-8 py-4 rounded-2xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Lihat Profil Lengkap
              </button>
              <button className="px-8 py-4 rounded-2xl border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-all duration-300">
                Download Brosur
              </button>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
