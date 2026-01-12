"use client";

import Link from "next/link";
import { Mail, Phone, Facebook, Instagram, Youtube } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-blue-900 text-white text-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4 py-2">
        <div className="flex items-center gap-6 m-0">
          <a
            href="mailto:info@smkn1jakarta.sch.id"
            className="flex items-center gap-2 hover-accent transition-colors m-0"
          >
            <Mail className="w-4 h-4 m-0" />
            <span className="hidden sm:inline m-0">info@smkn1jakarta.sch.id</span>
          </a>
          <a
            href="tel:+622112345678"
            className="flex items-center gap-2 hover-accent transition-colors m-0"
          >
            <Phone className="w-4 h-4 m-0" />
            <span className="hidden sm:inline m-0">(021) 1234-5678</span>
          </a>
        </div>
        <div className="flex items-center gap-4 m-0">
          <Link href="#" className="hover-accent transition-colors m-0">
            <Facebook className="w-4 h-4 m-0" />
          </Link>
          <Link href="#" className="hover-accent transition-colors m-0">
            <Instagram className="w-4 h-4 m-0" />
          </Link>
          <Link href="#" className="hover-accent transition-colors m-0">
            <Youtube className="w-4 h-4 m-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
