"use client";

import React from "react";
import { Twitter, Facebook, Instagram, Youtube, ArrowUp } from "lucide-react";

interface MinimalFooterProps {
  schoolName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export default function MinimalFooter({
  schoolName,
  description,
  address,
  phone,
  email,
  socialMedia
}: MinimalFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="py-16 md:py-20 minimal-footer text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-black mb-6">{schoolName}</h3>
              <p className="text-neutral-400 leading-relaxed mb-8 max-w-md">{description}</p>
              <div className="flex gap-6">
                {socialMedia?.twitter && (
                  <a href={socialMedia.twitter} className="hover-lift" aria-label="Twitter">
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
                {socialMedia?.facebook && (
                  <a href={socialMedia.facebook} className="hover-lift" aria-label="Facebook">
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {socialMedia?.instagram && (
                  <a href={socialMedia.instagram} className="hover-lift" aria-label="Instagram">
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {socialMedia?.youtube && (
                  <a href={socialMedia.youtube} className="hover-lift" aria-label="YouTube">
                    <Youtube className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wide uppercase">Navigasi</h4>
              <ul className="space-y-4 text-neutral-400">
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Beranda
                  </a>
                </li>
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Program Keahlian
                  </a>
                </li>
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Berita
                  </a>
                </li>
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Galeri
                  </a>
                </li>
                <li>
                  <a href="#" className="underline-effect hover:text-white transition-colors">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wide uppercase">Kontak</h4>
              <ul className="space-y-4 text-neutral-400">
                <li>
                  <div className="text-sm mb-1">Alamat</div>
                  <div className="text-white">{address}</div>
                </li>
                <li>
                  <div className="text-sm mb-1">Telepon</div>
                  <div className="text-white">{phone}</div>
                </li>
                <li>
                  <div className="text-sm mb-1">Email</div>
                  <div className="text-white">{email}</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-400">
            <p>&copy; 2025 {schoolName}. Semua hak dilindungi.</p>
            <div className="flex gap-8">
              <a href="#" className="underline-effect hover:text-white transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="underline-effect hover:text-white transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 minimal-footer text-white flex items-center justify-center hover-lift opacity-0 pointer-events-none transition-opacity"
        style={{ borderRadius: "4px" }}
        id="backToTop"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </>
  );
}
