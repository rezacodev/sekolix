"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject {
  id: number;
  code?: string;
  name: string;
  is_practice: boolean;
  classes: Array<{
    class: { id: number; name: string };
  }>;
  programs: Array<{
    program: { id: string; name: string };
  }>;
}

interface Curriculum {
  id: number;
  code?: string;
  name: string;
  description?: string;
}

export default function CurriculumDistributionPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = parseInt(params.id as string);

  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Kurikulum & Mata Pelajaran", href: "/admin/manajemen-akademik/kurikulum-mapel" },
        { label: "Kurikulum", href: "/admin/manajemen-akademik/kurikulum-mapel/kurikulum" },
        { label: "Distribusi", href: `/admin/manajemen-akademik/kurikulum-mapel/kurikulum/${curriculumId}/distribusi` }
      ]);
    }
  }, [setBreadcrumbs, curriculumId]);

  const fetchCurriculum = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/manajemen-akademik/kurikulum-mapel/curriculums/${curriculumId}`);
      if (res.ok) {
        const result = await res.json();
        setCurriculum(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch curriculum", error);
    }
  }, [curriculumId]);

  const fetchSubjects = useCallback(async () => {
    try {
      const q = new URLSearchParams({
        page: String(pageIndex),
        pageSize: String(pageSize),
        search,
        curriculum_id: String(curriculumId),
        ...filters
      });
      const res = await fetch(`/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran?${q.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setSubjects(result.data);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    } finally {
      setLoading(false);
    }
  }, [curriculumId, pageIndex, pageSize, search, filters]);

  useEffect(() => {
    fetchCurriculum();
    fetchSubjects();
  }, [fetchCurriculum, fetchSubjects]);

  const filterConfig: never[] = [];

  const columns = [
    { accessorKey: "code", header: "Kode", cell: ({ getValue }: { getValue: () => unknown }) => getValue() || "-" },
    { accessorKey: "name", header: "Nama Mata Pelajaran" },
    {
      accessorKey: "is_practice",
      header: "Praktik",
      cell: ({ getValue }: { getValue: () => unknown }) => (
        <Badge variant={getValue() as boolean ? "default" : "secondary"}>
          {(getValue() as boolean) ? "Ya" : "Tidak"}
        </Badge>
      )
    },
    {
      accessorKey: "classes",
      header: "Kelas",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex flex-wrap gap-1 max-w-64">
          {row.original.classes.length > 0 ? (
            row.original.classes.map((sc, index) => (
              <Badge key={index} variant="outline" className="text-xs truncate flex-shrink-0">
                {sc.class.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "programs",
      header: "Program",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex flex-wrap gap-1 max-w-64">
          {row.original.programs.length > 0 ? (
            row.original.programs.map((sp, index) => (
              <Badge key={index} variant="outline" className="text-xs truncate flex-shrink-0">
                {sp.program.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )
    }
  ];

  const onFilterChange = (column: string, value?: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPageIndex(0);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Memuat..."
          description="Sedang memuat data distribusi kurikulum"
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <AdminPageHeader
            title={`Distribusi Mata Pelajaran`}
            description={`Kurikulum: ${curriculum?.name || 'Memuat...'}`}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/manajemen-akademik/kurikulum-mapel/kurikulum')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      {curriculum && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kurikulum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Kode:</span>
                <p className="text-muted-foreground">{curriculum.code || '-'}</p>
              </div>
              <div>
                <span className="font-medium">Nama:</span>
                <p className="text-muted-foreground">{curriculum.name}</p>
              </div>
              <div>
                <span className="font-medium">Deskripsi:</span>
                <p className="text-muted-foreground">{curriculum.description || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Pelajaran ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={subjects}
            searchKey="name"
            filterConfig={filterConfig}
            externalFilters={filters}
            onFilterChange={onFilterChange}
            onSearchChange={onSearchChange}
            serverSide
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}