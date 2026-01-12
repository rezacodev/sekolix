"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Rombel {
  id: number;
  class_id: number;
  program_id: string;
  name: string;
  capacity?: number;
  student_count: number;
  class: {
    id: number;
    name: string;
  };
  tahunAjaran?: {
    id: string;
    label: string;
  };
  program: {
    id: string;
    name: string;
  };
  students: Array<{
    id: number;
    fullName: string;
    nisn: string;
    gender?: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    religion?: string;
    phone?: string;
  }>;
}

interface PreviousRombel {
  id: number;
  name: string;
  class: {
    id: number;
    name: string;
  };
  program: {
    id: string;
    name: string;
  };
  tahunAjaran: {
    id: string;
    label: string;
  };
  studentCount: number;
  students: Array<{
    id: number;
    nisn: string;
    fullName: string;
  }>;
}

export default function RombelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [rombel, setRombel] = useState<Rombel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [previousRombels, setPreviousRombels] = useState<PreviousRombel[]>([]);
  const [selectedSourceRombel, setSelectedSourceRombel] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  const rombelId = params.id as string;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Rombel, Pengampu & Jadwal", href: "/admin/manajemen-akademik/rombel" },
        { label: rombel?.name || "Kelola Siswa", href: `/admin/manajemen-akademik/rombel/detail/${rombelId}` }
      ]);
    }
  }, [setBreadcrumbs, rombelId, rombel?.name]);

  useEffect(() => {
    const fetchRombel = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}`);
        if (response.ok) {
          const data = await response.json();
          setRombel(data);
        } else {
          router.push("/admin/manajemen-akademik/rombel");
        }
      } catch (error) {
        console.error("Error fetching rombel:", error);
        router.push("/admin/manajemen-akademik/rombel");
      } finally {
        setIsLoading(false);
      }
    };

    if (rombelId) {
      fetchRombel();
    }
  }, [rombelId, router]);

  const fetchPreviousYearRombels = async () => {
    try {
      const response = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/previous-year-rombels`);
      if (response.ok) {
        const data = await response.json();
        setPreviousRombels(data);
      }
    } catch (error) {
      console.error("Error fetching previous year rombels:", error);
      toast.error("Gagal memuat data rombel tahun sebelumnya");
    }
  };

  const handleTransferDialogOpen = async (open: boolean) => {
    setIsTransferDialogOpen(open);
    if (open) {
      await fetchPreviousYearRombels();
    } else {
      setSelectedSourceRombel("");
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const sourceRombel = previousRombels.find(r => r.id.toString() === selectedSourceRombel);
    if (!sourceRombel) return;

    if (selectedStudents.length === sourceRombel.students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sourceRombel.students.map(s => s.id));
    }
  };

  const handleTransferStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Pilih minimal 1 siswa untuk ditransfer");
      return;
    }

    try {
      setIsTransferring(true);
      const response = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}/transfer-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceRombelId: parseInt(selectedSourceRombel),
          studentIds: selectedStudents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Gagal mentransfer siswa");
        return;
      }

      toast.success(data.message);
      setIsTransferDialogOpen(false);
      setSelectedSourceRombel("");
      setSelectedStudents([]);

      // Refresh rombel data
      const rombelResponse = await fetch(`/api/admin/manajemen-akademik/rombel/${rombelId}`);
      if (rombelResponse.ok) {
        const rombelData = await rombelResponse.json();
        setRombel(rombelData);
      }
    } catch (error) {
      console.error("Error transferring students:", error);
      toast.error("Terjadi kesalahan saat mentransfer siswa");
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Memuat data rombel...</div>
      </div>
    );
  }

  if (!rombel) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Rombel tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Siswa</h1>
          <p className="text-muted-foreground mt-1">
            {rombel.name} • {rombel.class.name} • {rombel.program.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTransferDialogOpen} onOpenChange={handleTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <UserPlus className="mr-2 h-4 w-4" />
                Transfer Siswa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transfer Siswa dari Tahun Ajaran Sebelumnya</DialogTitle>
                <DialogDescription>
                  Pilih rombel dari tahun ajaran sebelumnya dan siswa yang ingin ditransfer ke rombel ini
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pilih Rombel Sumber</label>
                  <Select value={selectedSourceRombel} onValueChange={(value) => {
                    setSelectedSourceRombel(value);
                    setSelectedStudents([]);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rombel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {previousRombels.map((rombel) => (
                        <SelectItem key={rombel.id} value={rombel.id.toString()}>
                          {rombel.name} - {rombel.class.name} ({rombel.tahunAjaran.label}) - {rombel.studentCount} siswa
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSourceRombel && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Pilih Siswa ({selectedStudents.length} dipilih)
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedStudents.length === previousRombels.find(r => r.id.toString() === selectedSourceRombel)?.students.length
                          ? "Batalkan Semua"
                          : "Pilih Semua"}
                      </Button>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>NISN</TableHead>
                            <TableHead>Nama Lengkap</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previousRombels
                            .find(r => r.id.toString() === selectedSourceRombel)
                            ?.students.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => handleStudentToggle(student.id)}
                                  />
                                </TableCell>
                                <TableCell>{student.nisn}</TableCell>
                                <TableCell>{student.fullName}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsTransferDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleTransferStudents}
                        disabled={isTransferring || selectedStudents.length === 0}
                      >
                        {isTransferring ? "Memproses..." : `Transfer ${selectedStudents.length} Siswa`}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/manajemen-akademik/rombel")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Rombel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nama Rombel</label>
              <p className="text-sm text-muted-foreground">{rombel.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Kelas</label>
              <p className="text-sm text-muted-foreground">{rombel.class.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Program</label>
              <p className="text-sm text-muted-foreground">{rombel.program.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tahun Ajaran</label>
              <p className="text-sm text-muted-foreground">
                {rombel.tahunAjaran?.label ?? "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Kapasitas</label>
              <p className="text-sm text-muted-foreground">
                {rombel.student_count}/{rombel.capacity || 'Tidak dibatasi'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Daftar Siswa ({rombel.students.length})</h3>
            {rombel.students.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>NISN</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Jenis Kelamin</TableHead>
                      <TableHead>Tempat, Tanggal Lahir</TableHead>
                      <TableHead>Agama</TableHead>
                      <TableHead>No. HP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rombel.students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.nisn || '-'}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>{student.gender || '-'}</TableCell>
                        <TableCell>
                          {student.placeOfBirth && student.dateOfBirth
                            ? `${student.placeOfBirth}, ${new Date(student.dateOfBirth).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}`
                            : '-'}
                        </TableCell>
                        <TableCell>{student.religion || '-'}</TableCell>
                        <TableCell>{student.phone || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada siswa di rombel ini</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}