# TODO: Sekolix — Roadmap Fitur 100% Berfungsi

**Dibuat:** 15 Mei 2026  
**Referensi analisis:** [ANALISIS_FITUR.md](./ANALISIS_FITUR.md)  
**Tujuan:** Semua fitur yang ada di menu navigasi dapat berfungsi penuh

---

## Cara Membaca Dokumen Ini

- Setiap task diberi kode unik (`[ADM-01]`, `[GRU-01]`, dst.)
- Prioritas: 🔴 Kritis · 🟠 Tinggi · 🟡 Sedang · 🟢 Rendah
- Status: `[ ]` Belum · `[~]` Sebagian · `[x]` Selesai
- Setiap task menyertakan lokasi file yang perlu dibuat/diubah

---

## BAGIAN A — PORTAL ADMIN

---

### [A1] Nilai & Rapor *(Admin)*

> **Status saat ini:** 🔴 Placeholder kosong  
> **File:** `app/admin/manajemen-akademik/nilai-rapor/page.tsx`

#### Task

- [x] **[ADM-01]** 🔴 Buat halaman daftar nilai per rombel
  - Card list per rombel: nama, kelas, program, tahun ajaran, jumlah siswa, jumlah mapel + badge hijau mapel yang ada data
  - Filter tahun ajaran (default: aktif) + search nama rombel + pagination
  - Tombol "Lihat Nilai" → `/[rombelId]` dan tombol "Rapor" → `/[rombelId]/rapor`
  - Summary stats: total rombel, total siswa, total mapel ada data
  - File: `app/admin/manajemen-akademik/nilai-rapor/page.tsx`

- [x] **[ADM-02]** 🔴 Buat halaman rekap nilai per rombel (admin view)
  - Tab per mata pelajaran, tabel siswa × rubrik, nilai akhir, predikat, status TUNTAS/REMEDIAL
  - Readonly — admin hanya bisa melihat dan mengunduh rapor per siswa
  - Summary stats: tuntas, remedial, belum, rata-rata per mapel
  - Tombol unduh rapor per siswa (PDF) dan massal
  - File: `app/admin/manajemen-akademik/nilai-rapor/[rombelId]/page.tsx`

- [x] **[ADM-03]** 🟠 Buat fitur generate rapor PDF
  - Menggunakan pdf-lib: 1 halaman per siswa, tabel nilai per mapel, predikat berwarna, footer rata-rata
  - Mendukung: per siswa (studentId param) atau massal (semua siswa satu PDF)
  - API: `app/api/admin/manajemen-akademik/rapor/generate/route.ts`
  - UI halaman rapor: `app/admin/manajemen-akademik/nilai-rapor/[rombelId]/rapor/page.tsx`
    - Banner status kelengkapan data, tabel siswa + kesiapan rapor, unduh per siswa atau semua

- [x] **[ADM-04]** 🟡 Buat halaman cetak rapor massal
  - Daftar rombel dengan checkbox multi-select, filter tahun ajaran + search
  - Tombol "Pilih Semua" + sticky bottom bar untuk cetak batch berurutan
  - Download sequential (bukan ZIP) — satu PDF per rombel
  - File: `app/admin/manajemen-akademik/nilai-rapor/cetak/page.tsx`

- [x] **[ADM-05]** 🟡 Buat API endpoint rekap nilai admin
  - `GET /api/admin/manajemen-akademik/nilai-rapor` — list rombel + status (subjectsWithData, studentCount, subjects[])
  - `GET /api/admin/manajemen-akademik/nilai-rapor/[rombelId]` — nilai per rombel, rubric scores per siswa per mapel
  - `GET /api/admin/manajemen-akademik/rapor/generate` — PDF binary per siswa atau massal

---

### [A2] Pengaturan Akademik *(Admin)*

> **Status saat ini:** 🔴 Placeholder kosong  
> **File:** `app/admin/manajemen-akademik/pengaturan-akademik/page.tsx`

#### Task

- [x] **[ADM-06]** 🔴 Buat form KKM (Kriteria Ketuntasan Minimal) per mata pelajaran
  - **Field `kkm Int?` sudah ada di schema** — tidak perlu migration
  - Tabel inline-edit: pisah antara Mata Pelajaran Teori dan Praktik
  - Perubahan di-track per baris (highlighted kuning), badge "N perubahan belum disimpan"
  - Sticky save bar di bawah untuk UX yang nyaman saat banyak data
  - Search/filter nama dan kode mapel
  - Batch update: satu PUT request untuk semua perubahan
  - File: `app/admin/manajemen-akademik/pengaturan-akademik/page.tsx`
  - API GET + PUT: `app/api/admin/manajemen-akademik/pengaturan-akademik/kkm/route.ts`

- [x] **[ADM-07]** 🟠 Buat form bobot komponen nilai
  - Konfigurasi bobot: Tugas (%), Ulangan Harian (%), UTS (%), UAS (%), Praktik (%)
  - Berlaku global untuk semua mata pelajaran
  - **Migration:** model `GradeComponentWeight` baru di schema dengan `component @unique + weight Int`
  - Stacked progress bar berwarna untuk visualisasi distribusi bobot
  - Slider + input angka per komponen, validasi total = 100%
  - Badge indikator "Tepat 100%" / "Kelebihan X%" / "Kurang X%"
  - Disatukan di halaman pengaturan-akademik sebagai tab kedua (di samping tab KKM)
  - API GET + PUT (upsert): `app/api/admin/manajemen-akademik/pengaturan-akademik/bobot/route.ts`
  - Komponen Slider (shadcn/ui) diinstall

- [x] **[ADM-08]** 🟡 Buat form skala konversi nilai huruf
  - A (90-100), B (80-89), C (70-79), D (60-69), E (<60) — konfigurabel, bisa tambah/hapus predikat
  - **Migration:** model `GradeScale` baru (`grade @unique`, `min_score`, `max_score`, `label?`)
  - Shared helper `src/lib/grade/scale.ts` — `fetchGradeScales()` + `scoreToGrade()` agar tidak duplikat di setiap route
  - `getGradeFromScore` hardcoded di `rekap/route.ts` dan `rekap/export/route.ts` diganti pakai helper DB
  - API GET + PUT (upsert+delete orphan): `app/api/admin/manajemen-akademik/pengaturan-akademik/skala/route.ts`
  - Validasi: min ≤ max per baris, tidak ada tumpang tindih rentang, tidak ada predikat duplikat
  - Tab ketiga di halaman pengaturan-akademik:
    - Preview stacked bar berwarna menampilkan distribusi skala secara visual
    - Tabel edit grid: label, min, maks, predikat (huruf) per baris
    - Tombol tambah/hapus predikat
    - Fallback ke default jika DB kosong

- [x] **[ADM-09]** 🟢 Buat form pengaturan semester
  - Semester 1 & 2: tanggal mulai, tanggal selesai, label, status aktif + durasi otomatis (minggu)
  - Dropdown pilih tahun ajaran (default: tahun aktif)
  - Model `AcademicSemester` (bukan `Semester` — ada enum Semester konflik), migration `20260515145804_add_semester_and_notification_settings`
  - Tab keempat di `app/admin/manajemen-akademik/pengaturan-akademik/page.tsx`
  - API GET + PUT: `app/api/admin/manajemen-akademik/pengaturan-akademik/semester/route.ts`

---

### [A3] Pengaturan → Notifikasi *(Admin)*

> **Status saat ini:** 🟢 Selesai  
> **File:** `app/admin/pengaturan/notifikasi/page.tsx`

#### Task

- [x] **[ADM-10]** 🟠 Buat form konfigurasi email notifikasi
  - SMTP host, port, username, password (dengan show/hide), from name, from email
  - Toggle aktif/nonaktif dengan visual switch
  - API GET + PUT: `app/api/admin/settings/notifikasi/route.ts`
  - Singleton row pattern (`id @default(1)`) + upsert

- [x] **[ADM-11]** 🟡 Buat fitur test kirim email notifikasi
  - Input email tujuan + tombol "Kirim Test" dengan status terkirim
  - Menggunakan nodemailer (installed)
  - API POST: `app/api/admin/settings/notifikasi/test/route.ts`

- [x] **[ADM-12]** 🟡 Buat form notifikasi dalam aplikasi (in-app)
  - Toggle per event: pendaftar baru, pembayaran, nilai, tugas baru, rekap kehadiran
  - Toggle UI berbasis role switch native HTML (konsisten dengan SMTP toggle)
  - Singleton row pattern (`InAppNotificationSetting`, `id @default(1)`)

---

### [A4] Pengaturan → Integrasi & API *(Admin)*

> **Status saat ini:** 🔴 Placeholder kosong  
> **File:** `app/admin/pengaturan/integrasi-api/page.tsx`

#### Task

- [x] **[ADM-13]** 🟡 Buat halaman manajemen API key
  - Generate, lihat, revoke API key untuk integrasi eksternal
  - Tampilkan: key, dibuat, terakhir digunakan, status
  - File: `app/admin/pengaturan/integrasi-api/page.tsx`
  - API: `app/api/admin/settings/api-keys/route.ts`

- [x] **[ADM-14]** 🟢 Buat halaman webhook settings
  - URL webhook untuk event: siswa diterima, nilai diinput, dll.

---

### [A5] Backup & Restore — Perbaikan UI *(Admin)*

> **Status saat ini:** 🟡 Berfungsi tapi UI tidak konsisten  
> **File:** `app/admin/pengaturan/backup-restore/page.tsx`

#### Task

- [x] **[ADM-15]** 🟢 Refactor UI backup-restore menggunakan komponen Shadcn
  - Ganti `<button>` HTML biasa dengan komponen `<Button>`
  - Ganti `<input type="file">` dengan komponen yang konsisten
  - Tambah loading state yang proper (Spinner dari Shadcn)
  - Tambah card/section layout yang konsisten dengan halaman lain

---

## BAGIAN B — PORTAL GURU: UJIAN & CBT

---

### [B1] Buat Paket Ujian *(Guru)*

> **Status saat ini:** 💀 Menu ada, halaman tidak ada (404)  
> **Menu:** `/teacher/ujian/paket`

#### Task

- [x] **[GRU-01]** 🔴 Buat halaman daftar paket ujian
  - Grid card: judul, mapel, tipe (badge berwarna), jumlah soal, durasi, KKM, status Published/Draft
  - Filter: mapel, status + search judul, pagination
  - Aksi per kartu: Edit, Gandakan (clone), Publish/Tarik, Hapus (dengan ConfirmDialog)
  - File: `app/teacher/ujian/paket/page.tsx`
  - Sidebar `comingSoon: true` dihapus

- [x] **[GRU-02]** 🔴 Buat halaman buat/edit paket ujian
  - Layout 2 kolom: kiri (form settings + daftar soal terpilih), kanan (bank soal picker)
  - Form: judul, deskripsi, mapel, tipe ujian, durasi, passing grade, randomize
  - Bank soal picker: filter tipe + kesulitan + search, tap untuk pilih/hapus, preview soal singkat
  - Buat: simpan draft + simpan & publish langsung; Edit: simpan perubahan + toggle publish terpisah
  - File: `app/teacher/ujian/paket/buat/page.tsx`, `[id]/edit/page.tsx`

- [x] **[GRU-03]** 🔴 Buat API CRUD paket ujian
  - `GET /api/teacher/ujian/paket` — list + filter mapel/status/search/pagination
  - `POST /api/teacher/ujian/paket` — buat paket + bulk insert ExamPackageQuestion
  - `GET /api/teacher/ujian/paket/[id]` — detail + soal lengkap (ordered)
  - `PUT /api/teacher/ujian/paket/[id]` — update fields + replace questions (deleteMany + createMany)
  - `DELETE /api/teacher/ujian/paket/[id]` — soft delete
  - `POST /api/teacher/ujian/paket/[id]/publish` — toggle is_published, guard: soal > 0

- [x] **[GRU-04]** 🟠 Tambah model `ExamPackage` di schema Prisma
  - Model `ExamPackage`: teacher_id, subject_id, title, description, exam_type (enum ExamType), duration, passing_grade, randomize, is_published, soft delete
  - Model `ExamPackageQuestion`: package_id + question_id + order, @@unique([package_id, question_id])
  - Relasi ditambah ke Staff (dua titik: `gtk` + `Subject`) dan `QuestionBank`
  - Migration: `20260515155356_add_exam_package` ✓

---

### [B2] Jadwal & Pelaksanaan Ujian *(Guru)*

> **Status saat ini:** 💀 Menu ada, halaman tidak ada (404)  
> **Menu:** `/teacher/ujian/jadwal`

#### Task

- [x] **[GRU-05]** 🔴 Buat halaman daftar jadwal ujian
  - Tampilkan: Nama Ujian, Kelas, Tanggal/Waktu, Status, Token
  - Filter: status (Belum mulai/Berlangsung/Selesai), mapel, kelas
  - File: `app/teacher/ujian/jadwal/page.tsx`

- [x] **[GRU-06]** 🔴 Buat halaman form jadwalkan ujian
  - Pilih paket ujian, pilih rombel, set tanggal & waktu mulai
  - Set durasi window (kapan siswa bisa mulai)
  - Generate token/kode akses ujian
  - File: `app/teacher/ujian/jadwal/buat/page.tsx`

- [x] **[GRU-07]** 🟠 Buat halaman monitor ujian berlangsung
  - Tampilkan real-time: siapa sudah login, progress soal, status submit
  - Tombol: pause ujian, extend waktu
  - File: `app/teacher/ujian/jadwal/[id]/monitor/page.tsx`

- [x] **[GRU-08]** 🟠 Buat API jadwal ujian
  - `GET /api/teacher/ujian/jadwal` — list jadwal
  - `POST /api/teacher/ujian/jadwal` — buat jadwal baru
  - `PUT /api/teacher/ujian/jadwal/[id]` — update jadwal
  - `DELETE /api/teacher/ujian/jadwal/[id]` — hapus jadwal
  - File: `app/api/teacher/ujian/jadwal/route.ts`, `[id]/route.ts`

- [x] **[GRU-09]** 🟡 Tambah model `ExamSchedule` di schema Prisma
  - Fields: id, examPackageId, rombelId, teacherId, startAt, durationMinutes, token, status
  - Buat migration: `npx prisma migrate dev --name add_exam_schedule`

---

### [B3] Hasil & Analisis Ujian *(Guru)*

> **Status saat ini:** 💀 Menu ada, halaman tidak ada (404)  
> **Menu:** `/teacher/ujian/hasil`

#### Task

- [x] **[GRU-10]** 🔴 Buat halaman daftar hasil ujian
  - List ujian yang sudah selesai beserta statistik singkat (rata-rata, pass rate)
  - File: `app/teacher/ujian/hasil/page.tsx`

- [x] **[GRU-11]** 🔴 Buat halaman detail hasil per ujian
  - Tabel siswa: Nama, Nilai, Lulus/Tidak, Waktu Pengerjaan
  - Statistik: rata-rata, tertinggi, terendah, distribusi nilai
  - File: `app/teacher/ujian/hasil/[jadwalId]/page.tsx`

- [x] **[GRU-12]** 🟠 Buat halaman koreksi jawaban essay
  - Tampilkan jawaban siswa untuk soal essay
  - Input nilai manual per jawaban
  - File: `app/teacher/ujian/hasil/[jadwalId]/koreksi/page.tsx`

- [x] **[GRU-13]** 🟠 Buat API hasil ujian
  - `GET /api/teacher/ujian/hasil` — list hasil ujian
  - `GET /api/teacher/ujian/hasil/[jadwalId]` — detail hasil per jadwal
  - `PUT /api/teacher/ujian/hasil/[jadwalId]/koreksi` — simpan nilai essay
  - File: `app/api/teacher/ujian/hasil/route.ts`, `[jadwalId]/route.ts`
  - Bonus: `GET /api/teacher/ujian/hasil/[jadwalId]/export` — Excel export

- [x] **[GRU-14]** 🟡 Buat fitur export hasil ujian ke Excel
  - Download daftar nilai semua siswa per ujian
  - Menggunakan `exceljs` (sudah terinstall)
  - File: `app/api/teacher/ujian/hasil/[jadwalId]/export/route.ts`

---

## BAGIAN C — PORTAL GURU: KOMUNIKASI

> **Status saat ini:** 💀 Semua 4 sub-menu → 404 (tidak ada satu pun halaman)

---

### [C1] Forum Diskusi *(Guru)*

> **Menu:** `/teacher/komunikasi/forum`

#### Task

- [x] **[GRU-15]** 🟠 Tambah model `Discussion` & `DiscussionReply` di schema Prisma
  - Discussion: id, teacherId, rombelId, subjectId, title, content, isPinned, createdAt
  - DiscussionReply: id, discussionId, authorId, authorType (teacher/student), content, createdAt
  - Migration: `add_discussion_forum`

- [x] **[GRU-16]** 🟠 Buat halaman daftar forum diskusi
  - List topik diskusi per kelas
  - Filter: kelas, status (Terbuka/Ditutup)
  - Tombol: Buat Topik Baru
  - File: `app/teacher/komunikasi/forum/page.tsx`

- [x] **[GRU-17]** 🟠 Buat halaman detail diskusi + form balas
  - Tampilkan thread diskusi dengan replies
  - Form input balasan (teks, bisa embed link)
  - File: `app/teacher/komunikasi/forum/[id]/page.tsx`

- [x] **[GRU-18]** 🟠 Buat API forum diskusi
  - `GET /api/teacher/komunikasi/forum` — list diskusi
  - `POST /api/teacher/komunikasi/forum` — buat diskusi baru
  - `GET /api/teacher/komunikasi/forum/[id]` — detail + replies
  - `POST /api/teacher/komunikasi/forum/[id]/reply` — tambah balasan
  - File: `app/api/teacher/komunikasi/forum/route.ts`, `[id]/route.ts`

---

### [C2] Pesan & Konsultasi *(Guru)*

> **Menu:** `/teacher/komunikasi/pesan`

#### Task

- [x] **[GRU-19]** 🟡 Tambah model `Message` di schema Prisma
  - Fields: id, senderId, senderType, receiverId, receiverType, content, isRead, createdAt
  - Migration: `add_message_model`

- [x] **[GRU-20]** 🟡 Buat halaman kotak masuk pesan
  - List percakapan dengan nama, pesan terakhir, waktu, badge unread
  - File: `app/teacher/komunikasi/pesan/page.tsx`

- [x] **[GRU-21]** 🟡 Buat halaman detail percakapan
  - Bubble chat timeline
  - Form kirim pesan baru
  - File: `app/teacher/komunikasi/pesan/[id]/page.tsx`

- [x] **[GRU-22]** 🟡 Buat API pesan
  - `GET /api/teacher/komunikasi/pesan` — list percakapan
  - `POST /api/teacher/komunikasi/pesan` — kirim pesan baru
  - `GET /api/teacher/komunikasi/pesan/[id]` — history percakapan
  - File: `app/api/teacher/komunikasi/pesan/route.ts`

---

### [C3] Komunikasi Orang Tua *(Guru)*

> **Menu:** `/teacher/komunikasi/orang-tua`

#### Task

- [x] **[GRU-23]** 🟡 Buat halaman daftar orang tua siswa
  - List siswa + nama orang tua/wali + kontak
  - Tombol: Kirim Pesan, Lihat Riwayat
  - File: `app/teacher/komunikasi/orang-tua/page.tsx`
  - API: `GET /api/teacher/komunikasi/orang-tua` — ambil data dari `PesertaDidik`

- [x] **[GRU-24]** 🟡 Buat form kirim pengumuman ke orang tua
  - Pilih kelas/individu → tulis pesan → kirim
  - Simpan ke tabel `Message` dengan receiverType = "parent"
  - File: `app/teacher/komunikasi/orang-tua/kirim/page.tsx`

---

### [C4] Kolaborasi Guru *(Guru)*

> **Menu:** `/teacher/komunikasi/kolaborasi`

#### Task

- [x] **[GRU-25]** 🟢 Buat halaman daftar guru (direktori)
  - List semua guru dengan nama, mapel, kontak
  - File: `app/teacher/komunikasi/kolaborasi/page.tsx`
  - API: `GET /api/teacher/komunikasi/kolaborasi` — ambil dari `Staff` (TEACHER)

- [x] **[GRU-26]** 🟢 Buat fitur berbagi materi antar guru
  - Guru bisa tandai materi sebagai "dapat dibagikan ke sesama guru"
  - Halaman daftar materi bersama
  - File: `app/teacher/komunikasi/kolaborasi/materi/page.tsx`

---

## BAGIAN D — PORTAL GURU: LAPORAN

> **Status saat ini:** 💀 Semua 3 sub-menu → 404 (tidak ada satu pun halaman)

---

### [D1] Laporan Mengajar *(Guru)*

> **Menu:** `/teacher/laporan/mengajar`

#### Task

- [x] **[GRU-27]** 🟠 Buat halaman laporan ringkasan mengajar
  - Rekap jurnal mengajar: total pertemuan, rata-rata kehadiran, topik yang sudah disampaikan
  - Filter: periode (bulan/semester), kelas, mapel
  - Grafik: bar chart pertemuan per minggu
  - File: `app/teacher/laporan/mengajar/page.tsx`
  - API: `GET /api/teacher/laporan/mengajar` — agregasi dari `TeachingJournal` + `Attendance`

- [x] **[GRU-28]** 🟡 Buat fitur export laporan mengajar ke PDF/Excel
  - Download laporan jurnal + absensi dalam satu file
  - File: `app/api/teacher/laporan/mengajar/export/route.ts`

---

### [D2] Laporan Nilai & Prestasi *(Guru)*

> **Menu:** `/teacher/laporan/nilai`

#### Task

- [x] **[GRU-29]** 🟠 Buat halaman laporan ringkasan nilai
  - Per kelas: rata-rata nilai, pass rate, siswa berprestasi, siswa perlu perhatian
  - Tren nilai antar semester (jika ada data historis)
  - File: `app/teacher/laporan/nilai/page.tsx`
  - API: `GET /api/teacher/laporan/nilai` — agregasi dari `Grade` + `Assessment`

- [x] **[GRU-30]** 🟡 Buat halaman laporan nilai per siswa (progress report)
  - Grafik perkembangan nilai per siswa per mapel
  - File: `app/teacher/laporan/nilai/[studentId]/page.tsx`

- [x] **[GRU-31]** 🟡 Buat fitur export laporan nilai ke Excel
  - File: `app/api/teacher/laporan/nilai/export/route.ts`

---

### [D3] Analisis Pembelajaran *(Guru)*

> **Menu:** `/teacher/laporan/analisis`

#### Task

- [x] **[GRU-32]** 🟡 Buat halaman analisis efektivitas pembelajaran
  - Korelasi kehadiran vs nilai
  - Topik/materi mana yang skornya rendah
  - Rekomendasi perbaikan (sederhana berdasarkan data)
  - File: `app/teacher/laporan/analisis/page.tsx`
  - API: `GET /api/teacher/laporan/analisis`

---

## BAGIAN E — PORTAL GURU: PENGATURAN

---

### [E1] Profil & Pengaturan Guru *(Guru)*

> **Status saat ini:** 💀 Menu ada, halaman tidak ada (404)  
> **Menu:** `/teacher/pengaturan`

#### Task

- [x] **[GRU-33]** 🔴 Buat halaman pengaturan guru
  - Tab: Profil, Riwayat & Sertifikasi, Password
  - File: `app/teacher/pengaturan/page.tsx`
  - Menu sidebar `comingSoon` dihapus — menu Pengaturan sekarang bisa diklik

- [x] **[GRU-34]** 🔴 Buat form edit profil guru
  - Edit: nama, telepon, alamat, kota, provinsi, bio, foto profil
  - Upload foto via Cloudinary (`lib/storage/cloudinary.ts`), resize 400×400 face-crop
  - API GET + PUT: `app/api/teacher/pengaturan/profil/route.ts`

- [x] **[GRU-35]** 🟠 Buat form edit riwayat pendidikan & sertifikasi
  - Tab "Riwayat & Sertifikasi": tampilkan data `educationHistory`, `educatorCertification`, NIP/NUPTK (read-only)
  - Data dikelola admin, guru hanya bisa melihat — sesuai alur aplikasi

- [x] **[GRU-36]** 🟠 Buat form ganti password
  - Input: password lama, password baru, konfirmasi — toggle show/hide tiap field
  - Validasi: minimal 8 karakter, konfirmasi cocok, cek password lama via bcryptjs
  - API PUT: `app/api/teacher/pengaturan/password/route.ts`

---

## BAGIAN F — PERBAIKAN FITUR YANG ADA (PARTIAL)

---

### [F1] Lampiran Tugas Siswa *(Guru)*

> **Status saat ini:** 🟡 Koreksi tugas ada tapi siswa belum bisa upload file

#### Task

- [x] **[FIX-01]** 🟡 Buat fitur upload lampiran jawaban di sisi siswa
  - (Catatan: butuh portal siswa terpisah atau link publik khusus)
  - Alternatif jangka pendek: guru bisa input URL/link jawaban siswa secara manual
  - File: update `app/teacher/tugas/[id]/pengumpulan/page.tsx`
  - API: update `app/api/teacher/tugas/[id]/pengumpulan/route.ts`

- [x] **[FIX-02]** 🟡 Tambah tombol "Lihat Lampiran" di halaman koreksi tugas
  - Jika `attachment_url` ada, tampilkan link/preview
  - Untuk file: buka di tab baru; untuk gambar: preview modal

---

### [F2] Import/Export Nilai *(Guru)*

> **Status saat ini:** 🟡 Export ada di API tapi belum ada tombol di UI

#### Task

- [x] **[FIX-03]** 🟡 Tambah tombol "Export Excel" di halaman rekap nilai
  - **Hasil verifikasi:** Tombol sudah ada di `app/teacher/nilai/rekap/page.tsx` (baris 328) dan `exportReport("excel")` sudah terpasang
  - **Root cause:** API endpoint `GET /api/teacher/nilai/rekap/export` mengembalikan JSON untuk format `excel`, bukan file binary
  - **Fix:** Implementasi generate Excel sungguhan menggunakan `exceljs` di `app/api/teacher/nilai/rekap/export/route.ts`
    - Sheet dengan header info (kelas, mapel, KKM, tanggal cetak)
    - Kolom header dinamis sesuai daftar rubrik penilaian
    - Baris sub-header bobot per rubrik
    - Data siswa lengkap: nama, NISN, nilai per rubrik, nilai akhir, predikat, status TUNTAS/REMEDIAL
    - Warna status: hijau untuk TUNTAS, merah untuk REMEDIAL
    - Response berupa binary `.xlsx` dengan header `Content-Disposition`

- [x] **[FIX-04]** 🟢 Buat fitur bulk import nilai dari Excel
  - Upload file Excel → parse → preview sebelum simpan → simpan
  - Template Excel bisa di-download dulu
  - File: `app/teacher/nilai/input/import/page.tsx`
  - API: `POST /api/teacher/nilai/input/import`

---

### [F3] Verifikasi API Bank Soal *(Guru)*

> **Status saat ini:** 🟡 UI ada tapi koneksi ke model QuestionBank perlu diverifikasi

#### Task

- [x] **[FIX-05]** 🟠 Verifikasi dan fix API bank soal
  - Cek apakah `app/api/teacher/bank-soal/route.ts` menggunakan model yang benar di schema
  - Model `QuestionBank` di schema: `teacher_id`, `subject_id`, `question_type`, `difficulty`, dll.
  - Fix query Prisma jika ada mismatch field name (camelCase vs snake_case)
  - **Root cause:** `QuestionBank.id` dan `subject_id` bertipe `BigInt` — tidak bisa di-serialize ke JSON secara langsung
  - **Fix:** Tambah `serializeQuestion()` di kedua route (`route.ts` dan `[id]/route.ts`) untuk konversi `id` → `String`, `subject_id` → `Number`, dan normalisasi `options` (Json? → array)
  - Test: buat soal → simpan → muncul di list

- [x] **[FIX-06]** 🟠 Verifikasi PATCH endpoint rubrik
  - Cek apakah `PUT /api/teacher/nilai/rubrik/[id]` mendukung partial update (untuk update bobot)
  - Jika tidak, tambah handler PATCH atau ubah call di frontend dari PATCH ke PUT
  - **Hasil verifikasi:** PATCH handler sudah ada dan benar di `app/api/teacher/nilai/rubrik/[id]/route.ts`
  - Frontend (`rubrik/page.tsx`) juga sudah memanggil `PATCH` dengan `{ weight: newWeight }` — cocok
  - BigInt serialization di semua response (`GET`, `POST`, `PUT`, `PATCH`) sudah di-handle dengan `Number(r.id)`
  - Tidak ada perubahan kode diperlukan — fitur sudah berfungsi
  - File: `app/api/teacher/nilai/rubrik/[id]/route.ts`

---

### [F4] Tugas per Kelas *(Guru)*

> **Status saat ini:** 🟡 Hanya filter, tidak bisa buat tugas dari halaman kelas

#### Task

- [x] **[FIX-07]** 🟢 Tambah tombol "Buat Tugas Baru" di halaman tugas per kelas
  - Tombol mengarah ke `/teacher/tugas/buat?rombelId=...` (pre-fill rombelId)
  - File: update `app/teacher/kelas/[rombelId]/tugas/page.tsx`

---

## BAGIAN G — STRUKTUR & KUALITAS KODE

---

### [G1] Sembunyikan Menu yang Belum Siap

#### Task

- [x] **[QOL-01]** 🔴 Update `TeacherLayoutClient.tsx` untuk disable/badge menu yang belum ada
  - Tambah prop `comingSoon?: boolean` pada tipe `SubMenu` dan `MenuCategory`
  - Sub-menu coming soon: render `<div>` non-clickable dengan badge "Segera" abu-abu
  - Menu top-level coming soon (Pengaturan): render `<div>` disabled dengan opacity 50%
  - Menu yang ditandai: Ujian (Paket, Jadwal, Hasil), semua Komunikasi, semua Laporan, Pengaturan
  - Dropdown (minimized sidebar) juga di-handle: `DropdownMenuItem disabled`
  - File: `app/teacher/TeacherLayoutClient.tsx`

---

### [G2] Shared Components yang Direncanakan tapi Belum Dibuat

#### Task

- [x] **[QOL-02]** 🟢 Buat `src/components/shared/StudentCard.tsx`
- [x] **[QOL-03]** 🟢 Buat `src/components/shared/GradeInput.tsx` (reusable)
- [x] **[QOL-04]** 🟢 Buat `src/components/shared/ScheduleCalendar.tsx`
- [x] **[QOL-05]** 🟢 Buat `src/components/shared/ReportGenerator.tsx`

---

### [G3] Custom Hooks yang Direncanakan tapi Belum Dibuat

#### Task

- [x] **[QOL-06]** 🟢 Buat `src/hooks/useTeacherClasses.ts`
- [x] **[QOL-07]** 🟢 Buat `src/hooks/useStudentData.ts`
- [x] **[QOL-08]** 🟢 Buat `src/hooks/useGrading.ts`
- [x] **[QOL-09]** 🟢 Buat `src/hooks/useAttendance.ts`
- [x] **[QOL-10]** 🟢 Buat `src/hooks/useAssignments.ts`

---

## RINGKASAN TASK

| Kategori | Kritis 🔴 | Tinggi 🟠 | Sedang 🟡 | Rendah 🟢 | Total |
|----------|-----------|-----------|-----------|-----------|-------|
| Admin (A1-A5) | 3 | 6 | 4 | 2 | 15 |
| Ujian & CBT (B1-B3) | 6 | 5 | 2 | 1 | 14 |
| Komunikasi (C1-C4) | 0 | 6 | 6 | 2 | 14 |
| Laporan (D1-D3) | 0 | 4 | 3 | 0 | 7 |
| Pengaturan Guru (E1) | 2 | 2 | 0 | 0 | 4 |
| Perbaikan (F1-F4) | 0 | 3 | 3 | 1 | 7 |
| Kualitas (G1-G3) | 1 | 0 | 0 | 9 | 10 |
| **TOTAL** | **12** | **26** | **18** | **15** | **71** |

---

## URUTAN PENGERJAAN YANG DISARANKAN

### Sprint 1 — Quick Win & Critical Fix (1-2 minggu)
1. `[QOL-01]` Sembunyikan menu yang belum ada (cegah 404) — **30 menit**
2. `[FIX-05]` Verifikasi & fix bank soal API — **2 jam**
3. `[FIX-06]` Verifikasi PATCH endpoint rubrik — **1 jam**
4. `[FIX-03]` Tambah tombol export Excel di rekap nilai — **30 menit**
5. `[GRU-33]` s/d `[GRU-36]` Halaman pengaturan guru — **1 hari**

### Sprint 2 — Admin Akademik (1-2 minggu)
6. `[ADM-06]` Form KKM (butuh migration Prisma)
7. `[ADM-07]` Form bobot komponen nilai
8. `[ADM-01]` s/d `[ADM-05]` Halaman nilai & rapor admin

### Sprint 3 — CBT Minimal (2-3 minggu)
9. `[GRU-04]` Migration model ExamPackage (jika belum ada)
10. `[GRU-01]` s/d `[GRU-03]` Paket ujian CRUD
11. `[GRU-05]` s/d `[GRU-09]` Jadwal ujian
12. `[GRU-10]` s/d `[GRU-14]` Hasil ujian

<!-- Implementasi sampai sini. Lanjut lagi besok -->

### Sprint 4 — Laporan Guru (1-2 minggu)
13. `[GRU-27]` s/d `[GRU-28]` Laporan mengajar
14. `[GRU-29]` s/d `[GRU-31]` Laporan nilai
15. `[GRU-32]` Analisis pembelajaran

### Sprint 5 — Komunikasi (2-3 minggu)
16. `[GRU-15]` s/d `[GRU-26]` Seluruh modul komunikasi

### Sprint 6 — Polish & Shared Components
17. `[QOL-02]` s/d `[QOL-10]` Shared components & hooks
18. `[ADM-15]` Refactor UI backup-restore
19. `[FIX-04]` Bulk import nilai Excel

---

*Dokumen ini harus diperbarui setiap kali task selesai dikerjakan.*  
*Referensi: [ANALISIS_FITUR.md](./ANALISIS_FITUR.md) · [doc/SPEC_GURU.md](./doc/SPEC_GURU.md) · [doc/SPEC_AKADEMIK.md](./doc/SPEC_AKADEMIK.md)*
