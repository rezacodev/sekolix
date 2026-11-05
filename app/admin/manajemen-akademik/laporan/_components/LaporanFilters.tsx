"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
}

interface LaporanFiltersProps {
  basePath: string;
  tahunAjaranOptions?: SelectOption[];
  rombelOptions?: SelectOption[];
  showRombel?: boolean;
  showGender?: boolean;
  showStatus?: boolean;
  showRole?: boolean;
  showStatusKepegawaian?: boolean;
  currentValues?: {
    tahunAjaranId?: string;
    rombelId?: string;
    gender?: string;
    status?: string;
    role?: string;
    statusKepegawaian?: string;
  };
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "accepted", label: "Aktif (Diterima)" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "Review" },
  { value: "rejected", label: "Ditolak" },
];

const ROLE_OPTIONS: SelectOption[] = [
  { value: "TEACHER", label: "Guru" },
  { value: "STAFF", label: "Tenaga Kependidikan" },
  { value: "OTHER", label: "Lainnya" },
];

const STATUS_KEPEGAWAIAN_OPTIONS: SelectOption[] = [
  { value: "PNS", label: "PNS" },
  { value: "Non-PNS", label: "Non-PNS" },
];

export function LaporanFilters({
  basePath,
  tahunAjaranOptions = [],
  rombelOptions = [],
  showRombel = false,
  showGender = false,
  showStatus = false,
  showRole = false,
  showStatusKepegawaian = false,
  currentValues = {},
}: LaporanFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tahunAjaranId, setTahunAjaranId] = useState(currentValues.tahunAjaranId ?? "");
  const [rombelId, setRombelId] = useState(currentValues.rombelId ?? "");
  const [gender, setGender] = useState(currentValues.gender ?? "");
  const [status, setStatus] = useState(currentValues.status ?? "accepted");
  const [role, setRole] = useState(currentValues.role ?? "");
  const [statusKepegawaian, setStatusKepegawaian] = useState(
    currentValues.statusKepegawaian ?? ""
  );

  function applyFilters() {
    const params = new URLSearchParams();
    if (tahunAjaranId) params.set("tahunAjaranId", tahunAjaranId);
    if (rombelId) params.set("rombelId", rombelId);
    if (gender) params.set("gender", gender);
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    if (statusKepegawaian) params.set("statusKepegawaian", statusKepegawaian);

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${basePath}?${qs}` : basePath);
    });
  }

  function resetFilters() {
    setTahunAjaranId("");
    setRombelId("");
    setGender("");
    setStatus("accepted");
    setRole("");
    setStatusKepegawaian("");
    startTransition(() => router.push(basePath));
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filter Laporan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tahunAjaranOptions.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tahun Ajaran</label>
              <Select value={tahunAjaranId || "_all"} onValueChange={(v) => setTahunAjaranId(v === "_all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua</SelectItem>
                  {tahunAjaranOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showRombel && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Rombel</label>
              <Select value={rombelId || "_all"} onValueChange={(v) => setRombelId(v === "_all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua rombel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua</SelectItem>
                  {rombelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showGender && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Jenis Kelamin</label>
              <Select value={gender || "_all"} onValueChange={(v) => setGender(v === "_all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua</SelectItem>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatus && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status || "accepted"} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showRole && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={role || "_all"} onValueChange={(v) => setRole(v === "_all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua</SelectItem>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusKepegawaian && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Status Kepegawaian
              </label>
              <Select
                value={statusKepegawaian || "_all"}
                onValueChange={(v) => setStatusKepegawaian(v === "_all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Semua</SelectItem>
                  {STATUS_KEPEGAWAIAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={applyFilters} disabled={isPending}>
            {isPending ? "Memuat..." : "Terapkan Filter"}
          </Button>
          <Button variant="outline" onClick={resetFilters} disabled={isPending}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
