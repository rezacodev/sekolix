"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ApplicationAccessDropdown } from "./ApplicationAccessDropdown";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInformasiOpen, setIsInformasiOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown="profil"]')) {
        setIsProfileOpen(false);
      }
      if (!target.closest('[data-dropdown="informasi"]')) {
        setIsInformasiOpen(false);
      }
    };

    if (isProfileOpen || isInformasiOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isProfileOpen, isInformasiOpen]);

  return (
    <nav
      className={`w-full border-b border-gray-200 transition-all navbar-ac ${
        isScrolled ? "scrolled bg-white/98 shadow-md" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/images/logo-sekolix-transparent.png"
              alt="Sekolix"
              width={56}
              height={56}
              className="rounded-md object-contain"
              priority
            />
            <div>
              <h1 className="text-xl font-bold text-blue-900">SMK Negeri 1 Jakarta</h1>
              <p className="text-xs text-gray-600">Unggul dalam Prestasi, Prima dalam Karakter</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 font-medium rounded-lg transition-all"
            >
              Beranda
            </Link>

            {/* Dropdown Menu - Profil */}
            <div
              className="relative"
              data-dropdown="profil"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <button
                className="px-3 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 font-medium flex items-center gap-1 rounded-lg transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                Profil
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isProfileOpen && (
                <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 animate-in fade-in-0 zoom-in-95">
                  <Link
                    href="/profil/sejarah"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Sejarah
                  </Link>
                  <Link
                    href="/profil/visi-misi"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Visi & Misi
                  </Link>
                  <Link
                    href="/profil/struktur"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Struktur Organisasi
                  </Link>
                  <Link
                    href="/profil/fasilitas"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Fasilitas
                  </Link>
                  <Link
                    href="/profil/program-keahlian"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Program Keahlian
                  </Link>
                  <Link
                    href="/profil/faculty"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Guru & Staff
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown Menu - Informasi */}
            <div
              className="relative"
              data-dropdown="informasi"
              onMouseEnter={() => setIsInformasiOpen(true)}
              onMouseLeave={() => setIsInformasiOpen(false)}
            >
              <button
                className="px-3 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 font-medium flex items-center gap-1 rounded-lg transition-all"
                onClick={() => setIsInformasiOpen(!isInformasiOpen)}
              >
                Informasi
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isInformasiOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isInformasiOpen && (
                <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 animate-in fade-in-0 zoom-in-95">
                  <Link
                    href="/informasi/news"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsInformasiOpen(false)}
                  >
                    Berita
                  </Link>
                  <Link
                    href="/informasi/articles"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsInformasiOpen(false)}
                  >
                    Artikel
                  </Link>
                  <Link
                    href="/informasi/events"
                    className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsInformasiOpen(false)}
                  >
                    Agenda
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/gallery"
              className="px-3 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 font-medium rounded-lg transition-all"
            >
              Galeri
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-gray-700 hover:text-blue-900 hover:bg-gray-100 font-medium rounded-lg transition-all"
            >
              Kontak
            </Link>
            <Link
              href="/apply"
              className="px-3 py-2 text-white bg-blue-900 hover:bg-slate-900 font-semibold rounded-lg transition-colors"
            >
              Penerimaan Siswa
            </Link>

            <ApplicationAccessDropdown />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
