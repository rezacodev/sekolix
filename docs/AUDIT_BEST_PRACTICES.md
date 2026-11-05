# Audit Best Practice Kode Sekolix

Dokumen ini merangkum audit statis best practice untuk proyek Sekolix per 27 Juni 2026. Audit ini membaca pola kode, route, lint, auth guard, validasi input, logging, dan jejak data tiruan. Ini bukan penetration test, bukan audit end-to-end, dan bukan jaminan seluruh fitur bebas bug.

## Scope Audit

Area yang dicek:

- Next.js App Router: page, layout, dan route handler.
- API route untuk admin, teacher, student, shared, dan SPMB publik.
- Auth guard dan role/permission check.
- Validasi input request body, query, dan dynamic params.
- Activity log dan audit trail untuk mutasi data.
- React client component, effect, data fetching, dan lint.
- Type safety: `any`, `as any`, `ts-ignore`, dan eslint-disable.
- Sinyal prototype: mock data, TODO, dummy data, random/time based ID.

Ringkasan inventaris:

| Item | Jumlah |
|------|--------|
| File yang dipindai di `app`, `src`, `prisma`, `docs` | 752 |
| API route `app/api/**/route.ts` | 180 |
| Page `app/**/page.tsx` | 211 |
| Client component dengan `"use client"` | 306 |
| Kandidat API route tanpa guard langsung di route handler | 46 |
| Kandidat API route mutasi tanpa logging eksplisit | 114 |
| Indikasi `any`, `as any`, `ts-ignore`, atau eslint-disable | 153 |
| Indikasi mock/TODO/prototype residue | 41 |
| Penggunaan `Date.now()` atau `Math.random()` di kode app/src | 12 |
| Error `npm.cmd run lint -- --quiet` | 20 |

## Executive Summary

Fondasi proyek sudah cukup kuat untuk dikembangkan: stack modern, Prisma, Zod tersedia, NextAuth, CASL, helper governance Sprint 0, route laporan dengan helper bersama, dan UI component system sudah mulai konsisten.

Risiko terbesar saat ini bukan kurang fitur, tetapi inkonsistensi penerapan standar:

- banyak API lama belum memakai guard langsung di route handler;
- mutasi data sensitif belum konsisten masuk activity log/audit trail;
- validasi input belum seragam;
- beberapa fitur UI masih memakai mock data;
- lint React 19/Next 16 belum bersih;
- masih ada `any`/eslint-disable di area penting seperti CBT, nilai, import, dan integrasi.

Rekomendasi utama: lakukan hardening lintas-modul sebagai Sprint 0.5 sebelum masuk sprint fitur besar berikutnya.

Klasifikasi route tanpa guard langsung dicatat terpisah di [API_ROUTE_GUARD_CLASSIFICATION.md](./API_ROUTE_GUARD_CLASSIFICATION.md). Inventaris route mutasi dan rencana logging dicatat di [MUTATION_LOGGING_INVENTORY.md](./MUTATION_LOGGING_INVENTORY.md).

## Temuan Prioritas

### P0 - Auth Guard Tidak Konsisten di API Route

Heuristik menemukan 46 API route tanpa pola guard langsung seperti `getServerSession`, `requirePermission`, `requireReportAccess`, `requireAdmin`, atau `authOptions`.

Catatan: beberapa route memang pantas publik, misalnya SPMB publik dan auth. Tetapi route di bawah `/api/admin/**` dan beberapa `/api/teacher/**` sebaiknya tetap punya guard eksplisit di route handler, bukan hanya mengandalkan middleware.

Distribusi kandidat:

| Area | Jumlah |
|------|--------|
| Admin akademik | 28 |
| Admin landing/CMS | 3 |
| Admin SPMB/settings | 6 |
| Public SPMB | 4 |
| Teacher | 2 |
| Lainnya termasuk auth/shared | 3 |

Contoh high-risk:

- `app/api/admin/manajemen-akademik/rombel/transfer/execute/route.ts`
- `app/api/admin/manajemen-akademik/rombel/transfer/suggestions/route.ts`
- `app/api/admin/manajemen-akademik/rombel/[id]/transfer-students/route.ts`
- `app/api/admin/manajemen-akademik/teacher-subjects/route.ts`
- `app/api/admin/manajemen-akademik/tahun-ajaran/route.ts`
- `app/api/admin/penerimaan-siswa/export/route.ts`

Risiko:

- user login dengan role yang terlalu luas dapat memanggil endpoint sensitif;
- perubahan siswa/rombel/mapel/tahun ajaran bisa terjadi tanpa role yang sesuai;
- export data sensitif bisa terbuka untuk role yang tidak tepat.

Standar target:

- route mutasi admin memakai `requirePermission(action, subject)`;
- route read sensitif memakai permission read/export;
- route public diberi komentar eksplisit `// Public route` dan validasi rate-limit/captcha jika perlu;
- middleware tetap dipakai sebagai pagar kasar, bukan satu-satunya kontrol akses.

### P0 - Middleware Admin Terlalu Luas

`proxy.ts` mengizinkan `SUPERADMIN`, `ADMIN`, dan `STAFF` masuk semua `/admin`. Jika `STAFF` berarti pegawai umum, akses ini terlalu lebar untuk data akademik, siswa, nilai, laporan, dan pengaturan.

Standar target:

- `/admin` hanya untuk role dasar yang memang punya hak panel admin;
- sub-route sensitif memakai permission granular;
- role operasional seperti TU, BK, BENDAHARA, PUSTAKAWAN, SARPRAS diberi akses modul spesifik, bukan akses admin global tanpa filter.

### P0 - Mutasi Data Belum Konsisten Masuk Activity Log dan Audit Trail

Heuristik awal menemukan 114 route mutasi tanpa logging eksplisit. Setelah patch QAH-10 awal, inventaris terbaru mencatat 109 kandidat tersisa di [MUTATION_LOGGING_INVENTORY.md](./MUTATION_LOGGING_INVENTORY.md).

Distribusi kandidat:

| Area | Jumlah |
|------|--------|
| Admin akademik | 35 |
| Admin landing/CMS | 21 |
| Admin SPMB/settings | 6 |
| Teacher | 36 |
| Student | 4 |
| Public SPMB | 3 |
| Lainnya | 9 |

Tidak semua mutasi harus masuk audit trail penuh, tetapi operasi berikut wajib:

- siswa, wali, identitas keluarga;
- nilai, rapor, CBT, koreksi essay;
- pembayaran, tagihan, validasi SPMB;
- data pegawai;
- BK/kedisiplinan;
- import/export;
- permission, approval, backup/restore.

Standar target:

- `logActivity()` untuk create/update/delete/export/import/login/action penting;
- `writeAuditTrail()` untuk before/after data sensitif;
- alasan perubahan untuk aksi sensitif;
- actor, module, entity type, entity id, IP, user agent tersimpan.

### P1 - Validasi Input Belum Seragam

Sebagian route sudah memakai Zod, tetapi masih banyak route memakai parsing langsung seperti `BigInt(...)`, `parseInt(...)`, `parseFloat(...)`, dan `Number(...)` dari query/body.

Risiko:

- input invalid berubah menjadi `500`;
- pagination tidak dibatasi;
- body bebas field liar;
- ID invalid bisa menyebabkan exception;
- format enum atau status tidak konsisten.

Standar target:

- semua route handler punya schema Zod untuk body, query, dan params;
- parsing BigInt lewat helper aman;
- invalid input selalu `400`;
- pagination dibatasi max page size;
- enum action/status/role divalidasi dengan allowlist.

### P1 - Ownership dan Data Scope Belum Merata

Beberapa route sudah bagus karena membatasi data ke `teacher_id` atau `staffId`. Tetapi perlu audit manual untuk endpoint nilai, kelas, tugas, CBT, forum, dan laporan agar setiap data yang dibaca/diubah benar-benar milik user atau scope role tersebut.

Contoh risiko:

- guru punya akses ke assessment tetapi belum tentu ke semua `studentId` yang dikirim;
- export/report bisa membaca rombel/siswa di luar scope;
- shared API perlu membedakan admin, teacher, student, dan parent.

Standar target:

- helper `requireTeacherScope(...)`;
- helper `requireStudentOwnership(...)`;
- helper `requireParentChildAccess(...)`;
- test negatif untuk akses silang data.

### P1 - Lint React/Next Belum Bersih

`npm.cmd run lint -- --quiet` menghasilkan 20 error.

Kategori utama:

- `Date.now()` saat render server component;
- `react-hooks/set-state-in-effect`;
- `react/no-unescaped-entities`;
- `@typescript-eslint/no-explicit-any`;
- variable yang bisa `const`;
- `removeNotification` dipakai sebelum deklarasi.

Contoh file:

- `app/admin/manajemen-akademik/laporan/dashboard-eksekutif/page.tsx`
- `app/admin/manajemen-akademik/nilai-rapor/[rombelId]/rapor/page.tsx`
- `app/student/StudentLayoutClient.tsx`
- `app/student/ujian/[sessionId]/kerjakan/page.tsx`
- `app/teacher/ujian/hasil/[jadwalId]/page.tsx`
- `src/contexts/student/NotificationProvider.tsx`
- `src/lib/notification-service.tsx`
- `prisma/seeds/users/users.seed.ts`

Standar target:

- lint error = 0;
- warnings dimonitor, terutama hooks dan type safety;
- lint menjadi quality gate sebelum merge/build.

### P1 - Prototype Residue Masih Ada di Fitur Yang Terlihat Siap

Audit menemukan 41 indikasi mock/TODO/prototype residue.

Contoh:

- `app/student/ujian/[sessionId]/konfirmasi/page.tsx`
- `app/student/ujian/[sessionId]/kerjakan/page.tsx`
- `app/student/ujian/[sessionId]/hasil/page.tsx`
- `app/student/ujian/[sessionId]/review/page.tsx`
- `app/student/kelas/[id]/materi/page.tsx`
- `app/api/student/notifications/route.ts`
- `app/api/teacher/announcements/route.ts`
- `app/api/teacher/dashboard-summary/route.ts`
- `src/components/student/LivescoreLeaderboard.tsx`
- `src/lib/notification-service.tsx`

Standar target:

- semua mock diberi label WIP di UI atau diganti API nyata;
- fitur yang belum siap tidak terlihat sebagai produksi;
- TODO teknis dipindahkan ke dokumen TODO agar tidak tenggelam di kode.

### P2 - Type Safety Perlu Diperketat

Audit menemukan 153 indikasi `any`, `as any`, `ts-ignore`, atau eslint-disable.

Area dominan:

- CBT/ujian hasil dan koreksi;
- pembelajaran silabus/RPP;
- import nilai;
- notification service;
- webhooks/API keys;
- beberapa editor CMS dan import siswa.

Standar target:

- gunakan tipe Prisma payload atau DTO eksplisit;
- `unknown` + narrowing untuk payload eksternal;
- batasi eslint-disable dengan komentar alasan;
- hapus `ts-ignore` kecuali ada issue library yang terdokumentasi.

### P2 - Data Fetching Client Belum Distandarkan

Banyak client component melakukan fetch manual, state loading/error manual, dan beberapa efek perlu debounce/abort controller.

Standar target:

- pola shared `useApiQuery` atau helper fetch typed;
- abort controller untuk request yang bisa tertimpa;
- debounce search/filter;
- empty/loading/error state seragam;
- toast error hanya untuk aksi, bukan semua fetch initial.

### P2 - Notification Belum Production Grade

Notification service masih berisi mock email, random polling, `setTimeout`, dan `console.log`.

Standar target:

- model notification event dan recipient permanen;
- worker/job queue untuk email/reminder;
- in-app notification tersimpan;
- SSE/WebSocket/polling API nyata jika realtime dibutuhkan;
- delivery status dan retry.

### P2 - Export, Import, dan File Operation Perlu Governance Tambahan

Sebagian route laporan sudah memakai `requireReportAccess`, ini bagus. Namun export/import lintas modul perlu standar:

- permission `export` dan `import`;
- activity log setiap export/import;
- limit ukuran file dan validasi mime;
- preview sebelum import;
- rollback atau snapshot untuk import besar;
- masking field sensitif jika role tidak cukup.

## Rencana Implementasi Sprint 0.5

### Phase A - Security Gate

1. Inventaris 46 route tanpa guard langsung dan klasifikasikan: public, authenticated, admin, teacher, student.
2. Tambahkan `requirePermission()` atau helper domain pada semua route sensitif.
3. Persempit middleware `/admin` agar role operasional tidak mendapat akses global tanpa permission.
4. Tambahkan komentar eksplisit pada route publik SPMB dan public theme.
5. Tambahkan negative test minimal untuk route sensitif utama.

### Phase B - Validation Standard

1. Buat helper `src/lib/api/validation.ts` untuk parse query, params, BigInt, pagination, dan JSON body.
2. Standarkan Zod schema per route mutasi.
3. Ubah parsing invalid dari `500` menjadi `400`.
4. Batasi page size dan format query di laporan/export.
5. Tambahkan response error shape standar.

### Phase C - Audit and Activity Logging

1. Tentukan daftar aksi yang wajib activity log dan audit trail.
2. Tambahkan logging pada siswa, nilai, rapor, CBT, SPMB, import/export, dan pengaturan.
3. Pastikan before/after disimpan untuk perubahan data sensitif.
4. Tambahkan log export untuk laporan akademik dan SPMB.
5. Buat helper wrapper untuk mengurangi duplikasi logging.

### Phase D - Lint and Type Hardening

1. Bersihkan 20 lint error saat ini.
2. Kurangi `any` di area CBT, nilai, notification, import, dan integrasi.
3. Hapus `ts-ignore` atau dokumentasikan alasannya.
4. Rapikan React effect yang memicu `set-state-in-effect`.
5. Tambahkan quality gate lint/typecheck di workflow lokal/CI.

### Phase E - Prototype to Production

1. Inventaris fitur yang masih mock.
2. Pilih: implementasi API nyata, tandai WIP, atau sembunyikan dari navigasi produksi.
3. Ganti notification mock dengan model/event nyata.
4. Ganti CBT student mock flow dengan API session/attempt nyata.
5. Update dokumentasi status implementasi per fitur.

### Phase F - Frontend Consistency

1. Standarkan empty/loading/error state.
2. Buat pola fetch client yang typed dan cancellable.
3. Tambahkan debounce untuk search/filter berat.
4. Audit responsive layout pada dashboard, tabel, form panjang, dan CBT.
5. Gunakan browser QA untuk halaman prioritas setelah perbaikan.

## Definition of Done Sprint 0.5

- Tidak ada route sensitif tanpa guard langsung.
- Route publik terdokumentasi dan dibatasi sesuai kebutuhan.
- `npm.cmd run lint -- --quiet` bersih.
- Mutasi data sensitif punya activity log dan audit trail.
- Parsing ID/query invalid mengembalikan `400`.
- Semua mock produksi sudah diganti, disembunyikan, atau diberi status WIP jelas.
- Dokumentasi TODO dan status implementasi diperbarui.

## Catatan Risiko

Audit ini berbasis static pattern, sehingga ada false positive dan false negative:

- route tanpa guard langsung mungkin masih tertahan middleware;
- route dengan `getServerSession` belum tentu role check-nya cukup;
- route tanpa `logActivity` mungkin tidak sensitif;
- route dengan logging belum tentu menyimpan before/after lengkap;
- lint bersih tidak otomatis berarti aman.

Karena itu setiap checklist QAH perlu diverifikasi manual saat implementasi.
