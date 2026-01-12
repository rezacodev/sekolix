"use client";

import React from "react";
import Link from "next/link";
import { Twitter, Facebook, Instagram, Youtube, ArrowUp, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-4">SMK Negeri 1 Jakarta</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Lembaga pendidikan kejuruan terkemuka yang menghasilkan lulusan berkualitas dan siap
              kerja sejak 1985.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 tracking-tight">Navigasi</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/informasi/news"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Berita
                </Link>
              </li>
              <li>
                <Link
                  href="/informasi/articles"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Artikel
                </Link>
              </li>
              <li>
                <Link
                  href="/informasi/events"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Agenda
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 tracking-tight">Program</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Teknik Mekatronika
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Teknik Informatika
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Teknik Elektro
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Teknik Otomotif
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 tracking-tight">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">
                  Jl. Benda No. 1, Jakarta Selatan 12260
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-300">+62-21-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-300">info@smk1jakarta.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {currentYear} SMK Negeri 1 Jakarta. All rights reserved.
          </p>
          <button
            onClick={handleScrollToTop}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
