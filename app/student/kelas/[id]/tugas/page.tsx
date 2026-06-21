"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  X,
  Star,
  Calendar,
  Trash2,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: "upload" | "text" | "link";
  dueDate: string;
  point: number;
  status: "belum" | "dikumpulkan" | "terlambat" | "dinilai";
  submission?: {
    submittedAt: string;
    content?: string;
    fileUrl?: string;
    fileName?: string;
  };
  grade?: number;
  feedback?: string;
  rubric?: string;
}

export default function TugasPage({ params }: { params: { id: string } }) {
  const rombelId = params.id;
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "PR Bab 1: Operasi Dasar",
      description: "Kerjakan soal-soal di halaman 15-20 buku paket",
      type: "upload",
      dueDate: "2026-05-31",
      point: 20,
      status: "dinilai",
      submission: {
        submittedAt: "2026-05-30T10:30:00Z",
        fileUrl: "/submissions/pr1.pdf",
        fileName: "pr1.pdf",
      },
      grade: 85,
      feedback: "Bagus! Hanya ada 2 soal yang kurang tepat. Baca pembahasan soal no 5 dan 8.",
    },
    {
      id: "2",
      title: "Tugas Kelompok: Proyek Statistik",
      description: "Buat analisis statistik tentang data kesehatan dengan minimal 50 data",
      type: "link",
      dueDate: "2026-06-02",
      point: 30,
      status: "dikumpulkan",
      submission: {
        submittedAt: "2026-05-29T15:45:00Z",
        content: "https://docs.google.com/presentation/d/1234567/edit",
      },
    },
    {
      id: "3",
      title: "Essay: Penerapan Matematika dalam Kehidupan",
      description:
        "Tulis essay minimal 500 kata tentang penerapan konsep matematika dalam kehidupan sehari-hari",
      type: "text",
      dueDate: "2026-06-05",
      point: 25,
      status: "belum",
    },
    {
      id: "4",
      title: "PR Bab 2: Aljabar Linear",
      description: "Kerjakan soal yang diberikan di Lembar Kerja Siswa (LKS)",
      type: "upload",
      dueDate: "2026-05-28",
      point: 20,
      status: "terlambat",
      submission: {
        submittedAt: "2026-05-29T08:00:00Z",
        fileUrl: "/submissions/pr2.pdf",
        fileName: "pr2.pdf",
      },
    },
  ]);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [linkContent, setLinkContent] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "belum":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "dikumpulkan":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "terlambat":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "dinilai":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "belum":
        return "Belum Dikumpulkan";
      case "dikumpulkan":
        return "Dikumpulkan";
      case "terlambat":
        return "Terlambat";
      case "dinilai":
        return "Sudah Dinilai";
      default:
        return "";
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const filteredAssignments = assignments.filter((a) =>
    filterStatus === "semua" ? true : a.status === filterStatus
  );

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update assignment status
    const updated = assignments.map((a) =>
      a.id === selectedAssignment.id
        ? {
            ...a,
            status: "dikumpulkan",
            submission: {
              submittedAt: new Date().toISOString(),
              ...(selectedAssignment.type === "upload"
                ? { fileUrl: "/tmp/" + uploadedFile?.name, fileName: uploadedFile?.name }
                : selectedAssignment.type === "text"
                ? { content: textContent }
                : { content: linkContent }),
            },
          }
        : a
    );
    setAssignments(updated);
    setSelectedAssignment(updated.find((a) => a.id === selectedAssignment.id) || null);

    setIsSubmitting(false);
    setUploadedFile(null);
    setTextContent("");
    setLinkContent("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tugas List */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tugas & Pengumpulan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Rombel X-A • Matematika</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["semua", "belum", "dikumpulkan", "dinilai"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filterStatus === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
              }`}
            >
              {status === "semua"
                ? "Semua"
                : status === "belum"
                ? "Belum"
                : status === "dikumpulkan"
                ? "Dikumpulkan"
                : "Dinilai"}
            </button>
          ))}
        </div>

        {/* Tugas Items */}
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const isSelected = selectedAssignment?.id === assignment.id;
            const overdue = isOverdue(assignment.dueDate) && assignment.status === "belum";

            return (
              <Card
                key={assignment.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    {/* Type Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {assignment.type === "upload" && (
                        <Upload className="w-5 h-5 text-blue-500" />
                      )}
                      {assignment.type === "text" && (
                        <FileText className="w-5 h-5 text-purple-500" />
                      )}
                      {assignment.type === "link" && <FileText className="w-5 h-5 text-green-500" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(
                            assignment.status
                          )}`}
                        >
                          {getStatusLabel(assignment.status)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {assignment.description}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Deadline: {new Date(assignment.dueDate).toLocaleDateString("id-ID")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {assignment.point} poin
                        </div>
                        {overdue && (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            Terlewat!
                          </div>
                        )}
                      </div>

                      {assignment.status === "dinilai" && assignment.grade && (
                        <div className="mt-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Nilai: {assignment.grade}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Submission Panel */}
      <div className="lg:col-span-1">
        {selectedAssignment ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{selectedAssignment.title}</CardTitle>
              <CardDescription>{selectedAssignment.type.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deskripsi */}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Deskripsi:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAssignment.description}</p>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                  <span
                    className={`font-medium ${
                      isOverdue(selectedAssignment.dueDate) && selectedAssignment.status === "belum"
                        ? "text-red-600 dark:text-red-400"
                        : ""
                    }`}
                  >
                    {new Date(selectedAssignment.dueDate).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Poin</span>
                  <span className="font-medium">{selectedAssignment.point}</span>
                </div>
                {selectedAssignment.submission && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Dikumpulkan</span>
                    <span className="font-medium">
                      {new Date(selectedAssignment.submission.submittedAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                )}
                {selectedAssignment.grade && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nilai</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {selectedAssignment.grade}
                    </span>
                  </div>
                )}
              </div>

              {/* Submission Form */}
              {selectedAssignment.status === "belum" && (
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {selectedAssignment.type === "upload" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Upload File
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) setUploadedFile(file);
                        }}
                      >
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        {uploadedFile ? (
                          <div>
                            <p className="font-medium text-sm">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024).toFixed(2)} KB
                            </p>
                            <button
                              onClick={() => setUploadedFile(null)}
                              className="mt-2 text-xs text-red-600 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Drag & drop file atau klik untuk upload
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Max 20MB (PDF, JPEG, PNG, DOCX)</p>
                          </div>
                        )}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedAssignment.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Tulis Jawaban
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="Tulis jawaban kamu di sini..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{textContent.length} karakter</p>
                    </div>
                  )}

                  {selectedAssignment.type === "link" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Paste Link
                      </label>
                      <Input
                        type="url"
                        placeholder="https://docs.google.com/..."
                        value={linkContent}
                        onChange={(e) => setLinkContent(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pastikan link bisa diakses oleh guru
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      (selectedAssignment.type === "upload" && !uploadedFile) ||
                      (selectedAssignment.type === "text" && !textContent) ||
                      (selectedAssignment.type === "link" && !linkContent)
                    }
                    className="w-full"
                  >
                    {isSubmitting ? "Mengirim..." : "Kumpulkan"}
                  </Button>
                </div>
              )}

              {/* Submitted Content */}
              {selectedAssignment.submission && selectedAssignment.status !== "belum" && (
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-sm">Pengumpulan Kamu:</h4>
                  {selectedAssignment.type === "upload" && selectedAssignment.submission.fileName && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{selectedAssignment.submission.fileName}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        Unduh
                      </Button>
                    </div>
                  )}
                  {(selectedAssignment.type === "text" || selectedAssignment.type === "link") &&
                    selectedAssignment.submission.content && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm break-all">{selectedAssignment.submission.content}</p>
                      </div>
                    )}
                </div>
              )}

              {/* Feedback */}
              {selectedAssignment.feedback && (
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-sm">Feedback Guru:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="sticky top-6">
            <CardContent className="pt-6 text-center text-gray-500">
              <p className="text-sm">Pilih tugas untuk melihat detail dan mengumpulkan</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
