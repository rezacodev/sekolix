# Klasifikasi Guard API Route

Dokumen ini adalah output QAH-01 untuk 46 kandidat route yang pada audit awal belum memiliki guard langsung di route handler. Klasifikasi ini dipakai sebagai daftar kerja hardening akses API.

## Status Klasifikasi

| Kategori | Jumlah | Aksi |
|----------|--------|------|
| Public route | 5 | Tetap publik, perlu validasi dan rate-limit bila menerima data |
| Authenticated shared route | 1 | Wajib session dan permission read |
| Admin akademik | 28 | Wajib permission akademik sesuai subject |
| Admin SPMB/settings | 7 | Wajib permission penerimaan siswa atau pengaturan |
| Admin CMS/landing | 3 | Wajib permission landing website |
| Teacher route | 2 | Wajib permission teacher portal/scope materi |

Catatan: `app/api/auth/[...nextauth]/route.ts` diklasifikasikan sebagai public framework route, bukan target hardening aplikasi.

## Public Route

Route publik harus diberi komentar eksplisit di kode saat disentuh, dan tetap wajib validasi input.

| Route | Alasan |
|-------|--------|
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handler |
| `app/api/penerimaan-siswa/spmb/applicant/route.ts` | Pendaftaran/status SPMB publik |
| `app/api/penerimaan-siswa/spmb/complete-profile/route.ts` | Pelengkapan profil calon siswa |
| `app/api/penerimaan-siswa/spmb/register/route.ts` | Registrasi SPMB publik |
| `app/api/penerimaan-siswa/spmb/status/route.ts` | Cek status pendaftar publik |

## Authenticated Shared Route

| Route | Permission Target | Status QAH 01-05 |
|-------|-------------------|------------------|
| `app/api/subjects/[id]/route.ts` | `akademik.mata-pelajaran:read` | Guard ditambahkan |

## Admin Akademik

| Route | Permission Target | Status QAH 01-05 |
|-------|-------------------|------------------|
| `app/api/admin/manajemen-akademik/class-schedules/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/class-schedules/[id]/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/classes/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/classes/[id]/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/kegiatan-akademik/route.ts` | `akademik.tahun-ajaran` | Belum |
| `app/api/admin/manajemen-akademik/kurikulum-mapel/curriculums/route.ts` | `akademik.mata-pelajaran` | Belum |
| `app/api/admin/manajemen-akademik/kurikulum-mapel/curriculums/[id]/route.ts` | `akademik.mata-pelajaran` | Belum |
| `app/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran/route.ts` | `akademik.mata-pelajaran` | Belum |
| `app/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran/[id]/route.ts` | `akademik.mata-pelajaran` | Belum |
| `app/api/admin/manajemen-akademik/programs/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/transfer/batches/route.ts` | `akademik.rombel` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/rombel/transfer/execute/route.ts` | `akademik.rombel` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/rombel/transfer/suggestions/route.ts` | `akademik.rombel` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/rombel/[id]/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/[id]/generate-status/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/[id]/generate-subjects/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/[id]/previous-year-rombels/route.ts` | `akademik.rombel` | Belum |
| `app/api/admin/manajemen-akademik/rombel/[id]/transfer-students/route.ts` | `akademik.rombel` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/rooms/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times/[id]/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms/[id]/route.ts` | `akademik.jadwal` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/tahun-ajaran/route.ts` | `akademik.tahun-ajaran` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/tahun-ajaran/[id]/route.ts` | `akademik.tahun-ajaran` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/teacher-subjects/route.ts` | `akademik.mata-pelajaran` | Guard ditambahkan |
| `app/api/admin/manajemen-akademik/teacher-subjects/[id]/route.ts` | `akademik.mata-pelajaran` | Guard ditambahkan |

## Admin SPMB dan Pengaturan

| Route | Permission Target | Status QAH 01-05 |
|-------|-------------------|------------------|
| `app/api/admin/penerimaan-siswa/export/route.ts` | `penerimaan-siswa:export` | Guard ditambahkan |
| `app/api/admin/penerimaan-siswa/export/biodata/route.ts` | `penerimaan-siswa:export` | Guard ditambahkan |
| `app/api/admin/penerimaan-siswa/settings/landing/route.ts` | `penerimaan-siswa:manage` | Belum |
| `app/api/admin/penerimaan-siswa/settings/programs/route.ts` | `penerimaan-siswa:manage` | Belum |
| `app/api/admin/penerimaan-siswa/settings/registration-code/route.ts` | `penerimaan-siswa:manage` | Belum |
| `app/api/admin/penerimaan-siswa/settings/years/route.ts` | `penerimaan-siswa:manage` | Belum |
| `app/api/admin/pengaturan/identitas-sekolah/route.ts` | `pengaturan.identitas:manage` | Belum |

## Admin CMS/Landing

| Route | Permission Target | Status QAH 01-05 |
|-------|-------------------|------------------|
| `app/api/admin/landing-website/landing-sections/route.ts` | `landing-website:manage` | Belum |
| `app/api/admin/landing-website/pages/route.ts` | `landing-website:manage` | Belum |
| `app/api/admin/landing-website/theme/active/route.ts` | `landing-website:read` atau public read terkontrol | Belum |

## Teacher Route

| Route | Permission Target | Status QAH 01-05 |
|-------|-------------------|------------------|
| `app/api/teacher/pembelajaran/materials/[id]/download/route.ts` | `teacher.portal:read` | Guard ditambahkan |
| `app/api/teacher/pembelajaran/materials/[id]/view/route.ts` | `teacher.portal:read` | Guard ditambahkan |

## Lanjutan Setelah QAH 01-05

- Route bertanda `Belum` masuk backlog QAH-06 sampai QAH-11.
- Setelah semua guard ditambahkan, jalankan ulang audit pola route tanpa guard.
- Route publik perlu validasi input, rate-limit, dan logging event sesuai risiko.
