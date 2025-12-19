"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfilePage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isVisible: boolean;
  isPublished: boolean;
  updatedAt: string;
}

const profilePages = [
  {
    slug: "sejarah",
    title: "Sejarah",
    description: "Perjalanan 40 tahun membangun prestasi dan karakter",
    icon: "📖",
  },
  {
    slug: "visi-misi",
    title: "Visi & Misi",
    description: "Panduan strategis dalam mengarahkan visi pendidikan",
    icon: "🎯",
  },
  {
    slug: "struktur",
    title: "Struktur Organisasi",
    description: "Susunan manajemen dan kepemimpinan institusi",
    icon: "🏢",
  },
  {
    slug: "fasilitas",
    title: "Fasilitas",
    description: "Infrastruktur modern mendukung pembelajaran berkualitas",
    icon: "🏗️",
  },
  {
    slug: "program-keahlian",
    title: "Program Keahlian",
    description: "Pilihan program studi berkualitas dengan sertifikasi",
    icon: "📚",
  },
];

export default function PagesList() {
  const [pages, setPages] = useState<Map<string, ProfilePage>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/pages");
      if (response.ok) {
        const data = await response.json();
        const pageMap = new Map<string, ProfilePage>();
        data.forEach((page: ProfilePage) => {
          pageMap.set(page.slug, page);
        });
        setPages(pageMap);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    const page = pages.get(slug);
    if (!page) return;

    try {
      const response = await fetch(`/api/admin/website-landing/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !page.isVisible }),
      });

      if (response.ok) {
        await fetchPages();
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Kelola Halaman Profil</h1>
        <p className="mt-2 text-muted-foreground">
          Atur konten dan pengaturan untuk masing-masing halaman profil sekolah
        </p>
      </div>

      {/* Pages Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Memuat data halaman...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profilePages.map((profilePage) => {
            const page = pages.get(profilePage.slug);
            const isVisible = page?.isVisible ?? true;

            return (
              <Link
                key={profilePage.slug}
                href={`/admin/website-landing/pages/profil/${profilePage.slug}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg hover:border-accent transition-all cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{profilePage.icon}</div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {profilePage.title}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {profilePage.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {page?.isPublished && (
                          <Badge variant="outline" className="bg-green-50 text-success border-success">
                            Dipublikasikan
                          </Badge>
                        )}
                        {isVisible ? (
                          <Badge variant="outline" className="bg-accent text-accent-foreground border-accent">
                            Terlihat
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
                            Tersembunyi
                          </Badge>
                        )}
                      </div>

                      {/* Last Updated */}
                      {page?.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Diperbarui: {new Date(page.updatedAt).toLocaleDateString("id-ID")}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <button
                          onClick={(e) => handleToggleVisibility(e, profilePage.slug)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                          {isVisible ? (
                            <Eye className="h-4 w-4 text-success-foreground" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs">
                            {isVisible ? "Sembunyikan" : "Tampilkan"}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                          <span className="text-sm font-medium">Edit</span>
                          <ArrowRight className="h-4 w-4 text-current" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
