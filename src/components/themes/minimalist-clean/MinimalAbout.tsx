"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";

interface AboutFeature {
  text: string;
}

interface MinimalAboutProps {
  title: string;
  description1: string;
  description2: string;
  features: AboutFeature[];
  imageUrl: string;
  badge?: string;
}

export default function MinimalAbout({
  title,
  description1,
  description2,
  features,
  imageUrl,
  badge = "Tentang Kami",
}: MinimalAboutProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          <div>
            <div className="text-sm font-bold mb-6 tracking-wide uppercase text-neutral-500">
              {badge}
            </div>
            <h2 className="text-5xl font-black mb-8 leading-tight">{title}</h2>
            <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
              {description1}
            </p>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              {description2}
            </p>
            <ul className="list-minimal mb-8">
              {features.map((feature, index) => (
                <li key={index}>{feature.text}</li>
              ))}
            </ul>
            <button className="btn-minimal">Profil Lengkap</button>
          </div>
          <div className="img-overlay">
            <img
              src={imageUrl}
              alt={title}
              className="w-full"
              style={{ aspectRatio: "4/5", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
