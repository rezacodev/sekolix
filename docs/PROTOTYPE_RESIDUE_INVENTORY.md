# Inventaris Prototype Residue

Dokumen ini menutup QAH-15 dan QAH-16. Inventaris memakai pencarian statis terhadap kata kunci `mock`, `dummy`, `TODO`, `Date.now`, `Math.random`, `any`, `ts-ignore`, dan `eslint-disable`.

## Ringkasan Keputusan

| Kategori | Status |
|----------|--------|
| Mock portal siswa untuk materi | Diganti ke API `GET /api/student/materials` berbasis `LearningMaterial` |
| Mock notifikasi siswa | Dinonaktifkan; endpoint mengembalikan array kosong sampai model notifikasi tersedia |
| Mock kelas dan tugas siswa | Diganti ke query database berdasarkan email siswa dan relasi rombel |
| Mock pengerjaan CBT siswa | Data contoh dinonaktifkan dari runtime; halaman menampilkan empty state sampai API sesi siswa tersedia |
| Livescore random | Dinonaktifkan; komponen polling endpoint nyata dan menampilkan empty state jika belum tersedia |
| Random ID notifikasi client | Diganti counter lokal stabil per provider |
| `Date.now()` saat render dashboard | Diganti tanggal stabil yang dihitung sebelum query |
| Seed dummy/demo | Dibiarkan, karena berada di folder seed non-produksi dan sudah dipisahkan dari skenario production |

## Sisa Residue yang Disengaja

| Area | Contoh | Keputusan |
|------|--------|-----------|
| `prisma/seeds/dummy/**` | Random nama, nilai, tanggal | Tetap sebagai seed demo/test, bukan runtime produksi |
| `prisma/seeds/guru/**` | Random jadwal, nilai, konten | Tetap sebagai seed demo guru |
| `src/components/ui/*` | `eslint-disable` untuk library interop dan `<img>` editor | Tetap, karena terkait library/editor dan tidak muncul sebagai error lint |
| API CBT hasil | `any` pada shape nested attempt/question | Ditunda sebagai refactor typed DTO lanjutan; lint sudah bersih karena area ini punya disable historis |
| Route student CBT sesi | Belum ada API sesi aktif | Runtime mock dinonaktifkan agar tidak menampilkan data palsu |

## TODO Lanjutan Setelah QAH

- [ ] Tambahkan model/route notifikasi persistensi agar `GET /api/student/notifications` membaca data nyata.
- [ ] Tambahkan API sesi CBT siswa untuk mengisi halaman pengerjaan ujian.
- [ ] Refactor DTO CBT hasil/koreksi/export agar tidak membutuhkan `any`.
- [ ] Pisahkan seed dummy dari package production deployment bila pipeline produksi ikut membawa folder `prisma/seeds`.
- [ ] Tambahkan telemetry material access jika model `MaterialAccess` tersedia.
