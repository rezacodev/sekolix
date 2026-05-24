# Analisis Fitur Aplikasi Sekolix

**Tanggal Analisis:** 15 Mei 2026  
**Analis:** Claude Code (claude-sonnet-4-6)  
**Scope:** Seluruh modul yang terdaftar di menu portal Admin dan portal Guru

---

## Ringkasan Eksekutif

Sekolix adalah sistem manajemen sekolah berbasis Next.js dengan dua portal utama: **Portal Admin** dan **Portal Guru**. Dari total ±40 fitur yang terdaftar di menu navigasi, sekitar **22 fitur sudah berfungsi** (sepenuhnya atau sebagian besar), **11 fitur adalah placeholder kosong**, dan **7 fitur ada di menu tapi tidak memiliki halaman sama sekali** (akan menghasilkan 404).

---

## Status per Modul

### Legenda Status

| Ikon | Arti |
|------|------|
| ✅ | Berfungsi penuh |
| 🟡 | Berfungsi sebagian / ada keterbatasan fungsional |
| 🔴 | Placeholder kosong — halaman ada tapi tidak ada fungsi |
| 💀 | Menu ada, halaman tidak ada (404) |

---

## Portal Admin

### 1. Manajemen Akademik

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Tahun Ajaran | ✅ | CRUD tahun ajaran, set aktif, kalender akademik |
| Data GTK (Guru & Tenaga Kependidikan) | ✅ | CRUD, import CSV, edit detail guru |
| Peserta Didik | ✅ | CRUD, import CSV, assign ke rombel, detail siswa |
| Kurikulum & Mata Pelajaran | ✅ | Kelola kurikulum, mata pelajaran, distribusi ke program |
| Kelas & Rombel | ✅ | CRUD rombel, kelola mapping guru-mapel-rombel, detail rombel |
| Transfer Siswa | ✅ | Wizard transfer/naik kelas batch |
| Ruang & Jam Pelajaran | ✅ | Kelola ruang kelas dan slot jam pelajaran |
| Jadwal Pelajaran | 🟡 | API tersedia, UI kelola jadwal ada di rombel/kelola/[id] |
| **Nilai & Rapor** | 🔴 | Halaman kosong — hanya menampilkan pesan "sedang dalam pengembangan" |
| **Pengaturan Akademik** | 🔴 | Halaman kosong — hanya placeholder teks |

**Temuan kritis:**
- `app/admin/manajemen-akademik/nilai-rapor/page.tsx` — hanya menampilkan teks "Fitur ini sedang dalam pengembangan"
- `app/admin/manajemen-akademik/pengaturan-akademik/page.tsx` — hanya menampilkan teks placeholder, tidak ada form KKM, bobot nilai, skala, dll.

---

### 2. Penerimaan Siswa (SPMB)

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Pendaftaran Baru | ✅ | List pendaftar, detail, ubah status |
| Pembayaran | ✅ | List pembayaran, aksi validasi |
| Siswa Diterima | ✅ | Konversi applicant → peserta didik |
| Settings (Tahun, Program, Kode, Landing) | ✅ | Konfigurasi lengkap tersedia |
| Tahun Ajaran SPMB | ✅ | Kelola tahun penerimaan |
| Programs | ✅ | Kelola program/jurusan |

---

### 3. Landing Website

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Artikel, Berita, Event | ✅ | CRUD konten dengan editor rich text |
| Gallery & Album | ✅ | Upload foto, kelola album, reorder |
| Media | ✅ | Upload dan kelola media Cloudinary |
| Halaman Statis | ✅ | Kelola halaman profil sekolah |
| Pengaturan Tema Landing | ✅ | Pilih tema, konfigurasi warna |
| Fakultas/Tenaga Pendidik | ✅ | Kelola profil tenaga pendidik publik |

---

### 4. Pengaturan Sistem

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Identitas Sekolah | ✅ | Edit nama, logo, kontak, timezone |
| Backup & Restore | 🟡 | UI sangat minimal — tidak ada styling konsisten, tombol HTML biasa |
| **Notifikasi** | 🔴 | Halaman kosong — hanya placeholder |
| **Integrasi & API** | 🔴 | Halaman kosong — hanya placeholder |

---

## Portal Guru

### 5. Dashboard

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Ringkasan hari ini | ✅ | Jadwal, tugas pending, statistik |
| Quick Actions | ✅ | Tombol aksi cepat tersedia |
| Pengumuman | ✅ | List pengumuman dari API |

---

### 6. Kelas Saya

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Daftar Kelas | ✅ | Kartu kelas dengan filter, search, sort |
| Data Siswa per Kelas | ✅ | Tabel siswa, search, modal detail |
| Absensi | ✅ | Input per tanggal, history, rekap, export Excel |
| Jurnal Mengajar | ✅ | Input jurnal, riwayat, filter, export Excel |
| **Tugas per Kelas** | 🟡 | Halaman ada (`/kelas/[rombelId]/tugas/`), tapi hanya filter dari daftar tugas, tidak bisa buat tugas langsung dari sini |

---

### 7. Pembelajaran

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Materi Pembelajaran | ✅ | Upload, list, detail, edit, preview, tracking download |
| Silabus | ✅ | CRUD silabus, duplicate, link ke RPP |
| RPP (Rencana Pelaksanaan Pembelajaran) | ✅ | CRUD RPP, duplicate, preview |

---

### 8. Tugas & Nilai

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Kelola Tugas Online | ✅ | CRUD tugas, deadline, assign ke rombel & mapel |
| Koreksi & Penilaian Tugas | 🟡 | Input nilai & feedback ada, tapi **tidak ada fitur lihat file lampiran siswa** |
| Input Nilai Akademik | ✅ | Spreadsheet inline edit, auto-hitung, flag KKM |
| Rekap & Analisis Nilai | ✅ | Chart distribusi, statistik, export Excel |
| Rubrik Penilaian | ✅ | CRUD rubrik dengan kriteria detail, setup bobot |

**Keterbatasan:**
- Koreksi tugas: siswa tidak bisa upload file jawaban (fitur lampiran belum ada di sisi siswa)
- Bulk import nilai dari Excel belum ada
- Export nilai di rekap menggunakan PATCH untuk update bobot rubrik tapi endpoint PATCH tidak tersedia (hanya PUT)

---

### 9. Ujian & CBT

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| Bank Soal | 🟡 | UI ada dan API tersedia, tapi **API belum diverifikasi terhubung ke model QuestionBank yang benar** di schema |
| **Buat Paket Ujian** | 💀 | Ada di menu (`/teacher/ujian/paket`) tapi **tidak ada file halaman** → 404 |
| **Jadwal & Pelaksanaan** | 💀 | Ada di menu (`/teacher/ujian/jadwal`) tapi **tidak ada file halaman** → 404 |
| **Hasil & Analisis Ujian** | 💀 | Ada di menu (`/teacher/ujian/hasil`) tapi **tidak ada file halaman** → 404 |

**Temuan kritis:** 3 dari 4 sub-menu Ujian & CBT akan menghasilkan error 404. Hanya Bank Soal yang memiliki halaman.

---

### 10. Komunikasi

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| **Forum Diskusi** | 💀 | Ada di menu (`/teacher/komunikasi/forum`) tapi **tidak ada file halaman** → 404 |
| **Pesan & Konsultasi** | 💀 | Ada di menu (`/teacher/komunikasi/pesan`) tapi **tidak ada file halaman** → 404 |
| **Komunikasi Orang Tua** | 💀 | Ada di menu (`/teacher/komunikasi/orang-tua`) tapi **tidak ada file halaman** → 404 |
| **Kolaborasi Guru** | 💀 | Ada di menu (`/teacher/komunikasi/kolaborasi`) tapi **tidak ada file halaman** → 404 |

**Temuan kritis:** Seluruh modul Komunikasi (4 sub-menu) ada di navigasi tapi **tidak ada satu pun halaman** yang dibuat. Semua akan 404.

---

### 11. Laporan

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| **Laporan Mengajar** | 💀 | Ada di menu (`/teacher/laporan/mengajar`) tapi **tidak ada file halaman** → 404 |
| **Laporan Nilai & Prestasi** | 💀 | Ada di menu (`/teacher/laporan/nilai`) tapi **tidak ada file halaman** → 404 |
| **Analisis Pembelajaran** | 💀 | Ada di menu (`/teacher/laporan/analisis`) tapi **tidak ada file halaman** → 404 |

**Temuan kritis:** Seluruh modul Laporan (3 sub-menu) ada di navigasi tapi **tidak ada satu pun halaman** yang dibuat. Semua akan 404.

---

### 12. Pengaturan Guru

| Sub-modul | Status | Catatan |
|-----------|--------|---------|
| **Profil & Pengaturan** | 💀 | Ada di menu (`/teacher/pengaturan`) tapi **tidak ada file halaman** → 404 |

---

## Rekapitulasi Temuan

### Jumlah Fitur per Status

| Status | Jumlah | Persentase |
|--------|--------|------------|
| ✅ Berfungsi penuh | 22 | ~51% |
| 🟡 Berfungsi sebagian | 6 | ~14% |
| 🔴 Placeholder kosong | 6 | ~14% |
| 💀 Menu ada, halaman tidak ada (404) | 10 | ~23% |

**Total fitur di menu navigasi: ~44**

---

## Daftar Fitur Tidak Berfungsi (Prioritas Perbaikan)

### Prioritas Tinggi — Akan Menyebabkan 404 saat Diklik

1. **[Portal Guru] Ujian & CBT → Buat Paket Ujian** (`/teacher/ujian/paket`)
2. **[Portal Guru] Ujian & CBT → Jadwal & Pelaksanaan** (`/teacher/ujian/jadwal`)
3. **[Portal Guru] Ujian & CBT → Hasil & Analisis** (`/teacher/ujian/hasil`)
4. **[Portal Guru] Komunikasi → Forum Diskusi** (`/teacher/komunikasi/forum`)
5. **[Portal Guru] Komunikasi → Pesan & Konsultasi** (`/teacher/komunikasi/pesan`)
6. **[Portal Guru] Komunikasi → Komunikasi Orang Tua** (`/teacher/komunikasi/orang-tua`)
7. **[Portal Guru] Komunikasi → Kolaborasi Guru** (`/teacher/komunikasi/kolaborasi`)
8. **[Portal Guru] Laporan → Laporan Mengajar** (`/teacher/laporan/mengajar`)
9. **[Portal Guru] Laporan → Laporan Nilai & Prestasi** (`/teacher/laporan/nilai`)
10. **[Portal Guru] Laporan → Analisis Pembelajaran** (`/teacher/laporan/analisis`)
11. **[Portal Guru] Pengaturan** (`/teacher/pengaturan`)

### Prioritas Tinggi — Halaman Ada tapi Tidak Berfungsi

12. **[Admin] Nilai & Rapor** — Hanya pesan "sedang dalam pengembangan"
13. **[Admin] Pengaturan Akademik** — Hanya placeholder teks, tidak ada form KKM/bobot

### Prioritas Sedang — Placeholder / Fungsi Tidak Lengkap

14. **[Admin] Pengaturan → Notifikasi** — Hanya teks placeholder
15. **[Admin] Pengaturan → Integrasi & API** — Hanya teks placeholder
16. **[Guru] Koreksi Tugas** — Siswa tidak bisa upload lampiran jawaban
17. **[Guru] Bank Soal** — Perlu verifikasi koneksi API ke model QuestionBank

### Prioritas Rendah — Fitur Parsial / Minor

18. **[Admin] Backup & Restore** — Berfungsi tapi UI tidak konsisten (tombol HTML biasa, tidak menggunakan komponen UI)
19. **[Guru] Tugas per Kelas** — Ada halaman tapi tidak bisa buat tugas langsung, hanya filter
20. **[Guru] Input Nilai → Bulk import dari Excel** — Belum ada
21. **[Guru] Export Nilai** — API export ada tapi belum ada halaman/tombol di rekap

---

## Temuan Tambahan (Non-Fitur)

### Masalah UX/Navigasi
- Menu **Komunikasi** dan **Laporan** pada portal guru terlihat di sidebar tapi semua submenu akan 404 — perlu dinonaktifkan atau disembunyikan sementara agar tidak membingungkan pengguna.
- Menu **Pengaturan** di portal guru juga akan 404.

### Inkonsistensi Desain
- Halaman Backup & Restore menggunakan elemen HTML biasa (`<button>`, `<input>`) bukan komponen Shadcn/UI seperti modul lainnya.
- Beberapa halaman placeholder tidak menggunakan layout/header standar.

### Potensi Bug
- Fitur "Setup Bobot" di Rubrik Penilaian menggunakan `PATCH` method ke `/api/teacher/nilai/rubrik/[id]`, perlu verifikasi apakah endpoint tersebut mendukung PATCH atau hanya PUT.
- Halaman rubrik mengambil data dengan `subjectId` & `rombelId` dari query params — jika guru mengakses URL langsung tanpa params, akan redirect ke input nilai (perilaku ini sudah ditangani).

---

## Rekomendasi Urutan Perbaikan

```
Sprint 1 (Quick Fix):
├── Sembunyikan/disable menu yang belum ada halaman (Komunikasi, Laporan, Pengaturan Guru)
├── Buat halaman Pengaturan Guru minimal (profil & tema)
└── Pastikan PATCH endpoint rubrik tersedia

Sprint 2 (Fitur Kritis Admin):
├── Implementasi Nilai & Rapor (minimal: view nilai, generate rapor PDF)
└── Implementasi Pengaturan Akademik (KKM per mapel, bobot nilai, skala huruf)

Sprint 3 (CBT Minimal):
├── Halaman Buat Paket Ujian
├── Halaman Jadwal & Pelaksanaan (minimal: assign ujian ke kelas)
└── Halaman Hasil & Analisis (minimal: view skor siswa)

Sprint 4 (Komunikasi & Laporan):
├── Laporan Mengajar (rekapitulasi jurnal)
├── Laporan Nilai & Prestasi (ringkasan rekap nilai)
└── Komunikasi dasar (minimal: pengumuman ke siswa)

Sprint 5 (Polish):
├── Upload lampiran tugas siswa
├── Bulk import nilai Excel
└── Konsistensi UI Backup & Restore
```

---

*Laporan ini berdasarkan analisis statis kode sumber. Beberapa fitur yang tercatat "berfungsi" mungkin masih mengandung bug pada level data/API yang memerlukan pengujian langsung dengan database.*
