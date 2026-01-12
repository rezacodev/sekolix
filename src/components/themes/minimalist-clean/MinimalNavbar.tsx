"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ApplicationAccessDropdown } from "./ApplicationAccessDropdown";

export function MinimalNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInformasiOpen, setIsInformasiOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Navbar scroll effect
      setIsScrolled(window.scrollY > 50);

      // Progress bar
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Progress Bar */}
      <div className="progress-minimal" style={{ width: `${progress}%` }}></div>

      {/* Navigation */}
      <nav
        className={`nav-minimal fixed w-full top-0 z-50 bg-white ${isScrolled ? "scrolled" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="text-2xl font-black tracking-tight">
              SMK Negeri 1 Jakarta
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold underline-effect">
                Beranda
              </Link>

              {/* Profil Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button
                  className="text-sm font-semibold flex items-center gap-1 whitespace-nowrap relative hover-underline-minimal"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="relative">Profil</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isProfileOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-slate-200">
                    <Link
                      href="/profil/sejarah"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Sejarah
                    </Link>
                    <Link
                      href="/profil/visi-misi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Visi & Misi
                    </Link>
                    <Link
                      href="/profil/struktur"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Struktur Organisasi
                    </Link>
                    <Link
                      href="/profil/fasilitas"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Fasilitas
                    </Link>
                    <Link
                      href="/profil/program-keahlian"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Program Keahlian
                    </Link>
                    <Link
                      href="/profil/faculty"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Guru & Staff
                    </Link>
                  </div>
                )}
              </div>

              {/* Informasi Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsInformasiOpen(true)}
                onMouseLeave={() => setIsInformasiOpen(false)}
              >
                <button
                  className="text-sm font-semibold flex items-center gap-1 whitespace-nowrap relative hover-underline-minimal"
                  onClick={() => setIsInformasiOpen(!isInformasiOpen)}
                >
                  <span className="relative">Informasi</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isInformasiOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isInformasiOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-slate-200">
                    <Link
                      href="/informasi/news"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Berita
                    </Link>
                    <Link
                      href="/informasi/articles"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Artikel
                    </Link>
                    <Link
                      href="/informasi/events"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Agenda
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/gallery" className="text-sm font-semibold underline-effect">
                Galeri
              </Link>
              <Link href="/contact" className="text-sm font-semibold underline-effect">
                Kontak
              </Link>
              <Link href="/apply" className="text-sm font-semibold underline-effect text-slate-900">
                Penerimaan Siswa
              </Link>
              <ApplicationAccessDropdown />
            </div>

            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
