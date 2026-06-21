"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Play,
  Download,
  Calendar,
  User,
  Search,
  ChevronDown,
  Lock,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "ppt" | "video" | "link" | "ebook";
  url: string;
  uploadedBy: string;
  uploadedDate: string;
  releaseDate: string;
  isPublished: boolean;
  accessCount: number;
  lastAccessed?: string;
}

export default function MateriPage({ params }: { params: { id: string } }) {
  const rombelId = params.id;
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Mock data - replace dengan API call
  useEffect(() => {
    const mockMaterials: Material[] = [
      {
        id: "1",
        title: "Bab 1: Pendahuluan Matematika",
        description: "Pengenalan konsep dasar dan notasi matematika",
        type: "pdf",
        url: "/materials/bab1.pdf",
        uploadedBy: "Budi Santoso",
        uploadedDate: "2026-05-01",
        releaseDate: "2026-05-01",
        isPublished: true,
        accessCount: 45,
        lastAccessed: "2026-05-28",
      },
      {
        id: "2",
        title: "Video: Penjelasan Aljabar",
        description: "Video penjelasan detail tentang aljabar linear",
        type: "video",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        uploadedBy: "Budi Santoso",
        uploadedDate: "2026-05-05",
        releaseDate: "2026-05-05",
        isPublished: true,
        accessCount: 32,
        lastAccessed: "2026-05-25",
      },
      {
        id: "3",
        title: "Bab 2: Fungsi dan Grafik",
        description: "Materi tentang fungsi, domain, range, dan grafik fungsi",
        type: "ppt",
        url: "/materials/bab2.ppt",
        uploadedBy: "Budi Santoso",
        uploadedDate: "2026-05-10",
        releaseDate: "2026-05-10",
        isPublished: true,
        accessCount: 28,
        lastAccessed: "2026-05-24",
      },
      {
        id: "4",
        title: "E-Book: Kalkulus Dasar",
        description: "E-book lengkap tentang kalkulus untuk pemula",
        type: "ebook",
        url: "/materials/kalkulus.pdf",
        uploadedBy: "Budi Santoso",
        uploadedDate: "2026-05-15",
        releaseDate: "2026-05-15",
        isPublished: true,
        accessCount: 15,
      },
      {
        id: "5",
        title: "Bab 3: Limit dan Turunan",
        description: "Materi mendatang (belum dirilis)",
        type: "pdf",
        url: "/materials/bab3.pdf",
        uploadedBy: "Budi Santoso",
        uploadedDate: "2026-05-20",
        releaseDate: "2026-06-05",
        isPublished: true,
        accessCount: 0,
      },
    ];

    setMaterials(mockMaterials);
    setLoading(false);
  }, [rombelId]);

  const handleMaterialAccess = async (material: Material) => {
    setSelectedMaterial(material);
    // Call API to track material access
    // await fetch(`/api/student/materials/${material.id}/access`, { method: 'POST' })
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5 text-red-500" />;
      case "ppt":
        return <FileText className="w-5 h-5 text-orange-500" />;
      case "ebook":
        return <FileText className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const isReleased = (releaseDate: string) => new Date(releaseDate) <= new Date();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Materi List */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Materi Pembelajaran</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Rombel X-A • Matematika</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari materi..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Materi Items */}
        <div className="space-y-3">
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Tidak ada materi yang cocok
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map((material) => {
              const released = isReleased(material.releaseDate);
              const isSelected = selectedMaterial?.id === material.id;

              return (
                <Card
                  key={material.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => handleMaterialAccess(material)}
                >
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        {!released ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          getFileIcon(material.type)
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {material.title}
                          </h3>
                          {released && material.lastAccessed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {material.description}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {material.uploadedBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(material.uploadedDate).toLocaleDateString("id-ID")}
                          </div>
                          {released && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Clock className="w-4 h-4" />
                              {material.accessCount} kali diakses
                            </div>
                          )}
                        </div>

                        {!released && (
                          <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded text-xs font-medium">
                            Dirilis: {new Date(material.releaseDate).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-1">
        {selectedMaterial && isReleased(selectedMaterial.releaseDate) ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{selectedMaterial.title}</CardTitle>
              <CardDescription>{selectedMaterial.type.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview Based on Type */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {selectedMaterial.type === "pdf" && (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {selectedMaterial.type === "video" && (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedMaterial.url}
                      title={selectedMaterial.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {(selectedMaterial.type === "ppt" || selectedMaterial.type === "ebook") && (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pembuat</span>
                  <span className="font-medium">{selectedMaterial.uploadedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tanggal Upload</span>
                  <span className="font-medium">
                    {new Date(selectedMaterial.uploadedDate).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Diakses</span>
                  <span className="font-medium">{selectedMaterial.accessCount}x</span>
                </div>
              </div>

              {/* Download Button */}
              <Button className="w-full gap-2" variant="default">
                <Download className="w-4 h-4" />
                Unduh / Buka
              </Button>

              {/* Additional Actions */}
              <Button variant="outline" className="w-full">
                Baca Lengkap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="sticky top-6">
            <CardContent className="pt-6 text-center text-gray-500">
              {selectedMaterial ? (
                <div className="space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm">
                    Materi akan tersedia pada{" "}
                    {new Date(selectedMaterial.releaseDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ) : (
                <p className="text-sm">Pilih materi untuk melihat preview</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
