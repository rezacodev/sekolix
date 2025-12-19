"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils/currency";

// use shared formatRupiah util for consistent currency formatting

interface ApplicantWithBilling {
  id: string;
  fullName: string;
  registrationCode?: string | null;
  program?: { name?: string } | null;
  academicYear?: { id?: string; label?: string; registrationFee?: number } | null;
  totalPaid: number;
  registrationFee: number;
  billingStatus: string;
  billDate?: string | Date | null;
  lastPaymentDate?: string | Date | null;
}

export default function PembayaranActions() {
  const [items, setItems] = useState<ApplicantWithBilling[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState<{ id: string; label: string; isActive: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalApplicant, setModalApplicant] = useState<ApplicantWithBilling | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPayments, setHistoryPayments] = useState<{
    id: string;
    applicantId: string;
    method?: string | null;
    amount: number;
    proofUrl?: string | null;
    notes?: string | null;
    createdAt: string;
  }[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState("manual");
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplicants = async (yearId?: string | null) => {
    try {
      const url = new URL("/api/admin/penerimaan-siswa/applicant", window.location.origin);
      const yearToUse = yearId ?? selectedYear;
      if (yearToUse) url.searchParams.set("yearId", yearToUse);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        console.error("Failed to fetch applicants");
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      toast.error("Gagal memuat data pendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/penerimaan-siswa/settings/years");
        if (!res.ok) {
          await fetchApplicants();
          return;
        }
        const data = (await res.json()) as { id: string; label: string; isActive: boolean }[];
        setYears(data || []);
        const active = data.find((y) => y.isActive);
        const defaultYear = active ? active.id : (data && data[0] ? data[0].id : null);
        setSelectedYear(defaultYear);
        setIsLoading(true);
        await fetchApplicants(defaultYear);
      } catch (err) {
        console.error("Failed to fetch years", err);
        await fetchApplicants();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPaymentModal = (app: ApplicantWithBilling) => {
    setModalApplicant(app);
    const remaining = (app.registrationFee || 0) - (app.totalPaid || 0);
    setAmount(remaining > 0 ? remaining : "");
    setMethod("manual");
    setProofUrl("");
    setModalOpen(true);
  };

  const openHistoryModal = async (app: ApplicantWithBilling) => {
    setModalApplicant(app);
    setHistoryOpen(true);
    try {
      const u = new URL('/api/admin/penerimaan-siswa/payments', window.location.origin);
      u.searchParams.set('applicantId', app.id);
      const res = await fetch(u.toString());
      if (res.ok) {
        const data = await res.json();
        setHistoryPayments(data || []);
      } else {
        setHistoryPayments([]);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
      setHistoryPayments([]);
    }
  };

  const submitPayment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!modalApplicant) return;
    const remaining = (modalApplicant?.registrationFee || 0) - (modalApplicant?.totalPaid || 0);
    if (!amount || Number(amount) <= 0) {
      toast.error("Masukkan jumlah yang valid");
      return;
    }
    if (Number(amount) > remaining) {
      toast.error("Jumlah melebihi sisa tagihan");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/penerimaan-siswa/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId: modalApplicant.id, amount: Number(amount), method, proofUrl }),
      });
      if (res.ok) {
        toast.success("Pembayaran berhasil dicatat");
        setModalOpen(false);
        fetchApplicants();
      } else {
        const data = await res.json();
        toast.error(data?.error || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencatat pembayaran (error)");
    } finally {
      setIsSubmitting(false);
    }
  };

  // derive unique programs for filter
  const uniquePrograms = Array.from(
    new Set(
      items
        .map((a) => a.program?.name ?? (a as { programChoice?: string }).programChoice ?? "")
        .filter(Boolean)
    )
  ).sort();

  const filterConfig = [
    {
      column: "billingStatus",
      title: "Status",
      options: [
        { label: "Belum Bayar", value: "Belum Bayar" },
        { label: "Partial", value: "Partial" },
        { label: "Lunas", value: "Lunas" },
      ],
    },
    {
      column: "programChoice",
      title: "Program/Jurusan",
      options: uniquePrograms.map((p) => ({ label: p, value: p })),
    },
  ];

  const columns: ColumnDef<ApplicantWithBilling>[] = [
    {
      accessorKey: "registrationCode",
      header: "Kode",
      cell: ({ row }) => {
        const code = row.original.registrationCode ?? null;
        return code ? (
          <code className="rounded bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">{code}</code>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "fullName",
      header: "Calon",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <a
            href={`/admin/penerimaan-siswa/pendaftaran-baru/${r.id}`}
            className="font-medium text-success hover:text-success-foreground"
          >
            {r.fullName}
          </a>
        );
      },
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => (row.original.program?.name ?? "-"),
    },
    {
      accessorKey: "academicYear",
      header: "Tahun Ajaran",
      cell: ({ row }) => (row.original.academicYear?.label ?? "-"),
    },
    {
      accessorKey: "registrationFee",
      header: "Tagihan",
      cell: ({ row }) => {
        const rf = row.original.registrationFee || 0;
        const date = row.original.billDate ? new Date(row.original.billDate) : null;
        return (
          <div>
            <div>{formatRupiah(rf)}</div>
            <div className="text-xs text-muted-foreground">{date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date) : "-"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalPaid",
      header: "Terbayar",
      cell: ({ row }) => {
        const tp = row.original.totalPaid || 0;
        const pdate = row.original.lastPaymentDate ? new Date(row.original.lastPaymentDate) : null;
        return (
          <div>
            <div>{formatRupiah(tp)}</div>
            <div className="text-xs text-muted-foreground">{pdate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(pdate) : "-"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "billingStatus",
      header: "Status",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const a = row.original;
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
              {a.billingStatus !== "Lunas" && (
                <DropdownMenuItem onClick={() => openPaymentModal(a)}>Catat Pembayaran</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => openHistoryModal(a)}>Lihat Riwayat Pembayaran</DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tagihan & Pembayaran</h1>
        <p className="text-muted-foreground">Daftar semua calon pendaftar beserta status pembayaran mereka.</p>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tahun Ajaran</label>
              <div className="w-64">
                <Select
                  value={selectedYear || undefined}
                  onValueChange={(val) => {
                    setSelectedYear(val);
                    setIsLoading(true);
                    void fetchApplicants(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DataTable columns={columns} data={items} searchKey="fullName" filterConfig={filterConfig} />

          {/* Payment Dialog */}
          <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Catat Pembayaran</DialogTitle>
                <DialogDescription>
                  {modalApplicant ? (
                    <div>
                      <div className="font-medium">{modalApplicant.registrationCode ?? "-"} — {modalApplicant.fullName}</div>
                      <div className="text-sm text-muted-foreground">{modalApplicant.program?.name ?? "-"}</div>
                    </div>
                  ) : ""}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submitPayment} className="space-y-4">
                <label className="block text-sm font-semibold text-foreground">
                  Jumlah (sisa: {modalApplicant ? formatRupiah((modalApplicant.registrationFee || 0) - (modalApplicant.totalPaid || 0)) : "-"})
                  <Input
                    value={amount === "" ? "" : String(amount)}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="mt-2"
                    type="number"
                    required
                  />
                </label>
                <label className="block text-sm font-semibold text-foreground">
                  Metode
                  <Input value={method} onChange={(e) => setMethod(e.target.value)} className="mt-2" />
                </label>
                <label className="block text-sm font-semibold text-foreground">
                  URL Bukti (opsional)
                  <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} className="mt-2" />
                </label>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Pembayaran"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* History Dialog */}
          <Dialog open={historyOpen} onOpenChange={(open) => setHistoryOpen(open)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Riwayat Pembayaran</DialogTitle>
                <DialogDescription>
                  {modalApplicant ? `${modalApplicant.registrationCode ?? "-"} — ${modalApplicant.fullName}` : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {historyPayments.length === 0 ? (
                  <div className="text-center py-6">Belum ada pembayaran</div>
                ) : (
                  <div className="flow-root">
                    <ul className="divide-y">
                      {historyPayments.map((p) => (
                        <li key={p.id} className="py-2 flex justify-between">
                          <div>
                            <div className="font-medium">{p.method}</div>
                            <div className="text-sm text-muted-foreground">{p.notes ?? "-"}</div>
                          </div>
                          <div className="text-right">
                            <div>{formatRupiah(p.amount)}</div>
                            <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setHistoryOpen(false)}>Tutup</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
