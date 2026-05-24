"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useBreadcrumb } from "../../../../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { 
  Pencil, 
  Book, 
  Target, 
  Clock,
  Lightbulb,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface LessonPlan {
  id: number;
  syllabusId: number;
  meetingNumber: number;
  title: string;
  learningObjectives: string | null;
  subjectMatter: string | null;
  openingActivities: string | null;
  coreActivities: string | null;
  closingActivities: string | null;
  assessmentTechnique: string | null;
  assessmentInstrument: string | null;
  timeAllocation: string | null;
  mediaAndTools: string | null;
  learningResources: string | null;
  teachingMethod: string | null;
  indicators: string | null;
  notes: string | null;
  fileUrl: string | null;
  fileName: string | null;
  syllabus: {
    id: number;
    title: string;
    subjectId: number;
    classId: number;
    academicYear: string;
    semester: number;
    subject: {
      id: number;
      name: string;
      code: string | null;
    };
    class: {
      id: number;
      name: string;
    };
  };
}

export default function RPPDetailPage() {
  const params = useParams();
  const { setBreadcrumbs } = useBreadcrumb();
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const syllabusId = params?.id as string;
  const rppId = params?.rppId as string;

  useEffect(() => {
    fetchLessonPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabusId, rppId]);

  const fetchLessonPlan = async () => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/syllabus/${syllabusId}/rpp/${rppId}`);
      if (!response.ok) throw new Error("Failed to fetch lesson plan");
      
      const data = await response.json();
      setLessonPlan(data.lessonPlan);

      if (setBreadcrumbs) {
        setBreadcrumbs([
          { label: "Pembelajaran", href: "/teacher" },
          { label: "Silabus & RPP", href: "/teacher/pembelajaran/silabus" },
          { label: data.lessonPlan.syllabus.title, href: `/teacher/pembelajaran/silabus/${syllabusId}` },
          { label: data.lessonPlan.title },
        ]);
      }
    } catch (error) {
      console.error("Error fetching lesson plan:", error);
      toast.error("Gagal memuat data RPP");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">RPP tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={lessonPlan.title}
        description={`Pertemuan ${lessonPlan.meetingNumber} - ${lessonPlan.syllabus.subject.name} Kelas ${lessonPlan.syllabus.class.name}`}
        backHref={`/teacher/pembelajaran/silabus/${syllabusId}`}
        backLabel="Kembali ke Silabus"
      >
        <Link href={`/teacher/pembelajaran/rpp/${rppId}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit RPP
          </Button>
        </Link>
      </PageHeader>

      <div className="mt-6 space-y-6">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Informasi RPP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Silabus</label>
                <p className="text-base mt-1">{lessonPlan.syllabus.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pertemuan</label>
                <p className="text-base mt-1">
                  <Badge>Pertemuan {lessonPlan.meetingNumber}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mata Pelajaran</label>
                <p className="text-base mt-1">{lessonPlan.syllabus.subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kelas</label>
                <p className="text-base mt-1">Kelas {lessonPlan.syllabus.class.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tahun Ajaran / Semester</label>
                <p className="text-base mt-1">
                  {lessonPlan.syllabus.academicYear} / Semester {lessonPlan.syllabus.semester}
                </p>
              </div>
              {lessonPlan.timeAllocation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Alokasi Waktu
                  </label>
                  <p className="text-base mt-1">{lessonPlan.timeAllocation}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tujuan Pembelajaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tujuan Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lessonPlan.learningObjectives || "-"}
            </p>
          </CardContent>
        </Card>

        {/* Materi Pembelajaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Materi Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lessonPlan.subjectMatter || "-"}
            </p>
          </CardContent>
        </Card>

        {/* Kegiatan Pembelajaran */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Kegiatan Pembelajaran</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Kegiatan Pendahuluan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.openingActivities || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kegiatan Inti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.coreActivities || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kegiatan Penutup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.closingActivities || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Penilaian */}
        <Card>
          <CardHeader>
            <CardTitle>Teknik Penilaian</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {lessonPlan.assessmentTechnique || "-"}
            </p>
          </CardContent>
        </Card>

        {/* Alat & Sumber */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Media & Alat Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.mediaAndTools || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sumber Belajar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.learningResources || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Catatan */}
        {lessonPlan.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {lessonPlan.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
