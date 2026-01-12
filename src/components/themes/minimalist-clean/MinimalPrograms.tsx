"use client";

import React from "react";

interface Program {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface MinimalProgramsProps {
  programs: Program[];
  badge?: string;
  title: string;
  subtitle: string;
}

export default function MinimalPrograms({
  programs,
  badge = "Program Keahlian",
  title,
  subtitle
}: MinimalProgramsProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="text-sm font-bold mb-6 tracking-wide uppercase text-neutral-500">
            {badge}
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight">{title}</h2>
          <p className="text-lg text-neutral-600 leading-relaxed">{subtitle}</p>
        </div>

        <div className="space-y-0">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className={`card-minimal p-8 hover-lift border-t ${
                index === programs.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="text-sm font-bold mb-3 tracking-wide uppercase text-neutral-500">
                    {program.number}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{program.title}</h3>
                  <p className="text-neutral-600 leading-relaxed max-w-2xl">
                    {program.description}
                  </p>
                </div>
                <button className="btn-minimal self-start md:self-center">Lihat Detail</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
