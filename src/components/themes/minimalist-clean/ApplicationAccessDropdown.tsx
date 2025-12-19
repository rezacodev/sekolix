"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const applications = [
  { name: 'Sistem Informasi Akademik', href: '#', icon: '📚' },
  { name: 'Portal Pendaftaran Siswa', href: '#', icon: '📝' },
  { name: 'Portal Nilai Siswa', href: '#', icon: '📊' },
  { name: 'Sistem Presensi', href: '#', icon: '✓' },
  { name: 'Portal Orang Tua', href: '#', icon: '👨‍👩‍👧‍👦' },
  { name: 'E-Learning Platform', href: '#', icon: '🎓' },
  { name: 'Manajemen Kelas', href: '#', icon: '👥' },
  { name: 'Pusat Informasi Beasiswa', href: '#', icon: '🏆' },
];

export function ApplicationAccessDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-900 hover:text-white transition-all">
        Akses Aplikasi
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-0 w-72 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-200">
          <div className="grid grid-cols-2 gap-1 p-3">
            {applications.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-gray-100 hover:border-slate-300"
              >
                <span className="text-2xl">{app.icon}</span>
                <span className="text-xs font-medium text-center text-gray-700 line-clamp-2">
                  {app.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
