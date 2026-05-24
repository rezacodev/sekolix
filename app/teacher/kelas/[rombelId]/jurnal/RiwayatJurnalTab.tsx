"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Calendar,
  Clock,
  Trash2,
  Pencil,
  Filter,
  Eye,
} from "lucide-react";

interface Journal {
  id: number;
  date: string;
  timeStart?: string;
  timeEnd?: string;
  period?: number;
  topic: string;
  teachingMethod?: string;
  mediaUsed?: string;
  obstacles?: string;
  followUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RiwayatJurnalTabProps {
  journals: Journal[];
  onEdit: (journal: Journal) => void;
  onDelete: (journalId: number) => void;
}

export function RiwayatJurnalTab({
  journals,
  onEdit,
  onDelete,
}: RiwayatJurnalTabProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");  const [detailJournal, setDetailJournal] = useState<Journal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Filter journals
  const filteredJournals = journals.filter((journal) => {
    if (startDate && journal.date < startDate) return false;
    if (endDate && journal.date > endDate) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        journal.topic.toLowerCase().includes(query) ||
        journal.teachingMethod?.toLowerCase().includes(query) ||
        journal.mediaUsed?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Riwayat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Dari Tanggal</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Sampai Tanggal</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="search">Cari Topik/Metode</Label>
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik untuk mencari..."
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Menampilkan {filteredJournals.length} dari {journals.length} jurnal
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Jurnal Mengajar</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredJournals.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Tanggal</TableHead>
                    <TableHead className="w-[120px]">Jam</TableHead>
                    <TableHead className="w-20">Jam Ke-</TableHead>
                    <TableHead>Materi/Topik</TableHead>
                    <TableHead className="w-[200px]">Metode</TableHead>
                    <TableHead className="text-right w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(journal.date).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {journal.timeStart && journal.timeEnd ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {journal.timeStart} - {journal.timeEnd}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {journal.period ? (
                          <Badge variant="outline">{journal.period}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2 text-sm">
                          {journal.topic}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {journal.teachingMethod ? (
                          <div className="line-clamp-1 text-sm text-muted-foreground">
                            {journal.teachingMethod}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDetailJournal(journal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(journal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(journal.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {journals.length === 0
                ? "Belum ada jurnal yang tercatat"
                : "Tidak ada jurnal yang sesuai dengan filter"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detail Jurnal */}
      <Dialog open={!!detailJournal} onOpenChange={() => setDetailJournal(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Jurnal Mengajar</DialogTitle>
          </DialogHeader>

          {detailJournal && (
            <div className="space-y-4">
              {/* Waktu dan Periode */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Waktu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Tanggal</Label>
                      <p className="font-medium">
                        {new Date(detailJournal.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {detailJournal.period && (
                      <div>
                        <Label className="text-muted-foreground">Jam Ke-</Label>
                        <p className="font-medium">{detailJournal.period}</p>
                      </div>
                    )}
                  </div>
                  {(detailJournal.timeStart || detailJournal.timeEnd) && (
                    <div>
                      <Label className="text-muted-foreground">Waktu</Label>
                      <p className="font-medium">
                        {detailJournal.timeStart && detailJournal.timeEnd
                          ? `${detailJournal.timeStart} - ${detailJournal.timeEnd}`
                          : detailJournal.timeStart || detailJournal.timeEnd}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Materi Pembelajaran */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Materi Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Topik/Materi</Label>
                    <p className="font-medium whitespace-pre-wrap">{detailJournal.topic}</p>
                  </div>
                  {detailJournal.teachingMethod && (
                    <div>
                      <Label className="text-muted-foreground">Metode Pembelajaran</Label>
                      <p className="whitespace-pre-wrap">{detailJournal.teachingMethod}</p>
                    </div>
                  )}
                  {detailJournal.mediaUsed && (
                    <div>
                      <Label className="text-muted-foreground">Media yang Digunakan</Label>
                      <p className="whitespace-pre-wrap">{detailJournal.mediaUsed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kendala dan Tindak Lanjut */}
              {(detailJournal.obstacles || detailJournal.followUp) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Kendala & Tindak Lanjut</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {detailJournal.obstacles && (
                      <div>
                        <Label className="text-muted-foreground">Kendala</Label>
                        <p className="whitespace-pre-wrap">{detailJournal.obstacles}</p>
                      </div>
                    )}
                    {detailJournal.followUp && (
                      <div>
                        <Label className="text-muted-foreground">Tindak Lanjut</Label>
                        <p className="whitespace-pre-wrap">{detailJournal.followUp}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Catatan */}
              {detailJournal.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Catatan Tambahan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{detailJournal.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDetailJournal(null)}
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    onEdit(detailJournal);
                    setDetailJournal(null);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Jurnal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteConfirmId}
        title="Hapus Jurnal Mengajar"
        description="Apakah Anda yakin ingin menghapus jurnal mengajar ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Jurnal"
        onConfirm={() => {
          if (deleteConfirmId) {
            onDelete(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
