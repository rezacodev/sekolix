# Modul Akademik — Spesifikasi & TODO

Dokumen konsolidasi untuk modul akademik, laporan akademik, e-learning, CBT, dan status implementasinya.

---

## 1. Prinsip Desain

- Berlaku umum untuk **SD, SMP, SMA, SMK**
- Jurusan/kompetensi **opsional** (aktif jika SMK)
- E-Learning & CBT menggunakan data akademik yang sama (kelas, mapel, guru, siswa)
- Struktur menu **maksimal 2 level** agar sidebar ringkas

---

## 2. Struktur Modul & Sub Menu

### 📚 Akademik
1. Tahun Ajaran & Semester (+ kalender akademik)
2. Data Guru
3. Data Siswa Aktif (profil, riwayat kelas & nilai, mutasi/lulus/keluar)
4. Kurikulum & Mata Pelajaran
5. Kelas & Rombel (tingkat, jurusan opsional, wali kelas)
6. Guru Pengampu (relasi guru ↔ mapel ↔ kelas)
7. Jadwal Pelajaran (mingguan + validasi konflik)
8. Penilaian & Nilai (tugas, UTS, UAS, praktik)
9. Rapor (generate per semester)
10. Pengaturan Akademik (bobot nilai, KKM, skala nilai, template rapor)

### 💻 E-Learning
1. Kelas Online — 2. Materi Pembelajaran (video, PDF, link) — 3. Tugas & Pengumpulan — 4. Forum Diskusi — 5. Progress Belajar

### 📝 Ujian (CBT/CAT)
1. Bank Soal (PG, esai, tingkat kesulitan) — 2. Paket Ujian (UTS/UAS/Tryout) — 3. Jadwal Ujian (waktu, durasi, token) — 4. Pelaksanaan CBT/CAT — 5. Hasil & Analisis

---

## 3. Database Schema (High Level)

### Master Akademik
| Tabel | Field Utama |
|-------|-------------|
| `academic_years` | (existing) |
| `academic_calendars` | id, academic_year_id, title, start_date, end_date, type (libur/ujian/kegiatan) |
| `curriculums` | id, name, level (SD/SMP/SMA/SMK) |
| `subjects` | id, curriculum_id, name, is_practice |
| `classes` | id, academic_year_id, name, level, major (nullable), homeroom_teacher_id |

### Guru & Siswa
| Tabel | Field Utama |
|-------|-------------|
| `teachers` | id, user_id, name, nip |
| `students` | id, user_id, nis, name, class_id, status (aktif/lulus) |
| `student_parents` | id, student_id, father_name, mother_name, phone |

### Relasi Akademik
| Tabel | Field Utama |
|-------|-------------|
| `teacher_subjects` | id, teacher_id, subject_id, class_id |
| `class_schedules` | id, class_id, subject_id, teacher_id, day, start_time, end_time |
| `assessments` | id, subject_id, type (tugas/uts/uas), weight |
| `grades` | id, student_id, assessment_id, score |
| `report_cards` | id, student_id, academic_year_id, semester, average_score |

### E-Learning
| Tabel | Field Utama |
|-------|-------------|
| `online_classes` | id, class_id, subject_id |
| `learning_materials` | id, online_class_id, title, type (video/pdf), content |
| `assignments` | id, online_class_id, title, due_date |

### CBT/CAT
| Tabel | Field Utama |
|-------|-------------|
| `question_banks` | id, subject_id, question, type, correct_answer |
| `exams` | id, subject_id, title, duration |
| `exam_results` | id, exam_id, student_id, score |

---

## 4. Laporan Akademik

### Stakeholder & Kebutuhan
| Stakeholder | Kebutuhan |
|-------------|-----------|
| Kepala Sekolah | Ringkasan eksekutif, statistik, perbandingan antar tahun |
| Wakil Kurikulum | Laporan kurikulum, mapel, jadwal, distribusi guru |
| Wali Kelas | Laporan kelas, kehadiran, nilai siswa |
| Guru Mapel | Nilai per mapel, analisis kesulitan |
| TU/Admin | Data master, statistik umum |
| Orang Tua | Laporan individual siswa (portal) |

### Daftar Laporan

> **Status:** Semua 18 laporan (A1–E3) sudah diimplementasikan. Detail per laporan & URL endpoint di [Section 6](#6-daftar-laporan-yang-diimplementasikan).

#### 🔴 Prioritas Tinggi (MVP)
| Kode | Laporan | Sumber Data | Output | Status |
|------|---------|-------------|--------|--------|
| A1 | Data Siswa Aktif | PesertaDidik, Rombel, Class | Tabel + statistik distribusi, Export Excel/PDF | ✅ `/laporan/data-siswa` |
| A2 | Data Guru (GTK) | Staff | Tabel + rasio guru:siswa, Export Excel/PDF | ✅ `/laporan/data-guru` |
| B1 | Jadwal Pelajaran | ClassSchedule, TeacherSubject | Grid mingguan, deteksi konflik, Export | ✅ `/laporan/jadwal` |
| C1 | Nilai Per Siswa | Grade, Assessment, PesertaDidik | Transkrip + rata-rata tertimbang, Export PDF | ✅ `/laporan/nilai-siswa` |
| C4 | Rapor | ReportCard, Grade | Rapor resmi, Export PDF (existing) | ✅ `/laporan/rapor` (hub) |
| E1 | Dashboard Eksekutif | Multiple (aggregated) | KPI cards, chart distribusi & tren (real-time) | ✅ `/laporan/dashboard-eksekutif` |

#### 🟡 Prioritas Sedang
| Kode | Laporan | Status |
|------|---------|--------|
| A4 | Kelas & Rombongan Belajar | ✅ `/laporan/kelas-rombel` |
| B2 | Beban Mengajar Guru | ✅ `/laporan/beban-mengajar` |
| C2 | Nilai Per Kelas/Rombel | ✅ `/laporan/nilai-kelas` |
| C5 | Ketuntasan Belajar (KKM) | ✅ `/laporan/ketuntasan-kkm` |
| C6 | Ranking Siswa | ✅ `/laporan/ranking` |

#### 🟢 Prioritas Rendah
| Kode | Laporan | Status |
|------|---------|--------|
| A3 | Kurikulum & Mata Pelajaran | ✅ `/laporan/kurikulum-mapel` |
| A5 | Ruang & Jam Pelajaran | ✅ `/laporan/ruang-jam` |
| B3 | Distribusi Siswa per Kelas | ✅ `/laporan/distribusi-siswa` |
| C3 | Nilai Per Mata Pelajaran | ✅ `/laporan/nilai-mapel` |
| D1 | Tren Siswa per Tahun Ajaran | ✅ (subset `/laporan/analitik`) |
| D2 | Tren Nilai per Tahun Ajaran | ✅ (subset `/laporan/analitik`) |
| D3 | Perbandingan Antar Tahun | ✅ (subset `/laporan/analitik`) |
| D4 | Efektivitas Mengajar | ⏳ Placeholder (butuh data khusus) |
| D5 | Statistik Lanjutan | ⏳ Placeholder |
| E2 | Laporan Tahunan Akademik | ✅ `/laporan/tahunan` |
| E3 | Laporan Akreditasi | ✅ `/laporan/akreditasi` |

---

## 5. TODO Checklist

### DB & Seed
- [x] Model Prisma: AcademicYear, AcademicCalendar, Curriculum, Subject, Class, Teacher, Student, TeacherSubject, ClassSchedule, Assessment, Grade, ReportCard (total 71 model di `prisma/schema.prisma`)
- [x] Migration awal (`prisma/migrations/` — 32 migrations)
- [x] Seed: academic year aktif, 2 semester, contoh kelas, mapel inti, admin user (`prisma/seeds/akademik/`)

### Auth & Roles
- [x] Perluas model `User` dengan `role` (admin/teacher/student)
- [x] Role guard middleware untuk admin/teacher routes (`proxy.ts`)

### API (CRUD)
- [x] CRUD Academic Years (`app/api/admin/manajemen-akademik/tahun-ajaran/`)
- [x] CRUD Subjects & Curriculum (`kurikulum-mapel/`)
- [x] CRUD Classes + assign homeroom (`rombel/`)
- [x] CRUD Teachers & Students + CSV import (`gtk/`, `peserta-didik/`)
- [x] Schedules API + conflict validation (`class-schedules/`)
- [x] Assessments & Grades API — batch grades (`nilai-rapor/`)

### Admin UI
- [x] Scaffold `app/admin/manajemen-akademik/` layout + sidebar
- [x] Tahun Ajaran: CRUD + set aktif
- [x] Kurikulum & Mapel: CRUD
- [x] Kelas & Rombel: CRUD + assign wali kelas
- [x] Jadwal: weekly scheduler + conflict check

### Teacher / Student UI
- [x] Teacher: class roster, input nilai, download daftar siswa
- [x] Student: akses materi, submit tugas, lihat rapor sederhana

### E-Learning & CBT (MVP)
- [x] Materials: upload & CRUD
- [x] Assignments: create, submit, grade
- [x] Bank soal & paket ujian sederhana (token + timer)

### Laporan (Sesuai Prioritas)
- [x] Setup folder laporan di bawah `manajemen-akademik/nilai-rapor/` + layout + sidebar
- [x] Install deps: jsPDF, exceljs, recharts, date-fns
- [x] Base components: `ReportGenerator` + `DownloadButton` di `src/components/shared/`
- [x] Utility di `src/lib/reports/` (`excel.ts`, `pdf.ts`, `helpers.ts`, `index.ts`)
- [x] **MVP Reports (A1, A2, B1, C1, C4, E1)** — lihat tabel Prioritas Tinggi di atas dan [Section 6: Daftar Laporan](#6-daftar-laporan-yang-diimplementasikan) untuk detail
- [ ] Unit tests API, integration tests export, performance test (large dataset)

### Rapor & Docs
- [x] Rapor export PDF per siswa (`pdf-lib` di `app/api/admin/manajemen-akademik/rapor/generate/`)
- [ ] Tests: unit + integration untuk API kunci
- [x] Docs: README + `docs/` folder (seed, role setup, admin guide tersedia per modul)

---

## 6. Daftar Laporan yang Diimplementasikan

Pusat laporan: **`/admin/manajemen-akademik/laporan`** (semua laporan dikelompokkan per prioritas, dengan badge merah/kuning/hijau).

### Infrastruktur

| Komponen | Lokasi |
|----------|--------|
| Helper Excel (`exceljs`) | `src/lib/reports/excel.ts` |
| Helper PDF (`pdf-lib`) | `src/lib/reports/pdf.ts` |
| Shared helpers (auth, response, formatters) | `src/lib/reports/helpers.ts` |
| Filter laporan reusable | `app/admin/manajemen-akademik/laporan/_components/LaporanFilters.tsx` |
| Tombol export Excel + PDF | `app/admin/manajemen-akademik/laporan/_components/ExportButtons.tsx` |

### 🔴 Prioritas Tinggi (MVP) — 6/6 selesai

| Kode | Laporan | URL | Filter | Export | Catatan |
|------|---------|-----|--------|--------|---------|
| **A1** | Data Siswa Aktif | `/laporan/data-siswa` | TA, rombel, gender, status | Excel + PDF | Daftar siswa aktif + statistik L/P |
| **A2** | Data Guru (GTK) | `/laporan/data-guru` | role, status kepegawaian, gender | Excel + PDF | + rasio GTK:Siswa |
| **B1** | Jadwal Pelajaran | `/laporan/jadwal` | TA, rombel, hari | Excel + PDF | **Conflict detection** otomatis |
| **C1** | Nilai Per Siswa | `/laporan/nilai-siswa` | TA, rombel (atau `studentId` untuk transkrip) | Excel + PDF | Rata-rata tertimbang per mapel |
| **C4** | Rapor | `/laporan/rapor` (hub) | — | PDF (existing API) | Link ke `/nilai-rapor` |
| **E1** | Dashboard Eksekutif | `/laporan/dashboard-eksekutif` | — | (visual) | KPI cards + 3 charts (recharts) |

### 🟡 Prioritas Sedang — 5/5 selesai

| Kode | Laporan | URL | Filter | Export | Catatan |
|------|---------|-----|--------|--------|---------|
| **A4** | Kelas & Rombongan Belajar | `/laporan/kelas-rombel` | TA | Excel | + kapasitas, jumlah siswa |
| **B2** | Beban Mengajar Guru | `/laporan/beban-mengajar` | TA | Excel | Total slot/minggu + distribusi mapel |
| **C2** | Nilai Per Kelas/Rombel | `/laporan/nilai-kelas` | TA | Excel + PDF | Aggregat per rombel |
| **C5** | Ketuntasan Belajar (KKM) | `/laporan/ketuntasan-kkm` | TA | Excel | Persentase ≥ KKM per mapel |
| **C6** | Ranking Siswa | `/laporan/ranking` | TA, rombel, topN | Excel + PDF | Diurutkan dari tertinggi |

### 🟢 Prioritas Rendah — 7/7 selesai

| Kode | Laporan | URL | Filter | Export | Catatan |
|------|---------|-----|--------|--------|---------|
| **A3** | Kurikulum & Mata Pelajaran | `/laporan/kurikulum-mapel` | — | Excel | Per kurikulum |
| **A5** | Ruang & Jam Pelajaran | `/laporan/ruang-jam` | — | Excel | 2 sheet: ruang + jam |
| **B3** | Distribusi Siswa per Kelas | `/laporan/distribusi-siswa` | TA | Excel | + rasio L:P |
| **C3** | Nilai Per Mata Pelajaran | `/laporan/nilai-mapel` | — | Excel + PDF | Aggregat lintas rombel |
| **D** | Laporan Analitik | `/laporan/analitik` | — | (visual) | Tren siswa + nilai lintas TA |
| **E2** | Laporan Tahunan Akademik | `/laporan/tahunan` | — | (visual) | Ringkasan 10 KPI |
| **E3** | Laporan Akreditasi | `/laporan/akreditasi` | — | (visual) | Indikator akreditasi |

### API Endpoints

Semua endpoint menerima `format=excel` (default) atau `format=pdf`, dengan filter via query string:

```
GET /api/admin/manajemen-akademik/laporan/data-siswa?tahunAjaranId=...&rombelId=...&gender=...&format=excel
GET /api/admin/manajemen-akademik/laporan/data-guru?role=...&statusKepegawaian=...&format=pdf
GET /api/admin/manajemen-akademik/laporan/jadwal?rombelId=...&day=MONDAY&format=excel
GET /api/admin/manajemen-akademik/laporan/nilai-siswa?rombelId=...&format=pdf
GET /api/admin/manajemen-akademik/laporan/nilai-siswa?studentId=...&format=pdf     # transkrip individual
GET /api/admin/manajemen-akademik/laporan/kelas-rombel?tahunAjaranId=...&format=excel
GET /api/admin/manajemen-akademik/laporan/beban-mengajar?tahunAjaranId=...&format=excel
GET /api/admin/manajemen-akademik/laporan/nilai-kelas?tahunAjaranId=...&format=pdf
GET /api/admin/manajemen-akademik/laporan/ketuntasan-kkm?tahunAjaranId=...&format=excel
GET /api/admin/manajemen-akademik/laporan/ranking?rombelId=...&topN=50&format=pdf
GET /api/admin/manajemen-akademik/laporan/kurikulum-mapel?format=excel
GET /api/admin/manajemen-akademik/laporan/ruang-jam?format=excel
GET /api/admin/manajemen-akademik/laporan/distribusi-siswa?tahunAjaranId=...&format=excel
GET /api/admin/manajemen-akademik/laporan/nilai-mapel?format=pdf
```

### Akses

- **Role yang diizinkan**: ADMIN, EDITOR, SUPERADMIN (lihat `requireReportAccess()` di `src/lib/reports/helpers.ts`)
- **Route**: `/admin/manajemen-akademik/laporan/*` dilindungi `proxy.ts` middleware
- **KKM default**: 75 (bisa dikonfigurasi per mata pelajaran via field `Subject.kkm`)
