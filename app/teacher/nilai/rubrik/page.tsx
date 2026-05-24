"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useBreadcrumb } from "@/app/teacher/BreadcrumbContext";

interface RubricCriteria {
  id?: number;
  name: string;
  description?: string;
  maxScore: number;
  order: number;
}

interface Rubric {
  id: number;
  name: string;
  description?: string;
  type: string;
  weight: number;
  maxScore: number;
  isActive: boolean;
  criteria: RubricCriteria[];
}

export default function KelolaRubrikPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");
  const subjectName = searchParams.get("subjectName");
  const rombelId = searchParams.get("rombelId");
  const rombelName = searchParams.get("rombelName");
  const className = searchParams.get("className");
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [loading, setLoading] = useState(true);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRubric, setDeletingRubric] = useState<Rubric | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [weightSetupOpen, setWeightSetupOpen] = useState(false);
  const [weightData, setWeightData] = useState<Record<number, number>>({});
  const [savingWeights, setSavingWeights] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "TUGAS" as string,
    weight: 1,
    maxScore: 100,
    isActive: true,
    criteria: [
      { name: "Kriteria 1", description: "", maxScore: 25, order: 0 }
    ] as RubricCriteria[]
  });

  // Set breadcrumb
  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Input Nilai Akademik", href: "/teacher/nilai/input" },
        { label: `Rubrik ${subjectName} - ${className} ${rombelName}`, href: `/teacher/nilai/rubrik?subjectId=${subjectId}&rombelId=${rombelId}` },
      ]);
    }
  }, [setBreadcrumbs, subjectId]);

  const fetchRubrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/nilai/rubrik?subjectId=${subjectId}&rombelId=${rombelId}`);
      if (!response.ok) throw new Error("Failed to fetch rubrics");

      const data = await response.json();
      setRubrics(data.rubrics);
    } catch (error) {
      console.error("Error fetching rubrics:", error);
      toast.error("Gagal memuat rubrik");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Fetch rubrics
  useEffect(() => {
    if (!subjectId || !rombelId) {
      router.push("/teacher/nilai/input");
      return;
    }

    fetchRubrics();
  }, [subjectId, rombelId, router, fetchRubrics]);

  const handleOpenDialog = (rubric?: Rubric) => {
    if (rubric) {
      setEditingRubric(rubric);
      setFormData({
        name: rubric.name,
        description: rubric.description || "",
        type: rubric.type,
        weight: rubric.weight,
        maxScore: rubric.maxScore,
        isActive: rubric.isActive,
        criteria: rubric.criteria.length > 0 ? rubric.criteria : [
          { name: "Kriteria 1", description: "", maxScore: 25, order: 0 }
        ]
      });
    } else {
      setEditingRubric(null);
      setFormData({
        name: "",
        description: "",
        type: "TUGAS",
        weight: 1,
        maxScore: 100,
        isActive: true,
        criteria: [
          { name: "Kriteria 1", description: "", maxScore: 25, order: 0 }
        ]
      });
    }
    setIsDialogOpen(true);
  };

  const handleAddCriteria = () => {
    setFormData({
      ...formData,
      criteria: [
        ...formData.criteria,
        {
          name: `Kriteria ${formData.criteria.length + 1}`,
          description: "",
          maxScore: 25,
          order: formData.criteria.length
        }
      ]
    });
  };

  const handleRemoveCriteria = (index: number) => {
    if (formData.criteria.length <= 1) {
      toast.error("Minimal harus ada 1 kriteria");
      return;
    }
    const newCriteria = formData.criteria.filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleCriteriaChange = (index: number, field: keyof RubricCriteria, value: string | number) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      toast.error("Nama rubrik wajib diisi");
      return;
    }

    if (!formData.type) {
      toast.error("Tipe penilaian wajib dipilih");
      return;
    }

    if (formData.criteria.length === 0) {
      toast.error("Minimal satu kriteria penilaian wajib ditambahkan");
      return;
    }

    // Validate criteria
    for (const [index, criterion] of formData.criteria.entries()) {
      if (!criterion.name.trim()) {
        toast.error(`Nama kriteria ${index + 1} wajib diisi`);
        return;
      }
      if (!criterion.maxScore || criterion.maxScore <= 0) {
        toast.error(`Nilai maksimal kriteria ${index + 1} harus lebih dari 0`);
        return;
      }
    }

    // Validate total criteria max score
    const totalMaxScore = formData.criteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);
    if (totalMaxScore > 100) {
      toast.error(`Total nilai maksimal kriteria tidak boleh melebihi 100. Total saat ini: ${totalMaxScore}`);
      return;
    }

    try {
      setSaving(true);
      const url = editingRubric
        ? `/api/teacher/nilai/rubrik/${editingRubric.id}`
        : `/api/teacher/nilai/rubrik`;

      const method = editingRubric ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          rombelId,
          ...formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save rubric");
      }

      toast.success(editingRubric ? "Rubrik berhasil diupdate" : "Rubrik berhasil ditambahkan");
      setIsDialogOpen(false);
      fetchRubrics();
    } catch (error) {
      console.error("Error saving rubric:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan rubrik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (rubric: Rubric) => {
    setDeletingRubric(rubric);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRubric) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/teacher/nilai/rubrik/${deletingRubric.id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete rubric");

      toast.success("Rubrik berhasil dihapus");
      fetchRubrics();
      setDeleteConfirmOpen(false);
      setDeletingRubric(null);
    } catch (error) {
      console.error("Error deleting rubric:", error);
      toast.error("Gagal menghapus rubrik");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenWeightSetup = () => {
    // Initialize weight data with current weights
    const initialWeights: Record<number, number> = {};
    rubrics.forEach(rubric => {
      initialWeights[rubric.id] = rubric.weight;
    });
    setWeightData(initialWeights);
    setWeightSetupOpen(true);
  };

  const handleWeightChange = (rubricId: number, weight: number) => {
    setWeightData(prev => ({
      ...prev,
      [rubricId]: weight
    }));
  };

  const saveWeights = async () => {
    try {
      setSavingWeights(true);

      // Update weights for all rubrics
      const updatePromises = rubrics.map(rubric => {
        const newWeight = weightData[rubric.id] || 0;
        return fetch(`/api/teacher/nilai/rubrik/${rubric.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            weight: newWeight
          }),
        });
      });

      const responses = await Promise.all(updatePromises);
      const failedUpdates = responses.filter(response => !response.ok);

      if (failedUpdates.length > 0) {
        throw new Error("Some weight updates failed");
      }

      toast.success("Bobot rubrik berhasil diperbarui");
      fetchRubrics();
      setWeightSetupOpen(false);
    } catch (error) {
      console.error("Error updating weights:", error);
      toast.error("Gagal memperbarui bobot rubrik");
    } finally {
      setSavingWeights(false);
    }
  };

  const typeLabels: Record<string, string> = {
    TUGAS: "Tugas",
    UTS: "UTS",
    UAS: "UAS",
    PRAKTIK: "Praktik",
    ULANGAN_HARIAN: "Ulangan Harian"
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Rubrik Penilaian"
        description={`Atur rubrik penilaian untuk ${subjectName || "mata pelajaran"} - ${className} ${rombelName}`}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/nilai/input")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Input Nilai
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenWeightSetup}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Setup Bobot
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Rubrik
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : rubrics.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Belum ada rubrik penilaian</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Rubrik Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rubrics.map((rubric) => (
            <Card key={rubric.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {rubric.name}
                      {!rubric.isActive && (
                        <Badge variant="secondary">Tidak Aktif</Badge>
                      )}
                    </CardTitle>
                    {rubric.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {rubric.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(rubric)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rubric)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipe: </span>
                    <span className="font-medium">{typeLabels[rubric.type]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bobot: </span>
                    <span className="font-medium">{rubric.weight}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nilai Maksimal: </span>
                    <span className="font-medium">{rubric.maxScore}</span>
                  </div>
                </div>

                {rubric.criteria.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Kriteria Penilaian:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kriteria</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead className="text-right">Nilai Maks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rubric.criteria.map((criteria) => (
                          <TableRow key={criteria.id}>
                            <TableCell className="font-medium">{criteria.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {criteria.description || "-"}
                            </TableCell>
                            <TableCell className="text-right">{criteria.maxScore}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRubric ? "Edit Rubrik" : "Tambah Rubrik Baru"}
            </DialogTitle>
            <DialogDescription>
              Buat rubrik penilaian dengan kriteria yang detail untuk penilaian yang lebih variatif
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Rubrik <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Misal: Tugas Proyek Akhir Semester"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi singkat tentang rubrik ini"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Jelaskan tujuan dan kriteria umum dari rubrik penilaian ini
                  </p>
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Tipe Penilaian <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TUGAS">Tugas</SelectItem>
                      <SelectItem value="UTS">UTS</SelectItem>
                      <SelectItem value="UAS">UAS</SelectItem>
                      <SelectItem value="PRAKTIK">Praktik</SelectItem>
                      <SelectItem value="ULANGAN_HARIAN">Ulangan Harian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <Label htmlFor="weight">
                    Bobot <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
                    placeholder="10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Kontribusi terhadap nilai akhir (dalam %)
                  </p>
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore">
                    Skor Maksimal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                    placeholder="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Nilai tertinggi yang bisa dicapai
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Aktifkan rubrik ini</Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Rubrik yang tidak aktif tidak akan muncul dalam opsi penilaian
                </p>
              </div>
            </div>

            {/* Kriteria Penilaian Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Kriteria Penilaian</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tentukan kriteria-kriteria yang akan dinilai dalam rubrik ini
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCriteria}>
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Kriteria
                </Button>
              </div>

              <div className="space-y-3">
                {formData.criteria.map((criteria, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-5">
                          <div className="space-y-2">
                            <Label htmlFor={`criteria-name-${index}`} className="text-sm font-medium">
                              Nama Kriteria <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={`criteria-name-${index}`}
                              value={criteria.name}
                              onChange={(e) => handleCriteriaChange(index, "name", e.target.value)}
                              placeholder="Misal: Kelengkapan"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-span-5">
                          <div className="space-y-2">
                            <Label htmlFor={`criteria-desc-${index}`} className="text-sm font-medium">
                              Deskripsi
                            </Label>
                            <Input
                              id={`criteria-desc-${index}`}
                              value={criteria.description || ""}
                              onChange={(e) => handleCriteriaChange(index, "description", e.target.value)}
                              placeholder="Deskripsi kriteria (opsional)"
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="space-y-2">
                            <Label htmlFor={`criteria-max-${index}`} className="text-sm font-medium">
                              Nilai Maks <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`criteria-max-${index}`}
                                type="number"
                                min="1"
                                value={criteria.maxScore}
                                onChange={(e) => handleCriteriaChange(index, "maxScore", parseInt(e.target.value))}
                                required
                              />
                              {formData.criteria.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCriteria(index)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Total Nilai Maksimal Kriteria:</strong> {formData.criteria.reduce((sum, c) => sum + (c.maxScore || 0), 0)} / 100
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pastikan total nilai maksimal tidak melebihi 100 untuk menghindari kesalahan penyimpanan
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRubric ? "Update" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Rubrik</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus rubrik <strong>&ldquo;{deletingRubric?.name}&rdquo;</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800">
                    Perhatian: Data nilai akan terpengaruh
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Jika rubrik ini dihapus, maka semua nilai yang telah diinput menggunakan rubrik ini juga akan ikut terhapus dari sistem penilaian siswa.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus Rubrik
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weight Setup Modal */}
      <Dialog open={weightSetupOpen} onOpenChange={setWeightSetupOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Setup Bobot Rubrik</DialogTitle>
            <DialogDescription>
              Atur bobot untuk setiap rubrik penilaian. Total bobot akan mempengaruhi perhitungan nilai akhir siswa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <div className="flex-shrink-0 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Informasi</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Bobot menentukan kontribusi setiap rubrik terhadap nilai akhir. Total bobot yang lebih tinggi akan memberikan pengaruh lebih besar pada nilai akhir siswa.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-2">
                {rubrics.map((rubric) => (
                  <div key={rubric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{rubric.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {rubric.description || "Tidak ada deskripsi"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[rubric.type as keyof typeof typeLabels] || rubric.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Max: {rubric.maxScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Label htmlFor={`weight-${rubric.id}`} className="text-sm font-medium">
                          Bobot
                        </Label>
                        <div className="text-xs text-muted-foreground">
                          Saat ini: {rubric.weight}
                        </div>
                      </div>
                      <Input
                        id={`weight-${rubric.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={weightData[rubric.id] || 0}
                        onChange={(e) => handleWeightChange(rubric.id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {rubrics.length > 0 && (
              <div className="flex-shrink-0 p-3 bg-gray-50 border rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Total Bobot: </span>
                  <span className={`font-bold ${Object.values(weightData).reduce((sum, weight) => sum + weight, 0) > 100 ? 'text-red-600' : 'text-green-600'}`}>
                    {Object.values(weightData).reduce((sum, weight) => sum + weight, 0).toFixed(1)}
                  </span>
                  {Object.values(weightData).reduce((sum, weight) => sum + weight, 0) > 100 && (
                    <span className="text-red-600 text-xs ml-2">(Melebihi 100)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWeightSetupOpen(false)}
              disabled={savingWeights}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={saveWeights}
              disabled={savingWeights || rubrics.length === 0}
            >
              {savingWeights && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Bobot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
