'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export type LandingSectionShape = {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  image?: string | null;
  order: number;
  isActive: boolean;
  metadata?: string | null;
};

interface LandingSectionsEditorProps {
  sections: LandingSectionShape[];
}

export const LandingSectionsEditor = ({ sections }: LandingSectionsEditorProps) => {
  const [items, setItems] = useState(sections);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (id: string, field: keyof LandingSectionShape, value: string | number | boolean | null) => {
    setItems((prev) =>
      prev.map((section) => (section.id === id ? { ...section, [field]: value } : section))
    );
  };

  const handleSave = async (section: LandingSectionShape) => {
    setSavingId(section.id);
    setMessage(null);

    const response = await fetch('/api/admin/website-landing/landing-sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: section.id,
        title: section.title,
        subtitle: section.subtitle,
        body: section.body,
        image: section.image,
        order: section.order,
        isActive: section.isActive,
        type: section.type,
        metadata: section.metadata,
      }),
    });

    if (response.ok) {
      setMessage('Perubahan tersimpan');
    } else {
      const result = await response.json().catch(() => null);
      setMessage(result?.message || 'Gagal menyimpan perubahan');
    }

    setSavingId(null);
  };

  const sortedSections = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-wide">Bagian Landing (Global)</h3>
          <Badge variant="secondary">{sortedSections.length} bagian</Badge>
        </div>
        <p className="mt-2 text-sm text-slate-600">Bagian yang digunakan di semua tema. Edit sekali, semua tema terupdate.</p>
        <div className="mt-6 space-y-6">
          {sortedSections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{section.slug}</p>
                    <Badge variant="outline" className="capitalize">{section.type}</Badge>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{section.title}</h4>
                </div>
                <Button size="sm" variant="ghost" disabled={savingId === section.id} onClick={() => handleSave(section)}>
                  {savingId === section.id ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>

              {/* Live Preview Card */}
              <div className="mb-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pratinjau</p>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-lg font-semibold text-slate-700">{section.subtitle}</p>
                  )}
                  {section.body && (
                    <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>
                  )}
                  {section.image && (
                    <div className="mt-3 rounded-lg overflow-hidden bg-slate-200 relative h-32">
                      <Image src={section.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Judul
                  </span>
                  <Input
                    value={section.title}
                    onChange={(event) => handleChange(section.id, 'title', event.target.value)}
                    placeholder="Misal: Hero Section"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tipe
                  </span>
                  <Input
                    value={section.type}
                    onChange={(event) => handleChange(section.id, 'type', event.target.value)}
                    placeholder="hero, stats, programs, cta, dll"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Subjudul
                  </span>
                  <Input
                    value={section.subtitle ?? ''}
                    onChange={(event) => handleChange(section.id, 'subtitle', event.target.value)}
                    placeholder="Ringkasan pendek"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Urutan
                  </span>
                  <Input
                    type="number"
                    value={section.order}
                    onChange={(event) => handleChange(section.id, 'order', Number(event.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Konten
                  </span>
                  <Textarea
                    value={section.body ?? ''}
                    onChange={(event) => handleChange(section.id, 'body', event.target.value)}
                    placeholder="Jelaskan detail section"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gambar
                  </span>
                  <Input
                    value={section.image ?? ''}
                    onChange={(event) => handleChange(section.id, 'image', event.target.value)}
                    placeholder="https://example.com/hero.jpg"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={section.isActive}
                    onChange={(event) => handleChange(section.id, 'isActive', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-0"
                  />
                  Aktifkan pada landing page
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
