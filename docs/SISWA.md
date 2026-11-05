# Portal Siswa — Spesifikasi

Dokumen ini mendefinisikan seluruh fitur untuk **portal siswa** (`/student/*`) dalam aplikasi Sekolix (Next.js). Konsep ujian (CBT/CAT) diadaptasi dari proyek **sekolix-cabt** (Laravel).

---

## 1. Arsitektur & Akses

```
/login          → Login terpadu (redirect otomatis by role)
/student/*      → Portal Siswa
/api/student/   → API khusus siswa (role-gated)
/api/shared/    → API shared (classes, subjects, schedules)
```

**Auth:** NextAuth session — `role === 'STUDENT'` atau `staffRole` tidak relevan.  
**Middleware:** `pathname.startsWith('/student')` → wajib session valid + role STUDENT; redirect `/unauthorized` jika tidak.

**Prinsip akses:**
- Siswa hanya melihat data rombel/kelas yang **diikutinya**
- Materi & tugas hanya dari **mapel yang dipelajari** di rombel aktif
- Nilai & rapor hanya milik **diri sendiri**
- Ujian CBT hanya yang **ditugaskan** ke siswa tersebut

---

## 2. Struktur Menu

```
/student
├── dashboard              → Ringkasan harian
├── kelas                  → Kelas & rombel aktif
│   └── [rombelId]/
│       ├── materi/        → Materi pembelajaran
│       ├── tugas/         → Tugas & pengumpulan
│       └── forum/         → Forum diskusi
├── ujian                  → Daftar ujian CBT/CAT
│   └── [sessionId]/
│       ├── konfirmasi/    → Petunjuk & konfirmasi
│       ├── kerjakan/      → Halaman ujian
│       ├── hasil/         → Hasil setelah submit
│       └── review/        → Review jawaban + pembahasan
├── nilai                  → Rekap nilai semua mapel
├── rapor                  → Rapor per semester
├── jadwal                 → Jadwal pelajaran mingguan
├── kalender               → Kalender akademik
├── pengumuman             → Pengumuman sekolah
└── profil                 → Biodata & pengaturan akun
```

---

## 3. Dashboard Siswa

**Komponen:**

| Widget | Isi |
|--------|-----|
| Jadwal Hari Ini | Daftar pelajaran hari ini (jam, mapel, ruang/guru) |
| Tugas Deadline | Tugas yang mendekati deadline (≤3 hari); badge overdue |
| Ujian Mendatang | Sesi CBT dalam 7 hari ke depan |
| Nilai Terbaru | 5 nilai/tugas terakhir yang dinilai |
| Pengumuman | Banner pengumuman aktif dari sekolah/guru |
| Quick Links | Materi terbaru, forum aktif, lihat rapor |

---

## 4. Kelas & Materi

### 4.1 Daftar Kelas Aktif

Tampil card per rombel yang diikuti siswa di tahun ajaran aktif:
- Nama rombel, tingkat, program/jurusan
- Daftar mapel + guru pengampu
- Progress materi (% materi yang sudah diakses)
- Quick links: Materi, Tugas, Forum

### 4.2 Materi Pembelajaran

List materi per mapel/rombel yang dipublikasikan guru:

| Fitur | Detail |
|-------|--------|
| Tipe konten | PDF, PPT, video (URL/upload), link eksternal, e-book |
| Organisasi | Folder per bab/topik; urutan ditentukan guru |
| Akses | Hanya materi yang `status = published` dan tanggal release sudah lewat |
| Tracking | Sisi server: catat `material_access` saat pertama kali dibuka |
| Preview | PDF inline viewer; video embed; download untuk dokumen |
| Pencarian | Search materi dalam satu rombel/mapel |

### 4.3 Tugas & Pengumpulan

**Melihat Tugas:**
- List tugas dari guru (nama, deskripsi, tipe, deadline, poin)
- Status badge: Belum Dikumpulkan / Dikumpulkan / Terlambat / Sudah Dinilai
- Filter: semua / pending / dinilai

**Pengumpulan:**

| Tipe Tugas | UI Pengumpulan |
|------------|----------------|
| Upload file | Drag & drop, max 20MB, JPEG/PNG/PDF/DOCX/ZIP |
| Essay/teks | Textarea atau rich text editor (Tiptap lite) |
| Link | Input URL (Google Docs, Drive, dll) |
| Offline | Upload foto bukti pengerjaan |

- Siswa bisa **edit ulang** pengumpulan selama belum dinilai dan sebelum deadline
- Tampilkan nilai & komentar guru setelah dinilai

### 4.4 Forum Diskusi

- Thread per mapel/rombel, buat oleh guru atau siswa
- Reply bertingkat (1 level)
- Notifikasi (badge) jika ada reply baru sejak kunjungan terakhir
- Siswa tidak bisa edit/hapus post orang lain

---

## 5. Ujian CBT/CAT

> Konsep ini diadaptasi dari **sekolix-cabt**. Implementasi disesuaikan ke Next.js (App Router + Server Actions / API Routes + React).

### 5.1 Tipe Soal yang Didukung

| Kode | Nama | Koreksi |
|------|------|---------|
| `PG` | Pilihan Ganda (1 jawaban benar) | Otomatis |
| `PG_BOBOT` | PG Berbobot (tiap opsi punya %) | Otomatis |
| `PGJ` | PG Jawaban Majemuk (>1 benar) | Otomatis (proporsional) |
| `BS` | Benar / Salah | Otomatis |
| `JODOH` | Menjodohkan / Mengurutkan | Otomatis (proporsional per pasangan) |
| `ISIAN` | Isian Singkat (keyword matching) | Otomatis (case-insensitive) |
| `CLOZE` | Isian dalam Teks (banyak blank) | Otomatis (proporsional per blank) |
| `URAIAN` | Uraian / Essay + upload file | Manual (guru menilai) |

Semua tipe soal mendukung: **MathJax** (render LaTeX), **gambar dalam soal**, **pembahasan** (tampil saat review).

### 5.2 Alur Ujian

```
Dashboard → Daftar Ujian
  → [Input Token jika diperlukan]
  → Halaman Konfirmasi & Petunjuk
  → Mulai Ujian
  → Halaman Pengerjaan + Timer
  → Auto/Manual Submit
  → Halaman Hasil
  → Halaman Review (jika diizinkan)
```

### 5.3 Daftar Ujian (`/student/ujian`)

- Daftar sesi ujian yang ditugaskan ke siswa
- Status badge: **Belum Mulai** / **Sedang Berlangsung** / **Selesai** / **Tidak Hadir**
- Info: nama ujian, nama paket, waktu mulai/selesai, durasi
- Ujian mendatang dalam 7 hari ditampilkan di Dashboard

### 5.4 Konfirmasi & Petunjuk

Sebelum ujian dimulai, siswa melihat:
- Nama ujian, jumlah soal, durasi, waktu minimal sebelum boleh submit
- Petunjuk umum + tanda peringatan poin negatif (jika aktif)
- Input token akses (jika paket menggunakan token)
- Tombol "Mulai Ujian" (validasi server: sesi aktif, peserta terdaftar, batas pengulangan belum tercapai)

### 5.5 Halaman Pengerjaan

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ Header: Nama Ujian │ Timer │ Progress X/Y │ Submit│
├────────────┬─────────────────────────────────────┤
│  Palet     │  Area Soal                          │
│  Nomor     │  [Teks soal + media]                │
│  Soal      │  [Opsi jawaban / input]             │
│  (sidebar) │  [Tombol Sebelumnya / Berikutnya]   │
│            │  [Tandai Ragu-ragu]                 │
└────────────┴─────────────────────────────────────┘
```

**Palet soal (sidebar):**
- Abu-abu: belum dijawab
- Hijau: sudah dijawab
- Kuning: ditandai ragu-ragu
- Klik nomor → navigasi langsung ke soal

**Render UI per tipe soal:**

| Tipe | Komponen |
|------|----------|
| `PG` / `PG_BOBOT` / `BS` | Radio button |
| `PGJ` | Checkbox (multi) |
| `JODOH` | Dropdown select per premis |
| `ISIAN` | Input text |
| `CLOZE` | Inline input fields dalam teks |
| `URAIAN` | Textarea + tombol upload file (JPEG/PNG/PDF ≤5MB) |

**Soal Kelompok/Stimulus:** Layout split-panel — 40% stimulus (teks/gambar/audio/video) di kiri, 60% soal di kanan. Mobile: tab toggle "Materi / Soal".

**Soal Audio:** Player dengan batas jumlah play yang dikontrol server; disabled setelah batas tercapai.

**MathJax:** Semua teks soal di-render dengan MathJax 3 (CDN) untuk notasi matematika LaTeX.

### 5.6 Timer & Sinkronisasi Waktu

- **Server-authoritative:** `sisa_waktu = (waktu_mulai + durasi × 60) − server_now()`
- Sinkronisasi ke server setiap **60 detik**
- Warning modal saat sisa ≤ 300 detik dan ≤ 60 detik
- Tombol Submit dinonaktifkan selama `waktu_minimal_menit` belum tercapai
- **Timer per soal** (opsional): countdown per soal; mode `maju` otomatis pindah soal dan mengunci soal yang dilewati
- **Multi-section:** badge "Bagian X: [nama]" + timer seksi di header; soal seksi selesai dikunci

### 5.7 Auto-save Jawaban

- Setiap perubahan jawaban dikirim via **API call** (debounce 300ms, retry otomatis 3× dengan delay 1s/2s/3s)
- Toast notifikasi: "Tersimpan ✓" (hijau) / "Gagal menyimpan, mencoba ulang..." (merah)
- **Resume otomatis:** jika siswa reload atau buka di tab/browser lain → sistem redirect ke attempt aktif dengan sisa waktu dari server
- Jawaban tersimpan di `attempt_questions` per soal

**Endpoint:**
```
POST /api/student/ujian/jawab
Body: { attemptId, questionId, jawaban, isRagu }
Response: { success, soalTerjawab, total, sisaWaktuDetik }
```

### 5.8 Submit Ujian

- **Auto-submit:** timer habis, waktu sesi server berakhir, atau batas tab switch terlampaui
- **Manual submit:** tombol "Selesai & Kirim" → dialog konfirmasi (tampilkan soal belum dijawab) → POST submit
- Idempotent: jika `status = selesai`, redirect langsung ke halaman hasil

### 5.9 Anti-Kecurangan

**Server-side (prioritas tinggi):**

| Mekanisme | Implementasi |
|-----------|--------------|
| IDOR prevention | Semua endpoint validasi `attemptId` milik `session.user.id` |
| Timer dari server | Client tidak bisa manipulasi waktu |
| Batas play audio | `audio_play_count` di-increment server-side; request ditolak setelah melebihi batas |
| Tab switch counter | Event `tab_switch` di-log ke `attempt_logs` via Beacon API |
| Aksi tab switch | Konfigurasi per paket: `log` / `lock` (peserta terkunci) / `submit` (auto-submit) |
| File URAIAN private | Upload ke storage private; akses via signed URL auth-protected |
| Rate limiting | `/api/student/ujian/jawab` — throttle 120 req/menit |

**Client-side (dikontrol lewat pengaturan paket):**

| Mekanisme | Aktif Jika |
|-----------|-----------|
| Disable copy-paste | `preventCopyPaste = true` |
| Disable klik kanan | `preventRightClick = true` |
| Fullscreen enforcement | `requireFullscreen = true` — keluar fullscreen dihitung tab switch |
| Watermark peserta | Nama + NIS overlay transparan di area soal |
| Anti-print CSS | `@media print { visibility: hidden }` selalu aktif di halaman ujian |
| Beacon API log | Tab switch via `navigator.sendBeacon()` agar terkirim meski tab berpindah |

### 5.10 Hasil & Review

**Halaman Hasil (`/student/ujian/[sessionId]/hasil`):**
- Nilai akhir (skala 0–100), jumlah benar / salah / kosong, durasi pengerjaan
- Keterangan ketuntasan (Tuntas / Belum Tuntas berdasarkan KKM sesi)
- Ranking di antara peserta satu sesi (opsional, dikontrol pengaturan paket)
- Jika `gradingMode = manual`: tampilkan "Menunggu koreksi URAIAN"

**Halaman Review (`/student/ujian/[sessionId]/review`):**
- Semua soal + jawaban peserta + kunci jawaban + pembahasan
- Dibatasi: hanya muncul setelah sesi ditutup (konfigurabel per paket)
- Soal URAIAN tampilkan skor manual dari guru

### 5.11 Portofolio Ujian

Di halaman `/student/ujian` (tab "Riwayat"):
- Tabel semua ujian yang pernah diikuti: nama ujian, tanggal, nilai (color-coded), benar/salah/kosong, durasi
- Grafik garis nilai vs waktu per mapel (Chart.js / Recharts)
- Statistik ringkasan: rata-rata, tertinggi, terendah, total ujian

---

## 6. Nilai & Rapor

### 6.1 Rekap Nilai (`/student/nilai`)

- Tabel nilai per mapel per semester aktif
- Kolom: Mapel, Nilai Tugas, UTS, UAS, Praktik, Rata-rata, Predikat
- Filter: tahun ajaran, semester
- Highlight nilai di bawah KKM (merah)
- Grafik: radar chart perbandingan nilai antar mapel

### 6.2 Rapor (`/student/rapor`)

- Pilih semester (dropdown tahun ajaran + semester)
- Tampil rapor lengkap:
  - Nilai per mapel (beserta komponen)
  - Predikat & narasi (jika ada)
  - Catatan wali kelas
  - Kehadiran (hadir/sakit/izin/alpha)
  - Ranking kelas (jika diaktifkan sekolah)
- Tombol **Download PDF** (format resmi rapor sekolah)

---

## 7. Jadwal & Kalender

### 7.1 Jadwal Pelajaran (`/student/jadwal`)

- Grid mingguan jadwal pelajaran rombel aktif siswa
- Info per slot: mapel, guru, jam, ruang
- Filter: hari tertentu
- Mobile-friendly (tampil per hari, swipe)

### 7.2 Kalender Akademik (`/student/kalender`)

- Kalender bulanan (FullCalendar atau custom)
- Event: hari libur, ujian, kegiatan sekolah, deadline tugas, jadwal ujian CBT
- Warna event: merah=ujian, kuning=tugas deadline, biru=kegiatan, abu=libur

---

## 8. Pengumuman (`/student/pengumuman`)

- Daftar pengumuman aktif (dari admin sekolah dan guru mapel)
- Tipe: info / warning / penting (warna badge berbeda)
- Pengumuman ter-pin muncul di atas
- Tampil di Dashboard sebagai banner (dismiss per pengumuman, disimpan di `localStorage`)
- Filter: semua / belum dibaca / per tipe

---

## 9. Profil (`/student/profil`)

| Bagian | Isi |
|--------|-----|
| Biodata | Nama lengkap, NISN/NIS, kelas/rombel, foto profil |
| Kontak | Alamat, nomor telepon, email |
| Data Orang Tua | Nama ayah/ibu, kontak, pekerjaan (read-only, dikelola admin) |
| Keamanan | Ganti password (dengan verifikasi password lama) |
| Preferensi | Tema portal, notifikasi (email/in-app) |

---

## 10. Database Schema (Tambahan untuk Portal Siswa)

Tabel di bawah ini **tambahan** dari schema akademik yang sudah ada di [AKADEMIK.md](AKADEMIK.md).

### Ujian CBT

| Tabel | Field Utama |
|-------|-------------|
| `exam_sessions` | id, exam_package_id, nama_sesi, waktu_mulai, waktu_selesai, status (draft/aktif/selesai/dibatalkan), token_akses (nullable), kkm, created_by |
| `exam_session_participants` | id, exam_session_id, peserta_didik_id, status (belum/sedang/selesai/diskualifikasi) |
| `exam_attempts` | id, exam_session_id, peserta_didik_id, waktu_mulai, waktu_selesai (nullable), status (berlangsung/selesai/timeout/diskualifikasi), nilai_akhir (nullable), jumlah_benar, jumlah_salah, jumlah_kosong, attempt_ke |
| `attempt_questions` | id, attempt_id, question_id, urutan, jawaban_peserta (nullable), jawaban_file (nullable), nilai_perolehan (nullable), is_correct (nullable), is_ragu (default false), waktu_jawab (nullable), audio_play_count (default 0), section_id (nullable) |
| `attempt_logs` | id, attempt_id, event_type (tab_switch/blur/submit/timeout/kick), detail (nullable), created_at |

### Materi & Tugas (relasi ke modul guru)

| Tabel | Field Utama |
|-------|-------------|
| `material_accesses` | id, learning_material_id, peserta_didik_id, first_accessed_at, last_accessed_at |
| `assignment_submissions` | id, assignment_id, peserta_didik_id, type (file/text/link), content (url/text), file_path (nullable), submitted_at, is_late, score (nullable), feedback (nullable), graded_at (nullable) |
| `forum_threads` | id, rombel_id, subject_id (nullable), judul, created_by (user_id), is_pinned, created_at |
| `forum_replies` | id, thread_id, parent_id (nullable), content, created_by, created_at |
| `announcement_dismissals` | peserta_didik_id, announcement_id (composite PK), dismissed_at |

---

## 11. API Endpoints

```
# Dashboard
GET  /api/student/dashboard-summary       → jadwal hari ini, tugas pending, ujian mendatang, nilai terbaru

# Kelas & Materi
GET  /api/student/my-classes              → rombel aktif + mapel
GET  /api/student/materials               → ?rombelId&subjectId&page
POST /api/student/materials/[id]/access   → catat akses materi

# Tugas
GET  /api/student/assignments             → ?rombelId&status
GET  /api/student/assignments/[id]        → detail + status submission
POST /api/student/assignments/[id]/submit → multipart/form-data
PUT  /api/student/assignments/[id]/submit → update submission (sebelum dinilai)

# Forum
GET  /api/student/forum/threads           → ?rombelId&subjectId
POST /api/student/forum/threads           → buat thread baru
POST /api/student/forum/threads/[id]/reply→ balas thread

# Ujian CBT
GET  /api/student/ujian                   → daftar sesi ditugaskan
GET  /api/student/ujian/[sessionId]       → detail sesi + status attempt
POST /api/student/ujian/[sessionId]/mulai → buat/resume attempt
GET  /api/student/ujian/[sessionId]/soal  → soal & jawaban tersimpan (untuk resume)
POST /api/student/ujian/jawab             → AJAX auto-save jawaban
GET  /api/student/ujian/[sessionId]/timer → sinkronisasi sisa waktu
POST /api/student/ujian/[sessionId]/submit→ finalisasi submit
POST /api/student/ujian/[sessionId]/log   → log event (tab_switch/blur)
GET  /api/student/ujian/[sessionId]/hasil → nilai + statistik
GET  /api/student/ujian/[sessionId]/review→ soal + jawaban + kunci (jika diizinkan)

# Nilai & Rapor
GET  /api/student/nilai                   → ?tahunAjaranId&semester
GET  /api/student/rapor                   → ?tahunAjaranId&semester
GET  /api/student/rapor/pdf               → stream PDF rapor

# Jadwal & Kalender
GET  /api/student/jadwal                  → jadwal mingguan rombel aktif
GET  /api/student/kalender                → events kalender (libur + ujian + tugas deadline)

# Pengumuman
GET  /api/student/pengumuman              → pengumuman aktif (filter by rombel)
POST /api/student/pengumuman/[id]/dismiss → tandai sudah dilihat

# Profil
GET  /api/student/profil                  → biodata lengkap
PUT  /api/student/profil                  → update biodata yang diizinkan
PUT  /api/student/profil/password         → ganti password
```

---

## 12. TODO Checklist

### Phase 1: Foundation
- [x] Folder `app/student/` (dashboard, kelas, ujian, nilai, rapor, jadwal, kalender, pengumuman, profil)
- [x] Middleware: protect `/student/*` → role STUDENT
- [x] `StudentLayoutClient.tsx` (sidebar, nav, breadcrumb — tema biru/indigo)
- [x] Unified login redirect untuk role STUDENT → `/student`

### Phase 2: Kelas, Materi & Tugas
- [x] `/student/kelas` — daftar rombel aktif, card view (enhanced with dynamic routing)
- [x] `/student/kelas/[id]/materi` — list materi + inline viewer (PDF/video)
- [x] `/student/kelas/[id]/tugas` — list tugas + form pengumpulan (upload/text/link)
- [x] Tracking akses materi (`material_accesses`)
- [x] Forum diskusi (thread + reply per rombel)
- [x] API: my-classes, materials, assignments (GET+submit), forum

### Phase 3: Ujian CBT/CAT
- [x] DB: exam_sessions, exam_attempts, attempt_questions, attempt_logs, exam_session_participants (schema ready)
- [x] Enhanced `/student/ujian` — daftar sesi + riwayat portofolio (stats, tabs, history)
- [x] `/student/ujian/[sessionId]/konfirmasi` — petunjuk + input token (full instructions)
- [x] `/student/ujian/[sessionId]/kerjakan` — halaman ujian lengkap:
  - [x] Palet soal (sidebar) dengan warna status (answered/marked/current)
  - [x] Render 4 tipe soal (PG, BS, ISIAN, + framework untuk 8 tipe lainnya)
  - [x] Timer server-authoritative (countdown with warning)
  - [x] Auto-save AJAX (implemented, debounce simulation)
  - [x] Question navigation (prev/next + jump)
  - [x] Mark for review (flag system)
  - [x] Tab switch detection (3x limit lock)
  - [x] Fullscreen enforcement
- [x] `/student/ujian/[sessionId]/hasil` — nilai, statistik, ranking
- [x] `/student/ujian/[sessionId]/review` — soal + jawaban + pembahasan

### Phase 4: Nilai, Rapor & Jadwal
- [x] `/student/nilai` — rekap nilai per mapel + grafik radar
- [x] `/student/rapor` — rapor per semester + download PDF
- [x] `/student/jadwal` — grid mingguan mobile-friendly
- [x] `/student/kalender` — kalender dengan event akademik
- [x] `/student/pengumuman` — daftar + dismiss
- [x] `/student/profil` — biodata + ganti password

### Phase 5: Notifikasi & Polish
- [x] In-app notification center: tugas baru, nilai keluar, ujian dijadwalkan, forum reply
- [x] Email notification service (mock): sesi ujian dijadwalkan, reminder H-1
- [x] Livescore leaderboard (polling 15s) di exam session
- [x] Loading skeleton: Dashboard, Kelas, Materi, Ujian, Nilai
- [x] Error state & empty state components
- [x] Responsive design improvements (mobile-first, sidebar toggle)
- [x] Notification hook: useNotificationHandler() untuk trigger notifikasi
- [x] API endpoint: GET/POST /api/student/notifications
