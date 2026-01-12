"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 academic-accent-bg rounded-lg flex items-center justify-center text-blue-900 font-bold text-lg">
                S1
              </div>
              <div>
                <h3 className="font-bold text-lg">SMK Negeri 1</h3>
                <p className="text-xs text-blue-200">Jakarta</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed mb-4">
              Lembaga pendidikan kejuruan terkemuka yang menghasilkan lulusan berkualitas dan siap
              kerja sejak 1985.
            </p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center hover:academic-accent-bg hover:text-blue-900 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center hover:academic-accent-bg hover:text-blue-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center hover:academic-accent-bg hover:text-blue-900 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center hover:academic-accent-bg hover:text-blue-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 academic-accent-border pb-2">
              Tautan Cepat
            </h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <Link href="/" className="hover-accent transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover-accent transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#programs" className="hover-accent transition-colors">
                  Program Keahlian
                </Link>
              </li>
              <li>
                <Link href="#news" className="hover-accent transition-colors">
                  Berita & Artikel
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="hover-accent transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover-accent transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 academic-accent-border pb-2">
              Layanan
            </h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  Pendaftaran Siswa Baru
                </Link>
              </li>
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  Portal Siswa
                </Link>
              </li>
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  E-Learning
                </Link>
              </li>
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  Perpustakaan Digital
                </Link>
              </li>
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  Pembayaran SPP Online
                </Link>
              </li>
              <li>
                <Link href="#" className="hover-accent transition-colors">
                  Rapor Online
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b-2 academic-accent-border pb-2">
              Kontak Kami
            </h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 academic-accent shrink-0" />
                <span>
                  Jl. Pendidikan No. 123
                  <br />
                  Jakarta Selatan 12345
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 academic-accent shrink-0" />
                <span>
                  (021) 1234-5678
                  <br />
                  (021) 8765-4321
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 academic-accent shrink-0" />
                <span>
                  info@smkn1jakarta.sch.id
                  <br />
                  admin@smkn1jakarta.sch.id
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="w-5 h-5 academic-accent shrink-0" />
                <span>
                  Senin - Jumat
                  <br />
                  07.00 - 16.00 WIB
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-8">
          <div className="md:flex justify-between items-center text-sm text-blue-200">
            <p>&copy; {currentYear} SMK Negeri 1 Jakarta. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover-accent transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="hover-accent transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="#" className="hover-accent transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
