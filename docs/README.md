# Dokumentasi Sekolix

Folder ini menjadi pusat dokumentasi proyek Sekolix. File Markdown yang sebelumnya berada di root proyek sudah dipindahkan ke sini agar dokumentasi lebih mudah dirawat.

## Peta Dokumen

| File | Isi |
|------|-----|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Ringkasan proyek, stack, fitur, arsitektur, instalasi, dan roadmap umum |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Snapshot status implementasi berdasarkan cek cepat file/route |
| [ROADMAP_MODUL_TAMBAHAN.md](./ROADMAP_MODUL_TAMBAHAN.md) | Rencana penerapan 10 modul tambahan untuk sistem informasi sekolah umum |
| [TODO_MODUL_TAMBAHAN.md](./TODO_MODUL_TAMBAHAN.md) | Checklist monitoring task per modul tambahan |
| [ANALISIS_MIGRASI_MODUL_TAMBAHAN.md](./ANALISIS_MIGRASI_MODUL_TAMBAHAN.md) | Analisis tabel migrasi, dependensi schema, dan tools pendukung modul tambahan |
| [GOVERNANCE_FOUNDATION.md](./GOVERNANCE_FOUNDATION.md) | Standar role operasional, permission, audit log, audit trail, dan approval workflow |
| [AUDIT_BEST_PRACTICES.md](./AUDIT_BEST_PRACTICES.md) | Audit best practice kode, security guard, lint, validasi, logging, dan hardening lintas-modul |
| [API_ROUTE_GUARD_CLASSIFICATION.md](./API_ROUTE_GUARD_CLASSIFICATION.md) | Klasifikasi route API tanpa guard langsung dan target permission hardening |
| [MUTATION_LOGGING_INVENTORY.md](./MUTATION_LOGGING_INVENTORY.md) | Inventaris route mutasi API, kategori logging, dan TODO activity log/audit trail lanjutan |
| [PROTOTYPE_RESIDUE_INVENTORY.md](./PROTOTYPE_RESIDUE_INVENTORY.md) | Inventaris mock/TODO/prototype residue dan keputusan produksi |
| [ANALISIS_FITUR.md](./ANALISIS_FITUR.md) | Analisis fitur historis dari menu admin dan guru |
| [TODO_FITUR_LENGKAP.md](./TODO_FITUR_LENGKAP.md) | Roadmap task detail menuju fitur lengkap |
| [AKADEMIK.md](./AKADEMIK.md) | Spesifikasi modul akademik, laporan, e-learning, dan CBT |
| [GURU.md](./GURU.md) | Spesifikasi portal guru dan progress implementasi |
| [SISWA.md](./SISWA.md) | Spesifikasi portal siswa, tugas, CBT/CAT, nilai, dan rapor |
| [LANDING.md](./LANDING.md) | Spesifikasi landing page dan CMS website sekolah |
| [GUIDE_DEV.md](./GUIDE_DEV.md) | Panduan developer: breadcrumb, DataTable, dan form pattern |

## Status Singkat

Status di bawah ini hanya berdasarkan keberadaan file route/page utama, bukan audit fungsional mendalam.

| Area | Status Ringkas |
|------|----------------|
| Landing publik dan CMS sekolah | Route utama tersedia |
| SPMB | Route utama tersedia |
| Admin akademik, nilai, rapor, dan laporan | Route utama tersedia |
| Portal guru, CBT, komunikasi, laporan, dan pengaturan | Route utama tersedia |
| Portal siswa, materi, tugas, CBT, nilai, rapor | Route utama tersedia |
| Audit/keamanan/tata kelola lanjutan | Fondasi Sprint 0 tersedia |
| Quality/security hardening lintas-modul | QAH selesai; quality gate lokal/CI tersedia |
| Portal orang tua/wali | Sprint 1 tersedia |
| Keuangan/SPP | Sprint 2 tersedia |
| BK/kedisiplinan/prestasi | Sprint 3 tersedia |
| Perpustakaan | Sprint 4 tersedia |
| Inventaris/Sarpras | Sprint 5 tersedia |
| Manajemen pegawai lanjutan | Sprint 6 tersedia |
| Surat menyurat/TU | Sprint 7 tersedia |
| Ekstrakurikuler/kegiatan | Sprint 8 tersedia |
| Integrasi data pendidikan | Sprint 9 tersedia |

Lihat [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) untuk detail cek route/file.

## Konvensi Dokumentasi

- Gunakan Bahasa Indonesia untuk dokumentasi produk dan roadmap.
- Gunakan English atau mixed untuk dokumentasi teknis internal jika mengikuti konteks kode.
- Saat menambahkan fitur besar, update dokumen domain terkait dan [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md).
- Simpan dokumentasi proyek di folder `docs/`; dokumentasi khusus seed tetap boleh berada dekat kodenya, seperti `prisma/SEEDING_GUIDE.md`.
