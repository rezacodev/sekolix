"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Pencil,
  Plus,
  X,
} from "lucide-react";

interface FormData {
  date: string;
  timeStart: string;
  timeEnd: string;
  period: string;
  topic: string;
  teachingMethod: string;
  mediaUsed: string;
  obstacles: string;
  followUp: string;
  notes: string;
}

interface InputJurnalTabProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  editingId: number | null;
  saving: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancelEdit: () => void;
}

export function InputJurnalTab({
  formData,
  setFormData,
  editingId,
  saving,
  handleSubmit,
  handleCancelEdit,
}: InputJurnalTabProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil className="h-5 w-5" />
                Edit Jurnal Mengajar
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Tambah Jurnal Mengajar
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date & Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeStart">Jam Mulai</Label>
              <Input
                id="timeStart"
                type="time"
                value={formData.timeStart}
                onChange={(e) =>
                  setFormData({ ...formData, timeStart: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeEnd">Jam Selesai</Label>
              <Input
                id="timeEnd"
                type="time"
                value={formData.timeEnd}
                onChange={(e) =>
                  setFormData({ ...formData, timeEnd: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Jam Pelajaran Ke-</Label>
              <Input
                id="period"
                type="number"
                min="1"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                placeholder="Contoh: 1"
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Materi/Topik yang Diajarkan{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="topic"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              placeholder="Jelaskan materi yang diajarkan pada pertemuan ini"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Jelaskan secara detail materi pembelajaran yang disampaikan
            </p>
          </div>

          {/* Teaching Method */}
          <div className="space-y-2">
            <Label htmlFor="teachingMethod">Metode Pembelajaran</Label>
            <Textarea
              id="teachingMethod"
              value={formData.teachingMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  teachingMethod: e.target.value,
                })
              }
              placeholder="Contoh: Ceramah, diskusi kelompok, praktik langsung, pembelajaran berbasis proyek, dll."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Metode atau pendekatan yang digunakan dalam pembelajaran
            </p>
          </div>

          {/* Media Used */}
          <div className="space-y-2">
            <Label htmlFor="mediaUsed">Media Pembelajaran</Label>
            <Textarea
              id="mediaUsed"
              value={formData.mediaUsed}
              onChange={(e) =>
                setFormData({ ...formData, mediaUsed: e.target.value })
              }
              placeholder="Contoh: Proyektor, whiteboard, modul cetak, video pembelajaran, aplikasi digital, dll."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Alat bantu atau media yang digunakan selama pembelajaran
            </p>
          </div>

          {/* Obstacles */}
          <div className="space-y-2">
            <Label htmlFor="obstacles">Kendala/Hambatan</Label>
            <Textarea
              id="obstacles"
              value={formData.obstacles}
              onChange={(e) =>
                setFormData({ ...formData, obstacles: e.target.value })
              }
              placeholder="Kendala atau hambatan yang dihadapi selama pembelajaran (opsional)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Catat kendala yang dihadapi untuk evaluasi dan perbaikan
            </p>
          </div>

          {/* Follow Up */}
          <div className="space-y-2">
            <Label htmlFor="followUp">Tindak Lanjut</Label>
            <Textarea
              id="followUp"
              value={formData.followUp}
              onChange={(e) =>
                setFormData({ ...formData, followUp: e.target.value })
              }
              placeholder="Rencana tindak lanjut untuk pertemuan berikutnya (opsional)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Rencana perbaikan atau kegiatan lanjutan di pertemuan mendatang
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Catatan penting lainnya (opsional)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Informasi tambahan yang perlu didokumentasikan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {editingId && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelEdit}
          >
            <X className="mr-2 h-4 w-4 text-current" />
            Batal Edit
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4 text-current" />
          {saving
            ? "Menyimpan..."
            : editingId
            ? "Perbarui Jurnal"
            : "Simpan Jurnal"}
        </Button>
      </div>
    </form>
  );
}
