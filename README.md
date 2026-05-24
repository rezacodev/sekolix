<div align="center">

# Sekolix

**Platform Manajemen Sekolah Digital untuk Indonesia**

Sekolix membantu sekolah-sekolah di Indonesia melakukan digitalisasi secara lengkap, terintegrasi, dan terjangkau — mulai dari website publik, penerimaan siswa baru, manajemen akademik, hingga portal guru.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.16-2D3748?logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Lisensi-MIT-green)](./LICENSE)

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Demo & Screenshots](#demo--screenshots)
- [Tech Stack](#tech-stack)
- [Fitur Lengkap](#fitur-lengkap)
  - [Portal Admin](#portal-admin)
  - [Portal Guru](#portal-guru)
  - [Landing Page Publik](#landing-page-publik)
  - [Sistem Penerimaan Siswa (SPMB)](#sistem-penerimaan-siswa-spmb)
- [Arsitektur & Struktur Proyek](#arsitektur--struktur-proyek)
- [Database Schema](#database-schema)
- [Persiapan & Instalasi](#persiapan--instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Seeding Database](#seeding-database)
- [Deployment](#deployment)
- [Panduan Kontribusi](#panduan-kontribusi)
- [Dokumentasi Internal](#dokumentasi-internal)
- [Status Fitur & Roadmap](#status-fitur--roadmap)
- [Lisensi](#lisensi)

---

## Tentang Proyek

**Sekolix** adalah sistem manajemen sekolah (*School Management System*) berbasis web yang dibangun dengan teknologi modern dan dirancang khusus untuk kebutuhan sekolah Indonesia. Platform ini mencakup:

- **Website Sekolah** — Landing page multi-tema yang bisa dikonfigurasi tanpa coding
- **Manajemen Akademik** — Data guru, siswa, kelas, jadwal, kurikulum, dan nilai
- **Penerimaan Siswa Baru (SPMB)** — Alur pendaftaran online dengan validasi dan pembayaran
- **Portal Guru** — Dashboard guru dengan fitur absensi, jurnal, materi, tugas, dan penilaian
- **Sistem CBT** — Bank soal dan ujian berbasis komputer (dalam pengembangan)

### Mengapa Sekolix?

| Kebutuhan Sekolah | Solusi Sekolix |
|-------------------|----------------|
| Website sekolah yang profesional | 3 tema landing page siap pakai |
| Proses PPDB yang terdigitalisasi | Modul SPMB dengan alur lengkap |
| Pengelolaan data akademik terpusat | Portal admin dengan CRUD lengkap |
| Guru bisa akses dari mana saja | Portal guru responsif berbasis web |
| Biaya yang terjangkau | Open-source, self-hosted |

---

## Demo & Screenshots

> *Link demo dan screenshots akan ditambahkan setelah deployment.*

---

## Tech Stack

### Core Framework

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Next.js](https://nextjs.org) | 16.1 | Framework fullstack (App Router) |
| [React](https://react.dev) | 19.2 | UI library |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |

### Database & ORM

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [PostgreSQL](https://www.postgresql.org) | 16+ | Database utama |
| [Prisma](https://www.prisma.io) | 5.16 | ORM & migrations |

### Authentication

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [NextAuth.js](https://next-auth.js.org) | 4.24 | Autentikasi & session |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0 | Hashing password |

### UI & Styling

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com) | Latest | Komponen UI |
| [Radix UI](https://www.radix-ui.com) | Latest | Headless UI primitives |
| [Lucide React](https://lucide.dev) | 0.556 | Icon library |
| [Recharts](https://recharts.org) | 3.7 | Chart & visualisasi data |

### File & Media

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Cloudinary](https://cloudinary.com) | 2.8 | Storage & CDN gambar |
| [next-cloudinary](https://next.cloudinary.dev) | 6.17 | Integrasi Cloudinary di Next.js |

### Dokumen & Export

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [pdf-lib](https://pdf-lib.js.org) | 1.17 | Generate dokumen PDF |
| [pdfkit](https://pdfkit.org) | 0.17 | Generate PDF alternatif |
| [exceljs](https://exceljs.github.io/exceljs) | 4.4 | Export data ke Excel |

### Form & Validasi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [React Hook Form](https://react-hook-form.com) | 7.68 | Form management |
| [Zod](https://zod.dev) | 4.1 | Schema validation |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 5.2 | Integrasi Zod + RHF |

### Editor & Kalender

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Tiptap](https://tiptap.dev) | 3.13 | Rich text editor |
| [FullCalendar](https://fullcalendar.io) | 6.1 | Kalender interaktif |
| [React Day Picker](https://daypicker.dev) | 9.13 | Date picker |

---

## Fitur Lengkap

### Portal Admin

Portal admin dapat diakses di `/admin` oleh user dengan role `ADMIN`.

#### Manajemen Akademik

**Data GTK (Guru & Tenaga Kependidikan)**
- CRUD biodata lengkap guru: NIP, NUPTK, NIK, jabatan, status kepegawaian
- Data pribadi: tempat/tanggal lahir, alamat, kontak, foto
- Riwayat pendidikan & sertifikasi (format JSON terstruktur)
- Import massal dari file CSV/Excel
- Soft delete dengan restore

**Data Peserta Didik (Siswa Aktif)**
- CRUD profil siswa lengkap: NISN, NIK, data keluarga (ayah/ibu/wali)
- Data fisik: berat, tinggi, jarak ke sekolah, transportasi
- Assign siswa ke rombel kelas
- Import massal dari CSV
- Filter: program, tahun masuk, status

**Tahun Ajaran**
- Kelola multiple tahun ajaran, set satu sebagai aktif
- Kalender akademik: tambah event/kegiatan sekolah per tahun ajaran
- Field `yearCode` untuk konfigurasi kode registrasi SPMB

**Kurikulum & Mata Pelajaran**
- Kelola kurikulum (mis. Kurikulum Merdeka, K-13)
- CRUD mata pelajaran dengan kode, deskripsi, flag praktik (`is_practice`)
- Distribusi mata pelajaran ke program/jurusan
- Relasi mata pelajaran ↔ kurikulum ↔ kelas

**Kelas & Rombongan Belajar (Rombel)**
- CRUD kelas (tingkat): X, XI, XII, dst.
- CRUD rombel: kelas + program + tahun ajaran
- Mapping guru pengampu per mata pelajaran per rombel
- Detail rombel: daftar siswa, jadwal, guru pengampu
- Wizard transfer/naik kelas siswa (batch operation)

**Ruang & Jam Pelajaran**
- Kelola ruang kelas: kode, kapasitas, tipe (kelas/lab/aula), lantai, gedung
- Kelola slot jam pelajaran: nama, waktu mulai, waktu selesai, hari
- Jadwal pelajaran mingguan per rombel

**Nilai & Rapor** *(dalam pengembangan)*
- View rekap nilai per rombel (readonly)
- Generate rapor PDF per siswa
- Cetak rapor massal per kelas

**Pengaturan Akademik** *(dalam pengembangan)*
- Konfigurasi KKM per mata pelajaran
- Bobot komponen nilai (UH, UTS, UAS, Tugas, Praktik)
- Skala konversi nilai huruf (A/B/C/D/E)

#### Landing Website

**Konten**
- Artikel: CRUD dengan rich text editor (Tiptap), featured image, SEO meta
- Berita: seperti artikel dengan kategori
- Event: dengan tanggal mulai/selesai, lokasi, gambar
- Halaman statis: profil sekolah, visi-misi, sejarah, fasilitas, dll.

**Galeri & Media**
- Album foto dengan reordering drag-and-drop
- Upload foto ke Cloudinary dengan CDN
- Manajemen media terpusat
- Galeri publik dengan grid responsif

**Pengaturan Tema**
- Pilih dari 3 tema landing page
- Konfigurasi warna: primary, secondary, accent, text, border
- Upload logo kustom
- Konfigurasi font heading & body

**Tenaga Pendidik Publik**
- Profil guru/staf yang ditampilkan di halaman publik
- Foto, jabatan, bidang studi, bio

#### Penerimaan Siswa (SPMB)

- Daftar pendaftar: filter status, cari, lihat detail profil lengkap
- Ubah status: pending → review → accepted/rejected
- Manajemen pembayaran: validasi bukti pembayaran
- Konversi siswa diterima → peserta didik aktif (otomatis isi data)
- **Pengaturan:**
  - Tahun penerimaan: biaya pendaftaran, tanggal buka/tutup
  - Program/jurusan yang tersedia
  - Format kode registrasi (prefix, suffix, padding)
  - Pengaturan halaman landing SPMB

#### Pengaturan Sistem

- **Identitas Sekolah:** nama, logo, tagline, alamat, kontak, timezone
- **Backup & Restore:** export database ke JSON, restore dari file JSON
- **Notifikasi:** konfigurasi SMTP email *(dalam pengembangan)*
- **Integrasi & API:** manajemen API key *(dalam pengembangan)*

#### Manajemen Pengguna

- Daftar user dengan role (ADMIN/EDITOR/USER)
- CRUD user, reset password
- Dual role: user ADMIN yang juga punya data Staff TEACHER

---

### Portal Guru

Portal guru dapat diakses di `/teacher` oleh user yang memiliki data `Staff` dengan role `TEACHER`.

#### Sistem Dual Role

Pengguna yang memiliki role ADMIN sekaligus data guru (Staff TEACHER) mendapatkan:
- Halaman pemilih peran (`/select-role`) saat login pertama kali
- Tombol **RoleSwitcher** di header untuk berpindah antara portal admin ↔ portal guru
- Preferensi peran tersimpan di cookie (persisten antar session)

#### Tema Portal Guru

5 tema tersedia dan bisa dipilih per user:
- Classic Light (putih/abu)
- Modern Light (biru muda)
- Minimalist (minimal, hitam-putih)
- Midnight Emerald (gelap, hijau emerald)
- Violet Night (gelap, ungu)

Tema tersimpan di database (`teacherTheme` di model `User`) dan di `localStorage`.

#### Dashboard

- **Statistik hari ini:** total kelas diampu, total siswa, total materi, jadwal hari ini
- **Jadwal mengajar hari ini:** nama kelas, mapel, ruangan, jam
- **Tugas pending:** tugas yang deadline-nya dekat atau sudah lewat
- **Pengumuman sekolah:** notifikasi & pengumuman terbaru
- **Quick Actions:** tombol cepat ke absensi, upload materi, buat tugas, input nilai

#### Kelas Saya

**Daftar Kelas**
- Kartu kelas dengan info: tingkat, rombel, program, mapel yang diampu, jumlah siswa
- Filter: hari mengajar
- Sort: nama kelas, jumlah siswa, mapel
- Search: kelas, rombel, mapel, program
- Otomatis filter berdasarkan tahun ajaran aktif
- Quick links per kelas: Siswa, Absensi, Jurnal, Tugas, Materi

**Data Siswa per Kelas**
- Tabel siswa: nama, NISN, jenis kelamin
- Search: nama, NIK, NISN
- Filter: jenis kelamin
- Pagination (50 siswa/halaman)
- Modal detail siswa dengan 4 tab:
  - **Data Pribadi:** biodata, alamat, kontak, data fisik
  - **Data Keluarga:** data ayah, ibu, wali
  - **Akademik:** nilai terbaru, rata-rata, statistik
  - **Catatan:** catatan guru

**Absensi Kelas**
- Input absensi per pertemuan dengan kalender custom (tanggal yang sudah ada absensi di-highlight)
- Status: Hadir / Sakit / Izin / Alpha
- Bulk action: "Semua Hadir" dan bulk aksi lainnya
- Field keterangan/alasan ketidakhadiran
- Nomor pertemuan otomatis (auto-calculate)
- Riwayat absensi: tabel dengan sticky header, dual scroll
- Statistik absensi per siswa: persentase kehadiran
- Export rekap absensi ke Excel (menggunakan exceljs)

**Jurnal Mengajar**
- Form input jurnal: tanggal, jam, topik, metode, media, kendala, tindak lanjut, catatan
- Riwayat jurnal: tabel dengan filter tanggal & search
- Edit dan hapus jurnal
- Auto-switch ke tab riwayat setelah simpan
- Export jurnal ke Excel dengan styling profesional

#### Pembelajaran

**Materi Pembelajaran**
- Upload materi berbagai format: PDF, Word, PPT, video (upload/embed YouTube), audio, link eksternal
- Metadata: judul, deskripsi, kelas tujuan, topik/bab, tags
- Scheduled publishing: atur tanggal terbit
- Preview berdasarkan tipe: PDF viewer (iframe), video player, image preview, audio player
- Statistik akses: jumlah view & download
- Status: Draft / Published / Scheduled
- Edit metadata, hapus materi
- Filter & search: mapel, kelas, status, keyword

**Silabus Pembelajaran**
- CRUD silabus dengan informasi lengkap
- Duplicate silabus (salin untuk kelas/semester lain)
- Link ke RPP terkait
- Daftar RPP yang menggunakan silabus ini

**RPP (Rencana Pelaksanaan Pembelajaran)**
- CRUD RPP dengan form terstruktur
- Relasi ke silabus induk
- Duplicate RPP
- Preview detail RPP

#### Tugas & Penilaian

**Kelola Tugas Online**
- Buat tugas: judul, deskripsi, rombel, mapel, deadline (tanggal + jam), nilai maksimal
- Auto-fill tahun ajaran & semester dari tahun ajaran aktif
- Daftar tugas: judul, rombel, mapel, deadline, progress pengumpulan (X/Y siswa)
- Filter: status (upcoming/overdue), search judul/deskripsi
- Server-side pagination
- Aksi: lihat & koreksi, edit, hapus

**Koreksi & Penilaian Tugas**
- Daftar seluruh siswa di kelas tersebut
- Status per siswa: Belum Mengumpulkan / Sudah Mengumpulkan / Sudah Dikoreksi
- Statistik ringkasan: total, sudah mengumpulkan, sudah dikoreksi, belum
- Dialog penilaian: input nilai (0 – nilai maksimal), textarea feedback
- Real-time update setelah simpan nilai

**Input Nilai Akademik**
- Spreadsheet-like interface: tabel dengan kolom dinamis per assessment
- Inline editing: klik cell → input nilai → blur → auto-save
- Auto-kalkulasi nilai akhir berbobot
- Flag merah untuk siswa di bawah KKM
- Konversi huruf otomatis (A/B/C/D/E)
- Badge status: Tuntas / Remedial
- Sticky kolom pertama (no, nama) saat scroll horizontal
- Pilih kelas & mapel dari dropdown
- Info kelas: rombel, mapel, KKM, total siswa

**Rekap & Analisis Nilai**
- Bar chart: distribusi nilai per rentang (90-100, 80-89, dst.)
- Pie chart: persentase distribusi
- Line chart: tren distribusi
- Statistik cards: rata-rata, tertinggi, terendah, standar deviasi, pass rate
- Daftar siswa di bawah KKM (perlu remedial) dengan ranking
- Daftar siswa berprestasi (top performers) dengan ranking
- Export ke Excel (raw data + breakdown per assessment)

**Rubrik Penilaian**
- Buat rubrik: nama, deskripsi, tipe (Tugas/UTS/UAS/Praktik/UH), bobot, skor maksimal
- Kriteria penilaian per rubrik: nama, deskripsi, nilai maksimal
- Validasi: total skor kriteria tidak boleh melebihi 100
- Setup bobot massal: atur bobot semua rubrik dalam satu dialog
- Edit & hapus rubrik (dengan konfirmasi + peringatan dampak ke nilai)

#### Ujian & CBT

**Bank Soal**
- Buat soal: pilihan ganda, benar/salah, jawaban singkat, essay, menjodohkan
- Metadata soal: tingkat kesulitan (Mudah/Sedang/Sulit), tingkat kognitif (C1-C6 Bloom)
- Topik, tags untuk pencarian
- Filter: mapel, kesulitan, tipe, tingkat kognitif, search keyword
- Statistik: usage count, last used

> **Catatan:** Fitur Paket Ujian, Jadwal, dan Hasil sedang dalam pengembangan.

#### Komunikasi

> Seluruh modul Komunikasi (Forum Diskusi, Pesan & Konsultasi, Komunikasi Orang Tua, Kolaborasi Guru) **sedang dalam pengembangan**.

#### Laporan

> Seluruh modul Laporan (Laporan Mengajar, Laporan Nilai & Prestasi, Analisis Pembelajaran) **sedang dalam pengembangan**.

#### Pengaturan

> Halaman Pengaturan Guru (edit profil, ganti password) **sedang dalam pengembangan**.

---

### Landing Page Publik

Landing page dapat dikonfigurasi melalui panel admin dan diakses tanpa login.

**3 Tema Tersedia:**

| Tema | Deskripsi | Warna Default |
|------|-----------|---------------|
| Academic Classic | Formal & elegan | Navy gelap + emas |
| Modern Vibrant | Modern & berwarna | Biru cerah + aksen warna |
| Minimalist Clean | Bersih & minimal | Putih + abu |

**Halaman yang Tersedia:**
- Home (dengan seksi hero, statistik, program, filosofi, CTA)
- Tentang Sekolah
- Profil: Sejarah, Visi & Misi, Struktur Organisasi, Fasilitas, Program Keahlian
- Informasi: Artikel, Berita, Event
- Galeri Foto
- Halaman dinamis (`/profil/[slug]`)
- Kontak

**Fitur SEO:**
- Meta description per halaman
- Slug kustom
- Featured image

---

### Sistem Penerimaan Siswa (SPMB)

**Alur Pendaftaran:**

```
Calon Siswa                          Admin
     │                                  │
     ├─ Isi form pendaftaran awal        │
     │  (nama, NIK, mapel pilihan)       │
     │                                  │
     ├─ Terima kode registrasi ─────────►│ Lihat di daftar pendaftar
     │                                  │
     ├─ Upload bukti pembayaran         ►│ Validasi pembayaran
     │                                  │
     ├─ Lengkapi profil (biodata        ►│ Review profil lengkap
     │  keluarga, orang tua, dll.)      │
     │                                  │
     │◄──────────────────────────────── ├─ Ubah status: Diterima/Ditolak
     │                                  │
     │ (jika diterima)                  ├─ Konversi → PesertaDidik
     └──────────────────────────────────┘
```

**Format Kode Registrasi** (bisa dikonfigurasi):
- Prefix: `DAFTAR`
- Nomor urut: `0001`, `0002`, dst. (panjang bisa diatur)
- Kode tahun: `24`, `2425`, dst. (opsional)
- Contoh: `DAFTAR-0001-24`

---

## Arsitektur & Struktur Proyek

```
sekolix/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Landing page publik (tanpa auth)
│   │   ├── page.tsx             # Home
│   │   ├── about/               # Tentang
│   │   ├── profil/              # Profil sekolah (8 halaman)
│   │   ├── informasi/           # Artikel, berita, event
│   │   ├── gallery/             # Galeri foto
│   │   └── contact/             # Kontak
│   ├── admin/                   # Portal Admin (auth required: ADMIN)
│   │   ├── page.tsx             # Dashboard admin
│   │   ├── AdminLayoutClient.tsx # Layout sidebar + header admin
│   │   ├── landing-website/     # Manajemen konten website
│   │   │   ├── articles/        # CRUD artikel
│   │   │   ├── events/          # CRUD event
│   │   │   ├── news/            # CRUD berita
│   │   │   ├── gallery/         # Kelola galeri & album
│   │   │   ├── media/           # Manajemen media
│   │   │   ├── pages/           # Halaman statis
│   │   │   └── website-settings/# Tema & identitas landing
│   │   ├── manajemen-akademik/  # Manajemen akademik
│   │   │   ├── gtk/             # Data guru & tenaga kependidikan
│   │   │   ├── peserta-didik/   # Data siswa aktif
│   │   │   ├── tahun-ajaran/    # Tahun ajaran & kalender
│   │   │   ├── kurikulum-mapel/ # Kurikulum & mata pelajaran
│   │   │   ├── rombel/          # Kelas & rombel
│   │   │   ├── ruang-jam-pelajaran/ # Ruang & jadwal
│   │   │   ├── nilai-rapor/     # Nilai & rapor (WIP)
│   │   │   └── pengaturan-akademik/ # Pengaturan KKM, bobot (WIP)
│   │   ├── penerimaan-siswa/    # Modul SPMB
│   │   │   ├── pendaftaran-baru/# Daftar & detail pendaftar
│   │   │   ├── pembayaran/      # Validasi pembayaran
│   │   │   ├── siswa-diterima/  # Konversi ke siswa aktif
│   │   │   └── settings/        # Konfigurasi SPMB
│   │   ├── pengaturan/          # Pengaturan sistem
│   │   │   ├── identitas-sekolah/
│   │   │   ├── backup-restore/
│   │   │   ├── notifikasi/      # (WIP)
│   │   │   └── integrasi-api/   # (WIP)
│   │   └── pengguna/            # Manajemen user
│   ├── teacher/                 # Portal Guru (auth required: TEACHER)
│   │   ├── page.tsx             # Dashboard guru
│   │   ├── TeacherLayoutClient.tsx # Layout sidebar + header guru
│   │   ├── kelas/               # Kelas yang diampu
│   │   │   └── [rombelId]/      # Per kelas:
│   │   │       ├── siswa/       # Data siswa
│   │   │       ├── absensi/     # Input & rekap absensi
│   │   │       ├── jurnal/      # Jurnal mengajar
│   │   │       └── tugas/       # Tugas per kelas (filter view)
│   │   ├── pembelajaran/        # Materi & perencanaan
│   │   │   ├── materi/          # Upload & kelola materi
│   │   │   ├── silabus/         # CRUD silabus
│   │   │   └── rpp/             # CRUD RPP
│   │   ├── tugas/               # Kelola tugas online
│   │   │   └── [id]/pengumpulan/# Koreksi & nilai tugas
│   │   ├── nilai/               # Sistem penilaian
│   │   │   ├── input/           # Input nilai spreadsheet
│   │   │   ├── rekap/           # Rekap & analisis nilai
│   │   │   └── rubrik/          # Kelola rubrik penilaian
│   │   ├── ujian/               # Ujian & CBT
│   │   │   └── bank-soal/       # Bank soal (berfungsi)
│   │   │   # paket/, jadwal/, hasil/ → WIP
│   │   ├── komunikasi/          # (WIP - semua 404)
│   │   ├── laporan/             # (WIP - semua 404)
│   │   └── pengaturan/          # (WIP - 404)
│   ├── api/                     # API Routes
│   │   ├── auth/                # NextAuth endpoints
│   │   ├── admin/               # API untuk portal admin (60+ endpoints)
│   │   ├── teacher/             # API untuk portal guru (38+ endpoints)
│   │   ├── shared/              # API dengan role-based filtering
│   │   └── subjects/            # API mata pelajaran publik
│   ├── login/                   # Unified login page
│   ├── select-role/             # Pemilih peran (dual role)
│   └── unauthorized/            # Halaman akses ditolak
│
├── src/
│   ├── components/
│   │   ├── admin/               # Komponen khusus admin
│   │   ├── teacher/             # Komponen khusus guru
│   │   ├── shared/              # Komponen bersama (RoleSwitcher, dll.)
│   │   ├── themes/              # Komponen 3 tema landing page
│   │   │   ├── academic-classic/
│   │   │   ├── modern-vibrant/
│   │   │   └── minimalist-clean/
│   │   ├── ui/                  # Shadcn/Radix UI primitives
│   │   ├── features/            # Komponen fitur khusus
│   │   ├── gallery/             # Komponen galeri
│   │   ├── media/               # Komponen media
│   │   └── spmb/                # Komponen SPMB publik
│   ├── lib/
│   │   ├── auth/                # Konfigurasi NextAuth
│   │   ├── db/                  # Database helpers
│   │   ├── storage/             # Cloudinary integration
│   │   ├── validators/          # Zod schemas
│   │   └── utils/               # Helper functions
│   ├── hooks/                   # Custom React hooks
│   ├── contexts/                # React contexts
│   ├── providers/               # App providers
│   ├── types/                   # TypeScript type definitions
│   └── constants/               # Konstanta aplikasi (tema, routes)
│
├── prisma/
│   ├── schema.prisma            # Database schema (70+ model)
│   ├── migrations/              # Migration history (20+ migrasi)
│   └── seeds/                   # Seed scripts
│       └── seed.ts              # Entry point seeding (3 skenario)
│
├── public/                      # Static assets
│   └── images/                  # Favicon, logo, assets statis
│
├── doc/                         # Dokumentasi internal
│   ├── GUIDE_DEV.md             # Panduan development
│   ├── SPEC_GURU.md             # Spesifikasi portal guru
│   ├── SPEC_AKADEMIK.md         # Spesifikasi modul akademik
│   ├── SPEC_LANDING.md          # Spesifikasi landing page
│   └── TODO_*.md                # Daftar implementasi
│
├── ANALISIS_FITUR.md            # Analisis status fitur saat ini
├── TODO_FITUR_LENGKAP.md        # Roadmap ke 100% berfungsi
├── middleware.ts                 # Route protection middleware
├── next.config.ts               # Konfigurasi Next.js
└── package.json
```

---

## Database Schema

Sekolix menggunakan **70+ model Prisma** yang terorganisir dalam beberapa domain:

### Authentication & User
| Model | Keterangan |
|-------|------------|
| `User` | Akun pengguna (role: ADMIN/EDITOR/USER), menyimpan preferensi tema |
| `Account` | OAuth accounts (NextAuth) |
| `Session` | Active sessions (NextAuth) |
| `Staff` | Data guru & tenaga kependidikan (unified table dengan `User`) |

### Konten Landing Page
| Model | Keterangan |
|-------|------------|
| `Page` | Halaman statis landing |
| `Article` | Artikel dengan SEO |
| `News` | Berita sekolah |
| `Event` | Kegiatan/acara |
| `Album` | Album galeri foto |
| `Gallery` | Item foto dalam album |
| `LandingSection` | Seksi landing (hero, stats, dll.) |
| `ThemeConfig` | Konfigurasi tema landing (warna, font, logo) |
| `Media` | Manajemen media Cloudinary |
| `SchoolIdentity` | Identitas sekolah |

### Penerimaan Siswa (SPMB)
| Model | Keterangan |
|-------|------------|
| `Applicant` | Calon siswa dengan biodata lengkap |
| `PesertaDidik` | Siswa aktif (setelah diterima) |
| `ApplicantPayment` | Pembayaran pendaftaran |
| `ApplicantValidation` | Riwayat validasi |
| `Program` | Program/jurusan sekolah |
| `TahunAjaran` | Tahun ajaran (SPMB & akademik) |
| `AcademicEvent` | Event kalender akademik |
| `AdmissionLandingSetting` | Pengaturan landing SPMB |
| `AdmissionRegistrationCodeSetting` | Format kode registrasi per tahun |

### Akademik Inti
| Model | Keterangan |
|-------|------------|
| `Curriculum` | Kurikulum (Merdeka, K-13, dll.) |
| `Subject` | Mata pelajaran |
| `SubjectCurriculum` | Relasi mapel ↔ kurikulum |
| `SubjectClass` | Relasi mapel ↔ kelas |
| `SubjectProgram` | Relasi mapel ↔ program |
| `Class` | Tingkat kelas (X, XI, XII) |
| `Rombel` | Rombongan belajar |
| `TeacherSubject` | Relasi guru ↔ mapel ↔ rombel |
| `Room` | Ruang kelas/lab |
| `LessonTime` | Slot jam pelajaran |
| `ClassSchedule` | Jadwal pelajaran mingguan |

### Pembelajaran & Penilaian
| Model | Keterangan |
|-------|------------|
| `Attendance` | Rekam absensi siswa |
| `TeachingJournal` | Jurnal mengajar guru |
| `TeachingMaterial` | Materi pembelajaran |
| `Syllabus` | Silabus pembelajaran |
| `LessonPlan` | RPP (Rencana Pelaksanaan Pembelajaran) |
| `Assignment` | Tugas online |
| `AssignmentSubmission` | Pengumpulan tugas siswa |
| `Assessment` | Komponen penilaian (UH, UTS, UAS, dst.) |
| `Grade` | Nilai siswa per assessment |
| `AssessmentRubric` | Rubrik penilaian |
| `RubricCriteria` | Kriteria per rubrik |
| `RubricScore` | Skor per kriteria per siswa |
| `ReportCard` | Rapor siswa |

### Ujian & CBT
| Model | Keterangan |
|-------|------------|
| `QuestionBank` | Bank soal (multi-tipe) |
| `Exam` | Paket ujian |
| `ExamResult` | Hasil ujian siswa |

### Kenaikan Kelas
| Model | Keterangan |
|-------|------------|
| `TransferBatch` | Batch operasi naik kelas/transfer |
| `Transfer` | Record transfer per siswa |

---

## Persiapan & Instalasi

### Prasyarat

- **Node.js** ≥ 20.x
- **PostgreSQL** ≥ 14
- **npm** ≥ 10.x (atau pnpm/yarn)
- Akun **Cloudinary** (untuk upload media)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/your-org/sekolix.git
cd sekolix

# 2. Install dependensi
npm install

# 3. Salin file environment dan isi konfigurasi
cp .env.example .env.local
# Edit .env.local (lihat bagian Konfigurasi Environment)

# 4. Generate Prisma client
npx prisma generate

# 5. Jalankan migrasi database
npx prisma migrate deploy
# atau saat development:
npx prisma migrate dev

# 6. (Opsional) Isi data awal
npm run prisma:seed

# 7. Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat landing page.  
Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)  
Portal guru: [http://localhost:3000/teacher](http://localhost:3000/teacher)

---

## Konfigurasi Environment

Buat file `.env.local` di root project:

```env
# ===========================
# DATABASE
# ===========================
DATABASE_URL="postgresql://user:password@localhost:5432/sekolix"

# ===========================
# NEXTAUTH
# ===========================
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ===========================
# CLOUDINARY (Media Storage)
# ===========================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# ===========================
# APLIKASI
# ===========================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Mendapatkan Credentials

**PostgreSQL:**
- Lokal: install PostgreSQL, buat database `sekolix`
- Cloud: [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app)

**Cloudinary:**
1. Daftar di [cloudinary.com](https://cloudinary.com)
2. Buka dashboard → Settings → API Keys
3. Salin Cloud Name, API Key, API Secret

**NextAuth Secret:**
```bash
# Generate secret yang aman
openssl rand -base64 32
```

---

## Seeding Database

Tersedia 3 skenario seeding:

```bash
# Skenario minimal: hanya data esensial (user admin, tahun ajaran, 1-2 siswa)
npm run prisma:seed:minimal

# Skenario demo: data representatif untuk demo/presentasi
npm run prisma:seed:demo

# Skenario full: data lengkap untuk testing semua fitur
npm run prisma:seed:full

# Default (sama dengan full)
npm run prisma:seed
```

**Akun default setelah seed:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sekolix.com` | `admin123` |
| Admin + Guru | `guru@sekolix.com` | `guru123` |
| Guru only | `guru2@sekolix.com` | `guru123` |

> **Peringatan:** Ubah password sebelum deployment ke produksi.

---

## Deployment

### Vercel (Direkomendasikan)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard
# atau gunakan vercel env add
```

Pastikan `prebuild` script (`prisma migrate deploy`) berjalan dengan benar di Vercel.

### Docker

```dockerfile
# Dockerfile tersedia (perlu dibuat)
# Contoh:
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS / Server Sendiri

```bash
# Build untuk produksi
npm run build

# Jalankan server produksi
npm start

# Gunakan PM2 untuk process management
npm install -g pm2
pm2 start npm --name "sekolix" -- start
pm2 save
pm2 startup
```

**Reverse proxy dengan Nginx:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Panduan Kontribusi

Kami menyambut kontribusi dari siapa saja! Berikut cara berkontribusi:

### Setup Development

```bash
# Fork repository di GitHub, lalu clone fork Anda
git clone https://github.com/YOUR-USERNAME/sekolix.git
cd sekolix

# Tambahkan upstream
git remote add upstream https://github.com/original-org/sekolix.git

# Install dependensi
npm install
```

### Alur Kontribusi

```bash
# 1. Buat branch baru dari main
git checkout -b feature/nama-fitur
# atau
git checkout -b fix/nama-bug

# 2. Kerjakan perubahan
# ...

# 3. Commit dengan pesan yang deskriptif
git commit -m "feat: tambah halaman pengaturan guru"
# atau
git commit -m "fix: perbaiki PATCH endpoint rubrik"

# 4. Push ke fork Anda
git push origin feature/nama-fitur

# 5. Buat Pull Request di GitHub
```

### Konvensi Commit

```
feat:    fitur baru
fix:     perbaikan bug
chore:   perubahan non-fungsional (config, deps)
docs:    perubahan dokumentasi
refactor: refactoring kode
style:   perubahan style/formatting
test:    menambah/mengubah test
```

### Panduan Koding

Baca [doc/GUIDE_DEV.md](./doc/GUIDE_DEV.md) untuk:
- Cara membuat DataTable dengan server-side pagination
- Sistem breadcrumb admin & guru
- Pattern form dengan React Hook Form + Zod
- Konvensi penamaan file dan komponen

### Fitur yang Butuh Kontributor

Lihat [TODO_FITUR_LENGKAP.md](./TODO_FITUR_LENGKAP.md) untuk daftar lengkap.  
Fitur prioritas tinggi untuk kontributor baru:
- Halaman Pengaturan Guru (`[GRU-33]` s/d `[GRU-36]`)
- Laporan Mengajar Guru (`[GRU-27]`, `[GRU-28]`)
- Form KKM & Bobot Nilai Admin (`[ADM-06]`, `[ADM-07]`)

---

## Dokumentasi Internal

| File | Isi |
|------|-----|
| [doc/GUIDE_DEV.md](./doc/GUIDE_DEV.md) | Panduan development: DataTable, breadcrumb, form pattern |
| [doc/SPEC_GURU.md](./doc/SPEC_GURU.md) | Spesifikasi lengkap portal guru (6000+ baris) |
| [doc/SPEC_AKADEMIK.md](./doc/SPEC_AKADEMIK.md) | Spesifikasi modul akademik & database design |
| [doc/SPEC_LANDING.md](./doc/SPEC_LANDING.md) | Spesifikasi landing page & tema |
| [doc/SPEC_AKADEMIK_REPORT.md](./doc/SPEC_AKADEMIK_REPORT.md) | Spesifikasi sistem rapor |
| [doc/TODO_REKOMENDASI_STRUKTUR_MENU.md](./doc/TODO_REKOMENDASI_STRUKTUR_MENU.md) | Progress implementasi portal guru |
| [ANALISIS_FITUR.md](./ANALISIS_FITUR.md) | Analisis status semua fitur di menu |
| [TODO_FITUR_LENGKAP.md](./TODO_FITUR_LENGKAP.md) | Roadmap 71 task menuju 100% berfungsi |
| [prisma/SEEDING_GUIDE.md](./prisma/SEEDING_GUIDE.md) | Panduan seeding database |

---

## Status Fitur & Roadmap

### Status Saat Ini

| Portal | Modul | Status |
|--------|-------|--------|
| Admin | Landing Website | ✅ Lengkap |
| Admin | SPMB | ✅ Lengkap |
| Admin | GTK (Data Guru) | ✅ Lengkap |
| Admin | Peserta Didik | ✅ Lengkap |
| Admin | Tahun Ajaran & Kalender | ✅ Lengkap |
| Admin | Kurikulum & Mapel | ✅ Lengkap |
| Admin | Kelas & Rombel | ✅ Lengkap |
| Admin | Ruang & Jadwal | ✅ Lengkap |
| Admin | Identitas Sekolah | ✅ Lengkap |
| Admin | Backup & Restore | 🟡 Berfungsi, UI perlu polish |
| Admin | Nilai & Rapor | 🔴 Belum diimplementasi |
| Admin | Pengaturan Akademik | 🔴 Belum diimplementasi |
| Admin | Notifikasi | 🔴 Placeholder |
| Admin | Integrasi & API | 🔴 Placeholder |
| Guru | Dashboard | ✅ Lengkap |
| Guru | Kelas Saya (Siswa, Absensi, Jurnal) | ✅ Lengkap |
| Guru | Materi Pembelajaran | ✅ Lengkap |
| Guru | Silabus & RPP | ✅ Lengkap |
| Guru | Kelola Tugas | ✅ Lengkap |
| Guru | Koreksi Tugas | 🟡 Ada, lampiran belum |
| Guru | Input Nilai | ✅ Lengkap |
| Guru | Rekap Nilai | ✅ Lengkap |
| Guru | Rubrik Penilaian | ✅ Lengkap |
| Guru | Bank Soal | 🟡 Ada, perlu verifikasi API |
| Guru | Paket Ujian | 🔴 Belum ada halaman |
| Guru | Jadwal Ujian | 🔴 Belum ada halaman |
| Guru | Hasil Ujian | 🔴 Belum ada halaman |
| Guru | Komunikasi (4 sub-menu) | 🔴 Belum ada halaman |
| Guru | Laporan (3 sub-menu) | 🔴 Belum ada halaman |
| Guru | Pengaturan Guru | 🔴 Belum ada halaman |

### Roadmap

Lihat [TODO_FITUR_LENGKAP.md](./TODO_FITUR_LENGKAP.md) untuk rencana lengkap 71 task yang dibagi dalam 6 sprint:

- **Sprint 1 (1-2 minggu):** Quick fix, nonaktifkan menu 404, halaman pengaturan guru
- **Sprint 2 (1-2 minggu):** Admin nilai & rapor, pengaturan akademik (KKM, bobot)
- **Sprint 3 (2-3 minggu):** CBT minimal (paket ujian, jadwal, hasil)
- **Sprint 4 (1-2 minggu):** Laporan guru
- **Sprint 5 (2-3 minggu):** Modul komunikasi
- **Sprint 6:** Polish, shared components, import nilai Excel

---

## Lisensi

Proyek ini open-source di bawah lisensi **MIT**. Lihat file [LICENSE](./LICENSE) untuk detail.

---

## Kontak & Dukungan

- **Issues:** Buka issue di repository GitHub
- **Diskusi:** Gunakan tab Discussions di GitHub
- **Email:** Hubungi pemilik proyek melalui profil GitHub

---

<div align="center">

**Dibuat dengan ❤️ untuk kemajuan pendidikan Indonesia**

*Last Updated: Mei 2026*

</div>
