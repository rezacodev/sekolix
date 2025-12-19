import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export default function VibrantFooter({
  schoolName,
  address,
  phone,
  email,
  socialMedia,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative modern-vibrant-footer text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 modern-vibrant-footer-bg-1 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 modern-vibrant-footer-bg-2 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 modern-vibrant-footer-title">
              {schoolName}
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Empowering minds, shaping futures. Join us in our journey of excellence in education.
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialMedia.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socialMedia.youtube && (
                <a
                  href={socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Tautan Cepat</h4>
            <ul className="space-y-3">
              {['Tentang Kami', 'Penerimaan', 'Program', 'Guru & Staf', 'Berita & Kegiatan', 'Kontak'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-cyan-400 group-hover:w-4 transition-all duration-300" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold mb-6">Sumber Daya</h4>
            <ul className="space-y-3">
              {[
                'Kalender Akademik',
                'Portal Siswa',
                'Portal Orang Tua',
                'Perpustakaan',
                'Bimbingan Karir',
                'Alumni',
              ].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-slate-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-purple-400 group-hover:w-4 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-300">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-cyan-400" />
                </div>
                <a href={`tel:${phone}`} className="hover:text-cyan-400 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </div>
                <a href={`mailto:${email}`} className="hover:text-cyan-400 transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
            <p>
              © {currentYear} {schoolName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-cyan-400 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="/terms" className="hover:text-cyan-400 transition-colors">
                Syarat Layanan
              </a>
              <a href="/sitemap" className="hover:text-cyan-400 transition-colors">
                Situs Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
