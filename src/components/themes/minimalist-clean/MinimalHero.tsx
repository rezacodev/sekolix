"use client";

import React from "react";

interface MinimalHeroProps {
  title?: string;
  subtitle?: string;
  body?: string;
  description?: string;
  established?: string;
}

export default function MinimalHero({
  title,
  subtitle,
  body,
  description,
  established = "Established 1985"
}: MinimalHeroProps) {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="text-sm font-bold mb-8 tracking-wide uppercase text-neutral-500">
            {established}
          </div>
          <h1 className="text-7xl md:text-8xl font-black mb-8 text-balance fade-in">
            {title || "Excellence in"}
            <br />
            <span className="accent-blue">{subtitle || "Education"}</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-2xl leading-relaxed">
            {body ||
              description ||
              "Empowering students through knowledge, innovation, and character development."}
          </p>
          <div className="flex flex-wrap gap-6">
            <button className="btn-primary-minimal">Daftar Sekarang</button>
            <button className="btn-minimal">Pelajari Lebih Lanjut</button>
          </div>
        </div>
      </div>
    </section>
  );
}
