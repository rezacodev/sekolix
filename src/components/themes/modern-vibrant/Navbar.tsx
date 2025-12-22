"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { ApplicationAccessDropdown } from "./ApplicationAccessDropdown";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInformasiOpen, setIsInformasiOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Progress Bar */}
      <div className="progress-bar fixed top-0 left-0 h-1 bg-linear-to-r from-cyan-500 via-purple-500 to-orange-500 z-50" style={{ width: "0%" }} id="progressBar"></div>

      <nav className={`navbar-glass fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo-sekolix.png" alt="Sekolix" width={56} height={56} className="rounded-2xl shadow-md object-contain" priority />
              <div>
                <h1 className="text-xl font-bold gradient-text">SMK Negeri 1 Jakarta</h1>
                <p className="text-xs text-gray-600">Future Ready School</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover-primary font-semibold transition-colors">
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
                  className="text-gray-700 hover-primary font-semibold flex items-center gap-1 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  Profil
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 animate-in fade-in-0 zoom-in-95 z-50">
                    <Link 
                      href="/profil/sejarah" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Sejarah
                    </Link>
                    <Link 
                      href="/profil/visi-misi" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Visi & Misi
                    </Link>
                    <Link 
                      href="/profil/struktur" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Struktur Organisasi
                    </Link>
                    <Link 
                      href="/profil/fasilitas" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Fasilitas
                    </Link>
                    <Link 
                      href="/profil/program-keahlian" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Program Keahlian
                    </Link>
                    <Link 
                      href="/profil/faculty" 
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
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
                  className="text-gray-700 hover-primary font-semibold flex items-center gap-1 transition-colors"
                  onClick={() => setIsInformasiOpen(!isInformasiOpen)}
                >
                  Informasi
                  <ChevronDown className={`w-4 h-4 transition-transform ${isInformasiOpen ? 'rotate-180' : ''}`} />
                </button>
                {isInformasiOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-lg py-2 w-48 animate-in fade-in-0 zoom-in-95 z-50">
                    <Link
                      href="/informasi/news"
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Berita
                    </Link>
                    <Link
                      href="/informasi/articles"
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Artikel
                    </Link>
                    <Link
                      href="/informasi/events"
                      className="block px-4 py-2 text-gray-700 hover:bg-linear-to-r hover:from-cyan-50 hover:to-purple-50 transition-colors"
                      onClick={() => setIsInformasiOpen(false)}
                    >
                      Agenda
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/gallery" className="text-gray-700 hover-primary font-semibold transition-colors">
                Galeri
              </Link>
              <Link href="/contact" className="text-gray-700 hover-primary font-semibold transition-colors">
                Kontak
              </Link>
              <Link href="/apply" className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-semibold transition hover:bg-emerald-600">
                Penerimaan Siswa
              </Link>
              <ApplicationAccessDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden gradient-primary text-white p-3 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 animate-fade-in">
              <Link href="/" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                Beranda
              </Link>
              <Link href="/about" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                Profil
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Informasi</p>
                <Link href="/informasi/news" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                  Berita
                </Link>
                <Link href="/informasi/articles" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                  Artikel
                </Link>
                <Link href="/informasi/events" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                  Agenda
                </Link>
              </div>
              <Link href="/gallery" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                Galeri
              </Link>
              <Link href="/contact" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                Kontak
              </Link>
              <Link href="/apply" className="block text-gray-700 hover-primary font-semibold py-2 transition-colors">
                Penerimaan Siswa
              </Link>
              <div className="pt-2">
                <ApplicationAccessDropdown />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
