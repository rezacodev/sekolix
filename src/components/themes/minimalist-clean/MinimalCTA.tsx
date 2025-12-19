"use client";

import React from "react";

interface MinimalCTAProps {
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export default function MinimalCTA({
  title,
  subtitle,
  primaryButtonText = "Daftar Sekarang",
  secondaryButtonText = "Hubungi Kami",
}: MinimalCTAProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight max-w-3xl mx-auto">
            {title}
          </h2>
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="btn-primary-minimal">{primaryButtonText}</button>
            <button className="btn-minimal">{secondaryButtonText}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
