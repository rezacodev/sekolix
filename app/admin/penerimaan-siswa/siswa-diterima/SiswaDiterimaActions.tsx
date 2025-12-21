"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface ApplicantRow {
  id: string;
  fullName: string;
  registrationCode?: string | null;
  program?: { name?: string } | null;
  academicYear?: { label?: string } | null;
  status?: string;
}

type YearItem = { id: string; label: string; isActive: boolean };

export default function SiswaDiterimaActions() {
  const [items, setItems] = useState<ApplicantRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [years, setYears] = useState<YearItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  // use 'all' as explicit sentinel for no-filter so Select changes reliably
  const [selectedProgram, setSelectedProgram] = useState<string | null>("all");
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/penerimaan-siswa/settings/years');
        if (res.ok) {
          const data = (await res.json()) as YearItem[];
          setYears(data || []);
          const active = (data || []).find((y) => y.isActive);
          const defaultYear = active ? active.id : (data && data[0] ? data[0].id : null);
          setSelectedYear(defaultYear);
          await fetchItems({ yearId: defaultYear ?? undefined });
          return;
        }
      } catch (err) {
        console.error('Failed to fetch years', err);
      }
      await fetchItems({});
    })();
    // fetch master programs for filter options
    (async () => {
      try {
        const res = await fetch('/api/admin/penerimaan-siswa/settings/programs');
        if (res.ok) {
          const data = await res.json();
          setPrograms(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch programs', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async (opts: { yearId?: string | null; program?: string | null } = {}): Promise<void> => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/penerimaan-siswa/applicant', window.location.origin);
      // server-side: request accepted applicants only
      url.searchParams.set('status', 'accepted');
      const yearToUse = Object.prototype.hasOwnProperty.call(opts, 'yearId') ? opts.yearId : selectedYear;
      if (yearToUse) url.searchParams.set('yearId', yearToUse);

      // For program, treat explicit opts.program as override. 'all' means no filter.
      if (Object.prototype.hasOwnProperty.call(opts, 'program')) {
        if (opts.program && opts.program !== 'all') url.searchParams.set('program', opts.program);
      } else if (selectedProgram && selectedProgram !== 'all') {
        url.searchParams.set('program', selectedProgram);
      }

      // pagination params
      url.searchParams.set('page', String(pageIndex));
      url.searchParams.set('pageSize', String(pageSize));
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      if (!res.ok) {
        setItems([]);
        setTotalCount(0);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // legacy fallback
        setItems((data as ApplicantRow[]).filter((a) => a.status === 'accepted'));
        setTotalCount((data as ApplicantRow[]).length);
      } else {
        setItems(data.items || []);
        setTotalCount(data.totalCount ?? 0);
        setPageIndex(data.page ?? pageIndex);
        setPageSize(data.pageSize ?? pageSize);
      }
    } catch (err) {
      console.error('Failed to fetch applicants', err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = (rows: ApplicantRow[]) => {
    if (!rows || rows.length === 0) return;
    const headers = ["Kode", "Nama", "Program", "Tahun Ajaran", "Status"];
    const csv = [headers.join(",")].concat(
      rows.map((r) => [r.registrationCode ?? "", r.fullName, r.program?.name ?? "", r.academicYear?.label ?? "", r.status ?? ""].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siswa_diterima_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<ApplicantRow, unknown>[] = [
    {
      accessorKey: 'registrationCode',
      header: 'Kode',
      cell: ({ row }) => {
        const code = row.getValue('registrationCode') as string | null;
        return code ? (
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">{code}</code>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    { accessorKey: 'fullName', header: 'Nama' },
    { accessorFn: (row) => row.program?.name ?? '', id: 'program', header: 'Program' },
    { accessorFn: (row) => row.academicYear?.label ?? '', id: 'academicYear', header: 'Tahun Ajaran' },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const applicant = row.original as ApplicantRow;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={async () => {
                try {
                  const params = new URLSearchParams();
                  params.set('applicantId', applicant.id);
                  const res = await fetch(`/api/admin/penerimaan-siswa/export/biodata?${params.toString()}`);
                  if (!res.ok) throw new Error('Gagal membuat biodata');
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${applicant.registrationCode ?? applicant.id}_biodata.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error(err);
                  alert('Gagal mencetak biodata');
                }
              }}>Cetak Biodata</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Siswa Diterima</h1>
          <p className="text-muted-foreground">Daftar siswa yang sudah diterima.</p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tahun Ajaran</label>
            <div className="w-64">
              <Select
                value={selectedYear ?? undefined}
                onValueChange={(val) => {
                  const v = val || undefined;
                  setSelectedYear(v ?? null);
                  void fetchItems({ yearId: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status filter removed: this page only displays accepted applicants */}

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Program</label>
            <div className="w-48">
              <Select
                value={selectedProgram ?? undefined}
                onValueChange={(val) => {
                  // Keep 'all' literal in state so Select displays reliably
                  const v = val ?? "all";
                  setSelectedProgram(v ?? null);
                    // pass literal 'all' so fetchItems treats it as clear
                    void fetchItems({ program: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => exportCSV(items)} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Export CSV</button>
            <button
              onClick={async () => {
              try {
                const params = new URLSearchParams();
                params.set('type', 'pdf');
                if (selectedYear) params.set('yearId', selectedYear);
                if (selectedProgram) params.set('program', selectedProgram);
                const res = await fetch(`/api/admin/penerimaan-siswa/export?${params.toString()}`);
                if (!res.ok) throw new Error('Export PDF gagal');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `siswa_diterima_${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert('Gagal mendownload PDF');
              }
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Export PDF
            </button>

            <button
              onClick={async () => {
              try {
                const params = new URLSearchParams();
                params.set('type', 'xlsx');
                if (selectedYear) params.set('yearId', selectedYear);
                if (selectedProgram) params.set('program', selectedProgram);
                const res = await fetch(`/api/admin/penerimaan-siswa/export?${params.toString()}`);
                if (!res.ok) throw new Error('Export Excel gagal');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `siswa_diterima_${new Date().toISOString().slice(0,10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert('Gagal mendownload Excel');
              }
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable<ApplicantRow, unknown>
          columns={columns}
          data={items}
          searchKey="fullName"
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => { setPageIndex(p); void fetchItems({ yearId: selectedYear }); }}
          onPageSizeChange={(ps) => { setPageSize(ps); setPageIndex(0); void fetchItems({ yearId: selectedYear }); }}
          onSearchChange={(v) => { setSearch(v); setPageIndex(0); void fetchItems({ yearId: selectedYear, program: selectedProgram }); }}
        />
      )}
    </div>
  );
}
