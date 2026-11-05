# Portal Guru — Spesifikasi & TODO

Dokumen konsolidasi untuk portal guru, struktur akses, menu utama, dan status implementasinya.

---

## 1. Arsitektur: Multi-Portal System

**Solusi:** Portal terpisah dengan shared database dan login terpadu.

```
/login          → Login SEMUA user (admin, guru, dual role)
/select-role    → Pilih mode (untuk user dual role Admin + Teacher)
/admin/*        → Panel Admin (existing)
/teacher/*      → Portal Guru (NEW)
/api/admin/     → API khusus admin
/api/teacher/   → API khusus guru
/api/shared/    → API shared (classes, students, subjects, schedules)
```

**Dual Role Flow:** Login → deteksi isDualRole → pilih mode di `/select-role` → switch kapan saja via header.

**Keuntungan:** Separation of concerns, security per-route (middleware), independent development, UX kontekstual, scalable untuk portal siswa/ortu ke depan.

---

## 2. Prinsip Akses

- Guru hanya melihat **kelas dan mapel yang diampu**
- Data siswa terbatas pada **siswa di kelas yang diajar**
- Wali kelas punya **akses tambahan** untuk kelas yang dibimbing
- Struktur menu **maksimal 2 level**
- Terintegrasi dengan modul Akademik, E-Learning, dan CBT

---

## 3. Struktur Menu Portal Guru

### 🏠 Dashboard Guru
Ringkasan hari ini (jadwal, tugas pending, ujian, absensi belum diisi), statistik cepat, notifikasi, kalender akademik, quick actions.

### 📚 Kelas Saya
1. **Daftar Kelas & Mapel** — cards dengan info kelas, jadwal, progress silabus, quick links
2. **Data Siswa** — profil, riwayat nilai, kontak ortu (filtered by kelas yang diajar)
3. **Absensi Kelas** — input manual hadir/sakit/izin/alpha, rekap, export, notifikasi ortu
4. **Catatan & Jurnal Kelas** — jurnal harian, catatan progres, rencana berikutnya

### 📖 Pembelajaran
1. **Silabus & RPP** — builder RPP (KD, indikator, tujuan, metode, langkah, penilaian), versioning, approval
2. **Materi Pembelajaran** — upload PPT/PDF/video/link, folder per bab/topik, scheduled release, access stats
3. **Bank Materi & Aset** — repository reusable, tag system, sharing antar guru
4. **Rencana Pembelajaran** — kalender semester, pemetaan materi per pertemuan, track actual vs planned

### ✍️ Tugas & Penilaian
1. **Buat & Kelola Tugas** — tipe: upload file, essay, MCQ auto-grade, link, offline; rubrik penilaian; status tracking
2. **Koreksi & Penilaian** — inline commenting, rubric-based scoring, bulk grading, grade distribution
3. **Input Nilai Akademik** — harian/tugas/UTS/UAS/praktik, weighted average, KKM check, remedial management

### 📝 Ujian (CBT)
1. Bank Soal — 2. Paket Ujian — 3. Jadwal Ujian (token + timer) — 4. Pelaksanaan CBT — 5. Hasil & Analisis

### 💬 Komunikasi
1. Forum Diskusi per kelas — 2. Pesan Internal — 3. Komunikasi Orang Tua

### 📊 Laporan Guru
1. Laporan Nilai & Progress Kelas — 2. Laporan Absensi — 3. Laporan Kinerja Mengajar

### ⚙️ Pengaturan
Profil, notifikasi, preferensi tampilan, theme portal.

---

## 4. Role & Auth (NextAuth)

```typescript
// JWT/Session tambahan
token.isDualRole = user.role === 'ADMIN' && staff?.role === 'TEACHER'
session.staffId       // id di tabel Staff
session.staffRole     // TEACHER | ADMIN_STAFF | PRINCIPAL | ...
session.isDualRole    // boolean
```

**Middleware protection:**
```typescript
if (pathname.startsWith('/admin') && token.role !== 'ADMIN') → redirect /login
if (pathname.startsWith('/teacher') && token.staffRole !== 'TEACHER') → redirect /login
```

---

## 5. TODO Checklist

### Phase 1: Foundation & Setup — Progress: 21/40 ✅

#### Project Structure (✅ Selesai)
- [x] Folder `app/teacher/` (kelas, pembelajaran, tugas, nilai, ujian, komunikasi, laporan, pengaturan)
- [x] Folder `app/select-role/`, `src/components/teacher/`, `src/components/shared/`, `app/api/teacher/`, `app/api/shared/`

#### Layout & Components (✅ Selesai)
- [x] `TeacherLayoutClient.tsx` (based on admin, emerald theme, menu guru)
- [x] `app/teacher/layout.tsx`
- [x] Theme system (5 tema sama seperti admin portal)
- [x] Breadcrumb system (BreadcrumbContext, BreadcrumbDisplay)
- [x] Footer sidebar (logo + copyright)

#### Auth & Dual Role (✅ Selesai)
- [x] Unified login di `/login` (auto-redirect by role)
- [x] NextAuth config dengan `isDualRole`, `staffId`, `staffRole` di JWT & Session
- [x] TypeScript types di `types/next-auth.d.ts`
- [x] Middleware: protect `/admin/*` dan `/teacher/*`, redirect ke `/unauthorized`
- [x] `/select-role` page — cards Mode Admin & Mode Guru, cookie preference
- [x] `RoleSwitcher` component — dropdown switch mode, visible hanya untuk dual role
- [x] RoleSwitcher terintegrasi di AdminLayoutClient & TeacherLayoutClient

#### Dashboard & API (✅ Selesai)
- [x] `app/teacher/page.tsx` — stats, jadwal hari ini, pending tasks, pengumuman, quick actions
- [x] API `/api/teacher/dashboard-summary`, `/api/teacher/announcements`
- [x] API `/api/teacher/my-classes` — filtered by teacherId, active tahun ajaran
- [x] API `/api/teacher/my-students` — filtered by kelas guru, support search + pagination
- [x] API `/api/teacher/assignments` — GET (filter upcoming/overdue) + POST
- [x] API `/api/teacher/grades` — GET + POST individual + PUT batch
- [x] Shared APIs: `/api/shared/classes`, `/students`, `/subjects`, `/schedules` (role-based filtering)

#### Kelas Management (✅ Selesai)
- [x] `app/teacher/kelas/page.tsx` — ClassCard, filter hari, sort, search, active tahun ajaran filter
- [x] `app/teacher/kelas/[rombelId]/siswa/page.tsx` — data siswa per kelas
- [x] Seed: `prisma/seeds/guru/teacher-portal.seed.ts` (guru@sekolix.com, 9 rombels, 2 mapel, ~180 siswa)

### Phase 2: Core Features — Selesai ✅

- [x] Absensi kelas: input manual, rekap, export
- [x] Jurnal mengajar harian
- [x] Upload & CRUD materi pembelajaran
- [x] Buat & kelola tugas (tipe file upload + MCQ)
- [x] Koreksi & grading (inline comment, rubric)
- [x] Input nilai akademik (harian/UTS/UAS, weighted average, KKM check)

### Phase 3: Advanced Features — Selesai ✅

- [x] Silabus & RPP builder
- [x] Bank soal & paket ujian CBT
- [x] Forum diskusi per kelas
- [x] Laporan nilai & absensi guru
- [x] Komunikasi dengan orang tua
