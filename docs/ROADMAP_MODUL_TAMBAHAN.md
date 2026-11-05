# Roadmap Modul Tambahan Sekolix

Dokumen ini menerjemahkan 10 rekomendasi pengembangan sistem informasi sekolah umum menjadi rencana penerapan bertahap. Fokusnya adalah urutan implementasi, cakupan fitur, dependensi, dan output yang bisa dipakai untuk perencanaan sprint.

Dokumen monitoring task detail ada di [TODO_MODUL_TAMBAHAN.md](./TODO_MODUL_TAMBAHAN.md). Analisis tabel migrasi dan tools pendukung ada di [ANALISIS_MIGRASI_MODUL_TAMBAHAN.md](./ANALISIS_MIGRASI_MODUL_TAMBAHAN.md). Audit best practice lintas proyek ada di [AUDIT_BEST_PRACTICES.md](./AUDIT_BEST_PRACTICES.md).

## Prinsip Penerapan

- Mulai dari modul yang paling sering dipakai sekolah: orang tua/wali, keuangan, BK, perpustakaan, dan inventaris.
- Setiap modul dibuat minimal dari admin CRUD, API, role access, seed demo, lalu UI portal terkait.
- Modul yang menyangkut data sensitif wajib punya audit log, role permission, dan approval untuk perubahan penting.
- Sebelum menambah fitur besar, route/API lama yang sensitif perlu lolos hardening guard, validasi, audit trail, dan lint.
- Integrasi eksternal dibuat setelah alur internal stabil.
- Status implementasi awal di dokumen ini berdasarkan cek ringan route/file, bukan audit kode mendalam.

## Ringkasan Prioritas

| Prioritas | Modul | Alasan |
|-----------|-------|--------|
| P0 | Audit, Keamanan, dan Tata Kelola | Menjadi fondasi aman untuk modul keuangan, BK, dan data siswa |
| P0 | Quality & Security Hardening | Menutup gap best practice lintas proyek sebelum ekspansi fitur |
| P1 | Portal Orang Tua/Wali | Nilai produk tinggi dan melengkapi portal siswa/guru |
| P1 | Keuangan/SPP | Kebutuhan operasional umum sekolah |
| P1 | BK, Kedisiplinan, Prestasi, dan Catatan Perkembangan | Memperkuat layanan kesiswaan di luar nilai akademik |
| P2 | Perpustakaan | Modul sekolah klasik dengan alur jelas |
| P2 | Sarana Prasarana & Inventaris | Dibutuhkan TU/sarpras untuk aset sekolah |
| P2 | Manajemen Pegawai Lebih Lengkap | Melengkapi data GTK menjadi operasional SDM |
| P3 | Surat Menyurat & Administrasi TU | Efisiensi administrasi dan arsip |
| P3 | Ekstrakurikuler & Kegiatan Sekolah | Memperkuat profil non-akademik siswa |
| P3 | Integrasi Data Pendidikan Indonesia | Bernilai tinggi, tetapi sebaiknya setelah data internal rapi |

## Roadmap Sprint

| Sprint | Fokus | Output Utama |
|--------|-------|--------------|
| Sprint 0 | Fondasi tata kelola | Permission granular, activity log, audit trail, dasar approval |
| Sprint 0.5 | Quality & security hardening | Guard route sensitif, validasi input, lint bersih, logging mutasi, mock cleanup |
| Sprint 1 | Portal orang tua/wali MVP | Akun wali, dashboard anak, nilai, absensi, pengumuman, pesan |
| Sprint 2 | Keuangan/SPP MVP | Master tagihan, invoice siswa, pembayaran manual, kwitansi, laporan tunggakan |
| Sprint 3 | BK & kesiswaan | Catatan BK, pelanggaran, prestasi, tindak lanjut, laporan siswa |
| Sprint 4 | Perpustakaan | Katalog, anggota, peminjaman, pengembalian, denda, laporan |
| Sprint 5 | Inventaris/Sarpras | Aset, lokasi, kondisi, mutasi, peminjaman ruang/barang |
| Sprint 6 | SDM pegawai | Absensi pegawai, cuti/izin, dokumen pegawai, jadwal piket |
| Sprint 7 | Administrasi TU | Surat masuk/keluar, template surat, disposisi, arsip digital |
| Sprint 8 | Ekstrakurikuler | Ekskul, anggota, presensi, kegiatan, prestasi |
| Sprint 9 | Integrasi data pendidikan | Import/export Dapodik/EMIS/e-Rapor friendly, validasi data, mapping |
| Sprint 10 | Polish lintas modul | Notifikasi, export, dashboard eksekutif, dokumentasi, test |

## 0.5. Quality & Security Hardening

**Tujuan:** Menutup gap best practice lintas proyek sebelum pengembangan modul baru berjalan lebih jauh.

**Cakupan MVP:**
- Klasifikasi route publik, route authenticated, route admin, route teacher, route student.
- Guard langsung pada API sensitif memakai permission/helper domain.
- Validasi Zod untuk body, query, dynamic params, dan pagination.
- Activity log dan audit trail untuk mutasi data sensitif.
- Lint error bersih dan type-safety lebih ketat.
- Mock data produksi diganti API nyata, disembunyikan, atau diberi status WIP.

**Cakupan lanjutan:**
- Negative test akses lintas-role.
- API client typed untuk fetch client.
- CI quality gate untuk lint, typecheck, Prisma validate, dan test.
- Browser QA untuk halaman prioritas.

**Dependensi:** Governance foundation Sprint 0, NextAuth, CASL permission, Zod, Prisma.

**Dokumen acuan:**
- `docs/AUDIT_BEST_PRACTICES.md`
- `docs/GOVERNANCE_FOUNDATION.md`

## 1. Portal Orang Tua/Wali

**Tujuan:** Orang tua dapat memantau perkembangan anak tanpa harus login sebagai siswa atau menunggu komunikasi manual.

**Cakupan MVP:**
- Akun wali terhubung ke satu atau lebih siswa.
- Dashboard ringkas: absensi, nilai terbaru, tugas, pengumuman, tagihan.
- Detail anak: profil, rombel, wali kelas, kontak guru.
- Komunikasi wali dengan wali kelas/guru mapel.
- Pengajuan izin sakit/izin tidak masuk.

**Cakupan lanjutan:**
- Multi-anak dalam satu akun.
- Notifikasi email/in-app/WhatsApp gateway.
- Persetujuan perubahan data kontak keluarga.
- Riwayat konseling, prestasi, dan catatan perkembangan yang layak ditampilkan.

**Dependensi:** Portal siswa, data peserta didik, komunikasi guru, notifikasi, permission.

**Route awal yang disarankan:**
- `app/parent/page.tsx`
- `app/parent/anak/[studentId]/page.tsx`
- `app/parent/tagihan/page.tsx`
- `app/parent/pesan/page.tsx`
- `app/parent/izin/page.tsx`
- `app/api/parent/*`

## 2. Keuangan Sekolah

**Tujuan:** Sekolah dapat mengelola tagihan, pembayaran, tunggakan, dan bukti bayar secara terpusat.

**Cakupan MVP:**
- Master jenis tagihan: SPP, daftar ulang, kegiatan, seragam, ujian.
- Generate tagihan per siswa/rombel/tahun ajaran.
- Input pembayaran manual oleh admin/bendahara.
- Validasi pembayaran dan kwitansi PDF.
- Laporan tunggakan, pembayaran harian, dan rekap per kelas.

**Cakupan lanjutan:**
- Cicilan, diskon, beasiswa, denda.
- Upload bukti bayar dari portal orang tua.
- Integrasi payment gateway.
- Export akuntansi sederhana.

**Dependensi:** Peserta didik, tahun ajaran, portal orang tua, audit log.

**Route awal yang disarankan:**
- `app/admin/keuangan/page.tsx`
- `app/admin/keuangan/tagihan/page.tsx`
- `app/admin/keuangan/pembayaran/page.tsx`
- `app/admin/keuangan/laporan/page.tsx`
- `app/api/admin/keuangan/*`

## 3. BK, Kedisiplinan, Prestasi, dan Catatan Perkembangan

**Tujuan:** Merekam perkembangan siswa secara utuh di luar nilai akademik.

**Cakupan MVP:**
- Catatan BK per siswa.
- Pelanggaran dan poin disiplin.
- Prestasi akademik/non-akademik.
- Tindak lanjut dan status penyelesaian.
- Dashboard siswa yang perlu perhatian.

**Cakupan lanjutan:**
- Workflow rujukan dari guru ke BK.
- Surat panggilan orang tua.
- Visibilitas terkontrol ke wali kelas/orang tua.
- Analisis korelasi absensi, nilai, dan catatan perilaku.

**Dependensi:** Data siswa, portal guru, portal orang tua, audit/permission.

**Route awal yang disarankan:**
- `app/admin/bk/page.tsx`
- `app/admin/bk/catatan/page.tsx`
- `app/admin/bk/pelanggaran/page.tsx`
- `app/admin/bk/prestasi/page.tsx`
- `app/api/admin/bk/*`

## 4. Perpustakaan

**Tujuan:** Mengelola koleksi buku dan transaksi peminjaman sekolah.

**Cakupan MVP:**
- Katalog buku, kategori, penulis, penerbit, tahun.
- Eksemplar dengan barcode/QR.
- Anggota siswa/guru.
- Peminjaman, pengembalian, keterlambatan.
- Laporan buku populer dan buku terlambat.

**Cakupan lanjutan:**
- Denda otomatis.
- Reservasi buku.
- Import katalog dari Excel.
- Portal siswa untuk melihat riwayat dan ketersediaan buku.

**Dependensi:** Data siswa, data GTK, import/export Excel.

**Route awal yang disarankan:**
- `app/admin/perpustakaan/page.tsx`
- `app/admin/perpustakaan/katalog/page.tsx`
- `app/admin/perpustakaan/peminjaman/page.tsx`
- `app/admin/perpustakaan/laporan/page.tsx`
- `app/api/admin/perpustakaan/*`

## 5. Sarana Prasarana & Inventaris

**Tujuan:** Mengelola aset sekolah, kondisi, lokasi, dan pemakaian.

**Cakupan MVP:**
- Master aset dan kategori.
- Lokasi aset: gedung, ruang, lantai.
- Kondisi aset dan riwayat perubahan.
- Mutasi aset antar lokasi.
- Peminjaman barang/ruang.

**Cakupan lanjutan:**
- Jadwal pemeliharaan.
- Label QR aset.
- Opname aset.
- Laporan aset rusak/hilang.

**Dependensi:** Data ruang, role TU/sarpras, audit log.

**Route awal yang disarankan:**
- `app/admin/inventaris/page.tsx`
- `app/admin/inventaris/aset/page.tsx`
- `app/admin/inventaris/peminjaman/page.tsx`
- `app/admin/inventaris/pemeliharaan/page.tsx`
- `app/api/admin/inventaris/*`

## 6. Manajemen Pegawai Lebih Lengkap

**Tujuan:** Mengembangkan data GTK menjadi operasional SDM.

**Cakupan MVP:**
- Absensi pegawai.
- Cuti/izin pegawai.
- Jadwal piket.
- Dokumen kepegawaian.
- Laporan kehadiran pegawai.

**Cakupan lanjutan:**
- Masa kontrak dan pengingat.
- SK/surat tugas.
- Beban kerja non-mengajar.
- Payroll/honor sederhana jika dibutuhkan.

**Dependensi:** Data GTK, notifikasi, surat menyurat, audit log.

**Route awal yang disarankan:**
- `app/admin/pegawai/page.tsx`
- `app/admin/pegawai/absensi/page.tsx`
- `app/admin/pegawai/cuti/page.tsx`
- `app/admin/pegawai/dokumen/page.tsx`
- `app/api/admin/pegawai/*`

## 7. Surat Menyurat & Administrasi TU

**Tujuan:** Mengurangi pekerjaan manual TU untuk surat dan arsip.

**Cakupan MVP:**
- Surat masuk dan surat keluar.
- Nomor agenda otomatis.
- Template surat keterangan siswa.
- Generate surat PDF.
- Arsip digital dengan pencarian.

**Cakupan lanjutan:**
- Disposisi kepala sekolah/waka.
- Approval surat.
- Tanda tangan digital atau QR validasi.
- Template variabel untuk data siswa/pegawai.

**Dependensi:** Data siswa, data pegawai, identitas sekolah, permission.

**Route awal yang disarankan:**
- `app/admin/tata-usaha/page.tsx`
- `app/admin/tata-usaha/surat-masuk/page.tsx`
- `app/admin/tata-usaha/surat-keluar/page.tsx`
- `app/admin/tata-usaha/template/page.tsx`
- `app/api/admin/tata-usaha/*`

## 8. Ekstrakurikuler & Kegiatan Sekolah

**Tujuan:** Mendokumentasikan aktivitas non-akademik siswa dan sekolah.

**Cakupan MVP:**
- Master ekstrakurikuler.
- Pembina dan anggota.
- Jadwal kegiatan.
- Presensi ekskul.
- Prestasi lomba/kegiatan.

**Cakupan lanjutan:**
- Pendaftaran ekskul dari portal siswa.
- Publikasi kegiatan ke landing page.
- Sertifikat kegiatan.
- Portofolio non-akademik siswa.

**Dependensi:** Data siswa, data GTK, kalender akademik, landing CMS.

**Route awal yang disarankan:**
- `app/admin/ekstrakurikuler/page.tsx`
- `app/admin/ekstrakurikuler/anggota/page.tsx`
- `app/admin/ekstrakurikuler/kegiatan/page.tsx`
- `app/api/admin/ekstrakurikuler/*`

## 9. Integrasi Data Pendidikan Indonesia

**Tujuan:** Memudahkan sekolah mengelola data yang kompatibel dengan kebutuhan pelaporan nasional.

**Cakupan MVP:**
- Import/export Excel dengan template standar internal.
- Validasi NISN, NIK, rombel, mapel, dan data orang tua.
- Mapping field untuk Dapodik/EMIS/e-Rapor friendly.
- Laporan data tidak lengkap.

**Cakupan lanjutan:**
- Preset format per jenjang.
- Riwayat import dan rollback.
- Rekonsiliasi data duplikat.
- Integrasi API resmi jika tersedia dan diizinkan.

**Dependensi:** Data akademik stabil, audit log, backup/restore.

**Route awal yang disarankan:**
- `app/admin/integrasi-data/page.tsx`
- `app/admin/integrasi-data/import/page.tsx`
- `app/admin/integrasi-data/export/page.tsx`
- `app/admin/integrasi-data/validasi/page.tsx`
- `app/api/admin/integrasi-data/*`

## 10. Audit, Keamanan, dan Tata Kelola

**Tujuan:** Menjaga perubahan data sensitif tetap terlacak dan akses pengguna lebih terkontrol.

**Cakupan MVP:**
- Activity log global.
- Audit trail untuk nilai, pembayaran, data siswa, dan data pegawai.
- Role permission granular.
- Approval workflow untuk perubahan sensitif.
- Backup terjadwal dan restore policy.

**Cakupan lanjutan:**
- Session/device management.
- Data retention policy.
- Export audit untuk pemeriksaan internal.
- Alert aktivitas mencurigakan.

**Dependensi:** User management, semua modul sensitif.

**Route awal yang disarankan:**
- `app/admin/pengaturan/permissions/page.tsx`
- `app/admin/pengaturan/audit-log/page.tsx`
- `app/admin/pengaturan/approval/page.tsx`
- `app/api/admin/settings/audit-log/*`
- `app/api/admin/settings/approval/*`

## Dependensi Lintas Modul

| Fondasi | Dibutuhkan Oleh |
|---------|-----------------|
| Permission granular | Semua modul baru |
| Activity log dan audit trail | Keuangan, BK, pegawai, integrasi data |
| Notifikasi | Portal orang tua, keuangan, BK, pegawai |
| Export PDF/Excel | Keuangan, perpustakaan, inventaris, TU |
| File/media storage | Surat, dokumen pegawai, bukti bayar, arsip |
| Portal orang tua | Keuangan, BK, pengumuman, izin |

## Definition of Done per Modul

- Route UI utama tersedia.
- API CRUD dasar tersedia.
- Schema dan migration tersedia.
- Seed demo minimal tersedia.
- Role guard dan permission diterapkan.
- Empty state, loading state, dan error state tersedia.
- Export utama tersedia jika modul menghasilkan laporan.
- Activity log diterapkan untuk operasi sensitif.
- Dokumentasi modul dan TODO diperbarui.
