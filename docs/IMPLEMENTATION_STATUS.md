# Status Implementasi

Dokumen ini adalah snapshot ringan berdasarkan keberadaan nama file, page, atau API route. Ini bukan hasil pengujian end-to-end dan tidak menjamin seluruh fungsi bebas bug.

**Terakhir dicek:** 30 Juni 2026

## Quality & Security Hardening

Sprint 0.5 QAH sudah diterapkan untuk baseline produksi:

- lint quiet, typecheck, Prisma validate, dan test QAH berjalan lewat `npm run qah:check`;
- route prioritas memakai validasi Zod, scope guru, activity log, dan audit trail untuk data sensitif utama;
- permission matrix mengunci subject/action ke allowlist;
- mock data portal siswa untuk materi/kelas/tugas/notifikasi diganti API nyata atau empty state;
- pengerjaan CBT siswa tidak lagi menampilkan soal contoh sampai API sesi aktif tersedia.

## Area Utama

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Landing publik | `app/(public)/page.tsx` | Ada |
| CMS Landing Admin | `app/admin/landing-website/page.tsx` | Ada |
| SPMB Admin | `app/admin/penerimaan-siswa/page.tsx` | Ada |
| Akademik Admin | `app/admin/manajemen-akademik/page.tsx` | Ada |
| Nilai & Rapor Admin | `app/admin/manajemen-akademik/nilai-rapor/page.tsx` | Ada |
| Laporan Akademik Admin | `app/admin/manajemen-akademik/laporan/page.tsx` | Ada |
| Pengaturan Sistem Admin | `app/admin/pengaturan/page.tsx` | Ada |
| Permission Matrix | `app/admin/pengaturan/permissions/page.tsx` | Ada |
| Audit Log | `app/admin/pengaturan/audit-log/page.tsx` | Ada |
| Approval Workflow | `app/admin/pengaturan/approval/page.tsx` | Ada |
| Portal Guru | `app/teacher/page.tsx` | Ada |
| Portal Siswa | `app/student/page.tsx` | Ada |
| Portal Orang Tua/Wali | `app/parent/page.tsx` | Ada |
| Keuangan/SPP | `app/admin/keuangan/page.tsx` | Ada |
| BK/Kedisiplinan/Prestasi | `app/admin/bk/page.tsx` | Ada |
| Perpustakaan | `app/admin/perpustakaan/page.tsx` | Ada |

## Portal Guru

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Paket Ujian | `app/teacher/ujian/paket/page.tsx` | Ada |
| Jadwal Ujian | `app/teacher/ujian/jadwal/page.tsx` | Ada |
| Hasil Ujian | `app/teacher/ujian/hasil/page.tsx` | Ada |
| Forum Diskusi | `app/teacher/komunikasi/forum/page.tsx` | Ada |
| Pesan | `app/teacher/komunikasi/pesan/page.tsx` | Ada |
| Komunikasi Orang Tua | `app/teacher/komunikasi/orang-tua/page.tsx` | Ada |
| Kolaborasi Guru | `app/teacher/komunikasi/kolaborasi/page.tsx` | Ada |
| Laporan Mengajar | `app/teacher/laporan/mengajar/page.tsx` | Ada |
| Laporan Nilai | `app/teacher/laporan/nilai/page.tsx` | Ada |
| Analisis Pembelajaran | `app/teacher/laporan/analisis/page.tsx` | Ada |
| Pengaturan Guru | `app/teacher/pengaturan/page.tsx` | Ada |

## Portal Siswa

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Dashboard Siswa | `app/student/page.tsx` | Ada |
| Kelas Siswa | `app/student/kelas/page.tsx` | Ada |
| Materi | `app/student/kelas/[id]/materi/page.tsx` | Ada, membaca API nyata |
| Tugas | `app/student/kelas/[id]/tugas/page.tsx` | Ada, API tugas siswa membaca database |
| Forum | `app/student/kelas/[id]/forum/page.tsx` | Ada |
| CBT Konfirmasi | `app/student/ujian/[sessionId]/konfirmasi/page.tsx` | Ada |
| CBT Pengerjaan | `app/student/ujian/[sessionId]/kerjakan/page.tsx` | Route ada, runtime mock dinonaktifkan sampai API sesi siswa tersedia |
| CBT Hasil | `app/student/ujian/[sessionId]/hasil/page.tsx` | Ada |
| CBT Review | `app/student/ujian/[sessionId]/review/page.tsx` | Ada |
| Nilai | `app/student/nilai/page.tsx` | Ada |
| Rapor | `app/student/rapor/page.tsx` | Ada |
| Jadwal | `app/student/jadwal/page.tsx` | Ada |
| Kalender | `app/student/kalender/page.tsx` | Ada |
| Pengumuman | `app/student/pengumuman/page.tsx` | Ada |
| Perpustakaan | `app/student/perpustakaan/page.tsx` | Ada, katalog + riwayat pinjam |
| Profil | `app/student/profil/page.tsx` | Ada |

## Portal Orang Tua/Wali

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Layout portal parent | `app/parent/layout.tsx` | Ada |
| Dashboard parent | `app/parent/page.tsx` | Ada |
| Detail anak | `app/parent/anak/[studentId]/page.tsx` | Ada, scoped ke relasi wali-anak |
| Nilai & rapor anak | `app/parent/anak/[studentId]/nilai/page.tsx` | Ada, read-only |
| Absensi anak | `app/parent/anak/[studentId]/absensi/page.tsx` | Ada, read-only + histori izin |
| Pengajuan izin | `app/parent/izin/page.tsx`, `app/api/parent/attendance/route.ts` | Ada |
| Konsultasi guru | `app/parent/pesan/page.tsx`, `app/api/parent/messages/route.ts` | Ada |
| Pengumuman/notifikasi | `app/parent/pengumuman/page.tsx`, `app/api/parent/notifications/route.ts` | Ada |
| API parent scope | `app/api/parent/*` | Ada, validasi akses per anak |
| Seed demo | `prisma/seeds/parent/parent.seed.ts` | Ada untuk scenario demo/full |

## Keuangan/SPP

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema finance | `financial_billing_types`, `student_invoices`, `student_payments`, `student_invoice_discounts`, `student_invoice_late_fees`, `parent_payment_proofs` | Ada |
| Dashboard keuangan | `app/admin/keuangan/page.tsx` | Ada |
| Master & generate tagihan | `app/admin/keuangan/tagihan/page.tsx`, `app/api/admin/keuangan/invoices/route.ts` | Ada |
| Pembayaran manual | `app/admin/keuangan/pembayaran/page.tsx`, `app/api/admin/keuangan/payments/route.ts` | Ada |
| Validasi bukti bayar wali | `app/api/admin/keuangan/payment-proofs/[id]/route.ts` | Ada |
| Kwitansi PDF | `app/api/admin/keuangan/payments/[id]/receipt/route.ts` | Ada |
| Laporan pembayaran & tunggakan | `app/admin/keuangan/laporan/page.tsx`, `app/api/admin/keuangan/reports/route.ts` | Ada |
| Portal orang tua tagihan | `app/parent/tagihan/page.tsx`, `app/api/parent/billing/route.ts` | Ada |
| Payment gateway adapter | `src/lib/finance/payment-gateway.ts` | Stub manual untuk fase integrasi |
| Seed demo | `prisma/seeds/finance/finance.seed.ts` | Ada untuk scenario demo/full |

## BK, Kedisiplinan, Prestasi

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema BK | `student_counseling_cases`, `counseling_sessions`, `discipline_rules`, `discipline_records`, `student_achievements`, `student_development_notes`, `counseling_referrals`, `parent_summon_letters` | Ada |
| Dashboard BK | `app/admin/bk/page.tsx` | Ada |
| Kasus dan sesi konseling | `app/admin/bk/kasus/page.tsx`, `app/api/admin/bk/cases/route.ts`, `app/api/admin/bk/sessions/route.ts` | Ada |
| Kedisiplinan dan poin | `app/admin/bk/kedisiplinan/page.tsx`, `app/api/admin/bk/discipline-*` | Ada |
| Prestasi siswa | `app/admin/bk/prestasi/page.tsx`, `app/api/admin/bk/achievements/route.ts` | Ada |
| Rujukan BK | `app/admin/bk/rujukan/page.tsx`, `app/api/admin/bk/referrals/route.ts` | Ada |
| Surat panggilan orang tua | `app/api/admin/bk/summon-letters/route.ts`, `app/api/admin/bk/summon-letters/[id]/pdf/route.ts` | Ada |
| Laporan perkembangan | `app/admin/bk/laporan/page.tsx`, `app/api/admin/bk/reports/route.ts` | Ada |
| Portal orang tua perkembangan | `app/parent/perkembangan/page.tsx` | Ada, hanya membaca data `parent_visible` |
| Seed demo | `prisma/seeds/bk/bk.seed.ts` | Ada untuk scenario demo/full |

## Perpustakaan

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema perpustakaan | `library_categories`, `library_books`, `library_copies`, `library_members`, `library_loans`, `library_fines` | Ada |
| Dashboard perpustakaan | `app/admin/perpustakaan/page.tsx` | Ada |
| Katalog dan kategori | `app/admin/perpustakaan/katalog/page.tsx`, `app/api/admin/perpustakaan/books/route.ts`, `categories/route.ts` | Ada |
| Eksemplar barcode/QR | `app/admin/perpustakaan/eksemplar/page.tsx`, `app/api/admin/perpustakaan/copies/route.ts` | Ada |
| Anggota siswa/GTK | `app/admin/perpustakaan/anggota/page.tsx`, `app/api/admin/perpustakaan/members/route.ts` | Ada, sync dari data siswa dan GTK |
| Sirkulasi pinjam-kembali | `app/admin/perpustakaan/sirkulasi/page.tsx`, `app/api/admin/perpustakaan/loans/route.ts`, `loans/[id]/return/route.ts` | Ada |
| Denda keterlambatan | `LibraryFine`, return loan API | Ada, dihitung otomatis saat pengembalian |
| Laporan populer/terlambat | `app/admin/perpustakaan/laporan/page.tsx`, `app/api/admin/perpustakaan/reports/route.ts` | Ada |
| Import katalog Excel | `app/api/admin/perpustakaan/books/import/route.ts` | Ada |
| Portal siswa perpustakaan | `app/student/perpustakaan/page.tsx` | Ada |
| Seed demo | `prisma/seeds/library/library.seed.ts` | Ada untuk scenario demo/full |

## Modul Inventaris/Sarpras

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema inventaris | `asset_categories`, `asset_locations`, `assets`, `asset_location_histories`, `asset_condition_histories`, `asset_loans`, `asset_maintenances` | Ada |
| Dashboard inventaris | `app/admin/inventaris/page.tsx` | Ada |
| CRUD aset dan kategori | `app/admin/inventaris/aset/page.tsx`, `app/api/admin/inventaris/assets/route.ts`, `categories/route.ts` | Ada |
| Lokasi terhubung ruang | `app/admin/inventaris/lokasi/page.tsx`, `app/api/admin/inventaris/locations/route.ts` | Ada |
| Kondisi dan riwayat | `app/admin/inventaris/kondisi/page.tsx`, `app/api/admin/inventaris/assets/[id]/condition/route.ts` | Ada |
| Mutasi aset | `app/admin/inventaris/mutasi/page.tsx`, `app/api/admin/inventaris/assets/[id]/move/route.ts` | Ada, dengan activity log dan audit trail |
| Peminjaman barang/ruang | `app/admin/inventaris/peminjaman/page.tsx`, `app/api/admin/inventaris/loans/route.ts`, `loans/[id]/return/route.ts` | Ada |
| Pemeliharaan aset | `app/admin/inventaris/pemeliharaan/page.tsx`, `app/api/admin/inventaris/maintenances/route.ts`, `maintenances/[id]/complete/route.ts` | Ada |
| Label QR aset | `app/admin/inventaris/label/page.tsx` | Ada, berupa payload label per aset |
| Laporan aset bermasalah | `app/admin/inventaris/laporan/page.tsx`, `app/api/admin/inventaris/reports/route.ts` | Ada |
| Seed demo | `prisma/seeds/inventory/inventory.seed.ts` | Ada untuk scenario demo/full |

## Modul Manajemen Pegawai

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema operasional pegawai | `staff_attendances`, `staff_leave_requests`, `staff_duty_schedules`, `staff_documents`, `staff_contracts`, `staff_assignment_letters` | Ada |
| Dashboard pegawai | `app/admin/pegawai/page.tsx` | Ada |
| Absensi manual/import | `app/admin/pegawai/absensi/page.tsx`, `app/api/admin/pegawai/attendances/route.ts` | Ada, import JSON bulk |
| Cuti/izin dan approval | `app/admin/pegawai/cuti/page.tsx`, `app/api/admin/pegawai/leave-requests/route.ts`, `leave-requests/[id]/review/route.ts` | Ada, membuat approval request dan review status |
| Jadwal piket | `app/admin/pegawai/piket/page.tsx`, `app/api/admin/pegawai/duty-schedules/route.ts` | Ada |
| Dokumen kepegawaian | `app/admin/pegawai/dokumen/page.tsx`, `app/api/admin/pegawai/documents/route.ts` | Ada, memakai URL file/upload sementara |
| Kontrak/sertifikasi | `app/admin/pegawai/kontrak/page.tsx`, `app/api/admin/pegawai/contracts/route.ts` | Ada, dengan reminder masa berlaku |
| SK/surat tugas | `app/admin/pegawai/surat-tugas/page.tsx`, `app/api/admin/pegawai/assignment-letters/route.ts` | Ada, siap menjadi jembatan modul TU |
| Laporan SDM | `app/admin/pegawai/laporan/page.tsx`, `app/api/admin/pegawai/reports/route.ts` | Ada |
| Seed demo | `prisma/seeds/staff-ops/staff-ops.seed.ts` | Ada untuk scenario demo/full |

## Modul Surat Menyurat & Administrasi TU

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema surat/TU | `letter_templates`, `incoming_letters`, `outgoing_letters`, `letter_dispositions`, `generated_letters`, `letter_approvals`, `archive_records`, `tu_number_sequences` | Ada |
| Dashboard TU | `app/admin/tata-usaha/page.tsx` | Ada |
| Surat masuk | `app/admin/tata-usaha/surat-masuk/page.tsx`, `app/api/admin/tata-usaha/incoming-letters/route.ts` | Ada, nomor agenda otomatis |
| Surat keluar | `app/admin/tata-usaha/surat-keluar/page.tsx`, `app/api/admin/tata-usaha/outgoing-letters/route.ts` | Ada, nomor surat/agenda otomatis |
| Template surat | `app/admin/tata-usaha/template/page.tsx`, `app/api/admin/tata-usaha/templates/route.ts` | Ada untuk siswa, pegawai, umum |
| Generate surat PDF | `app/admin/tata-usaha/generate/page.tsx`, `app/api/admin/tata-usaha/generated-letters/route.ts`, `generated-letters/[id]/pdf/route.ts` | Ada |
| Disposisi dan approval | `app/admin/tata-usaha/disposisi/page.tsx`, `app/api/admin/tata-usaha/dispositions/route.ts`, `outgoing-letters/[id]/approve/route.ts` | Ada |
| Arsip digital | `app/admin/tata-usaha/arsip/page.tsx`, `app/api/admin/tata-usaha/archives/route.ts` | Ada, dengan pencarian API |
| QR validasi | `qr_code`, `validation_code`, `app/api/verify/letters/[code]/route.ts` | Ada sebagai payload validasi |
| Seed demo | `prisma/seeds/office/office.seed.ts` | Ada untuk scenario demo/full |

## Modul Ekstrakurikuler & Kegiatan

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema ekstrakurikuler | `extracurriculars`, `extracurricular_coaches`, `extracurricular_members`, `extracurricular_schedules`, `extracurricular_attendances`, `extracurricular_achievements`, `extracurricular_registrations` | Ada |
| Dashboard ekskul | `app/admin/ekstrakurikuler/page.tsx` | Ada |
| CRUD master ekskul | `app/admin/ekstrakurikuler/master/page.tsx`, `app/api/admin/ekstrakurikuler/clubs/route.ts` | Ada |
| Pembina dan anggota | `app/admin/ekstrakurikuler/anggota/page.tsx`, `coaches/route.ts`, `members/route.ts` | Ada |
| Jadwal latihan/kegiatan | `app/admin/ekstrakurikuler/kegiatan/page.tsx`, `schedules/route.ts` | Ada |
| Presensi ekskul | `app/admin/ekstrakurikuler/presensi/page.tsx`, `attendances/route.ts` | Ada |
| Prestasi/portofolio | `app/admin/ekstrakurikuler/prestasi/page.tsx`, `achievements/route.ts` | Ada |
| Pendaftaran portal siswa | `app/student/ekstrakurikuler/page.tsx`, `app/api/student/ekstrakurikuler/register/route.ts` | Ada |
| Publikasi landing page | `app/api/admin/ekstrakurikuler/schedules/[id]/publish/route.ts` | Ada, membuat `Event` landing |
| Seed demo | `prisma/seeds/extracurricular/extracurricular.seed.ts` | Ada untuk scenario demo/full |

## Modul Integrasi Data Pendidikan Indonesia

| Area | Indikator yang Dicek | Status |
|------|----------------------|--------|
| Schema integrasi | `data_integration_profiles`, `data_field_mappings`, `import_batches`, `import_batch_rows`, `export_batches`, `data_validation_rules`, `data_validation_issues` | Ada |
| Dashboard integrasi | `app/admin/integrasi-data/page.tsx` | Ada |
| Profil dan mapping | `app/admin/integrasi-data/profil/page.tsx`, `app/api/admin/integrasi-data/profiles/route.ts`, `mappings/route.ts` | Ada |
| Template import Excel | `app/api/admin/integrasi-data/templates/route.ts` | Ada untuk siswa, GTK, rombel, mapel, nilai |
| Import preview | `app/admin/integrasi-data/import/page.tsx`, `app/api/admin/integrasi-data/imports/preview/route.ts` | Ada, menyimpan snapshot batch |
| Commit dan rollback | `imports/[id]/commit/route.ts`, `imports/[id]/rollback/route.ts` | Ada untuk entitas siswa |
| Export data | `app/admin/integrasi-data/export/page.tsx`, `app/api/admin/integrasi-data/exports/route.ts` | Ada untuk siswa, GTK, rombel, mapel, nilai |
| Validasi data | `app/admin/integrasi-data/validasi/page.tsx`, `validations/run/route.ts`, `validations/route.ts`, `reports/route.ts` | Ada, cek NISN, NIK, rombel, mapel, orang tua, duplikat |
| Audit import/export | `ActivityLog`, `AuditTrail` pada route import/export/validasi | Ada |
| Seed demo | `prisma/seeds/integration/integration.seed.ts` | Ada untuk scenario demo/full |

## Modul Tambahan yang Belum Terlihat

Area ini direkomendasikan untuk fase berikutnya karena belum terlihat route utama dari cek ringan.

| Area | Route yang Dicek | Status |
|------|------------------|--------|
| Audit/Keamanan/Tata Kelola Lanjutan | `app/admin/pengaturan/audit-log/page.tsx`, `app/admin/pengaturan/approval/page.tsx` | Ada fondasi Sprint 0 |

Rencana implementasi modul-modul ini tersedia di [ROADMAP_MODUL_TAMBAHAN.md](./ROADMAP_MODUL_TAMBAHAN.md), dengan checklist monitoring di [TODO_MODUL_TAMBAHAN.md](./TODO_MODUL_TAMBAHAN.md).

## Catatan

- Status `Ada` berarti route/page utama ditemukan.
- Status `Route ada` berarti layar tersedia tetapi masih membutuhkan API domain nyata sebelum dianggap siap produksi.
- Untuk menilai fitur benar-benar siap produksi, tetap perlu cek API, schema, alur data, validasi role, seed data, dan pengujian manual.
- Dokumen historis seperti [ANALISIS_FITUR.md](./ANALISIS_FITUR.md) dan [TODO_FITUR_LENGKAP.md](./TODO_FITUR_LENGKAP.md) mungkin berisi status lama. Gunakan file ini sebagai snapshot orientasi cepat.
