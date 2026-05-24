"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { Plus, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
// import TransferWizard from "./TransferWizard";

interface TransferBatch {
  id: string;
  name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  fromYear: { label: string };
  toYear: { label: string };
  createdAt: string;
  _count: { transfers: number };
}

const statusConfig = {
  PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  IN_PROGRESS: { label: "Sedang Diproses", color: "bg-blue-100 text-blue-800", icon: Users },
  COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: AlertCircle }
};

export default function TransferPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [transferBatches, setTransferBatches] = useState<TransferBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Rombel", href: "/admin/manajemen-akademik/rombel" },
        { label: "Transfer Siswa", href: "/admin/manajemen-akademik/rombel/transfer" }
      ]);
    }
    fetchTransferBatches();
  }, [setBreadcrumbs]);

  const fetchTransferBatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/manajemen-akademik/rombel/transfer/batches");
      if (response.ok) {
        const data = await response.json();
        setTransferBatches(data.data);
      }
    } catch (error) {
      console.error("Error fetching transfer batches:", error);
      toast.error("Gagal memuat data transfer");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Nama Transfer",
      cell: ({ row }: { row: { original: TransferBatch } }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.fromYear.label} → {row.original.toYear.label}
          </div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: TransferBatch } }) => {
        const status = statusConfig[row.original.status];
        const Icon = status.icon;
        return (
          <Badge className={status.color}>
            <Icon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        );
      }
    },
    {
      accessorKey: "_count.transfers",
      header: "Jumlah Siswa",
      cell: ({ row }: { row: { original: TransferBatch } }) => (
        <span className="font-medium">{row.original._count.transfers} siswa</span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      cell: ({ row }: { row: { original: TransferBatch } }) =>
        new Date(row.original.createdAt).toLocaleDateString("id-ID")
    }
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Transfer Siswa"
        description="Kelola perpindahan siswa antar kelas dan tahun ajaran"
      >
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Buat Transfer Baru (Coming Soon)
        </Button>
      </PageHeader>

      <div className="mt-6">
        {isLoading ? (
          <div>Memuat...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transfer</CardTitle>
              <CardDescription>Daftar semua batch transfer siswa yang telah dibuat</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={transferBatches}
                searchKey="name"
                serverSide={false}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* <TransferWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={() => {
          fetchTransferBatches();
          setWizardOpen(false);
        }}
      /> */}
    </div>
  );
}
