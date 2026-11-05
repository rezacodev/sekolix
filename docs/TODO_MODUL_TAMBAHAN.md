# TODO Modul Tambahan Sekolix

Dokumen ini dipakai untuk monitoring penerapan 10 modul tambahan dari [ROADMAP_MODUL_TAMBAHAN.md](./ROADMAP_MODUL_TAMBAHAN.md). Analisis migrasi tabel dan tools pendukung tersedia di [ANALISIS_MIGRASI_MODUL_TAMBAHAN.md](./ANALISIS_MIGRASI_MODUL_TAMBAHAN.md). Audit best practice lintas proyek tersedia di [AUDIT_BEST_PRACTICES.md](./AUDIT_BEST_PRACTICES.md).

## Cara Membaca

- Status: `[ ]` belum, `[~]` sebagian, `[x]` selesai.
- Prioritas: P0 fondasi wajib, P1 tinggi, P2 sedang, P3 lanjutan.
- Cek implementasi detail tetap perlu dilakukan sebelum menandai selesai.

## Ringkasan Monitoring

| Kode | Modul | Prioritas | Status |
|------|-------|-----------|--------|
| GOV | Audit, Keamanan, dan Tata Kelola | P0 | [x] |
| QAH | Quality & Security Hardening | P0 | [~] |
| ORT | Portal Orang Tua/Wali | P1 | [x] |
| KEU | Keuangan/SPP | P1 | [x] |
| BKS | BK, Kedisiplinan, Prestasi | P1 | [x] |
| LIB | Perpustakaan | P2 | [x] |
| INV | Inventaris/Sarpras | P2 | [x] |
| SDM | Manajemen Pegawai | P2 | [x] |
| TU | Surat Menyurat & Administrasi TU | P3 | [x] |
| EKS | Ekstrakurikuler & Kegiatan | P3 | [x] |
| INT | Integrasi Data Pendidikan | P3 | [x] |

## Sprint 0 - Fondasi Tata Kelola

- [x] **[GOV-01]** Rancang role tambahan: SUPERADMIN, KEPALA_SEKOLAH, WAKA, TU, BENDAHARA, BK, PUSTAKAWAN, SARPRAS, ORANG_TUA.
- [x] **[GOV-02]** Buat model permission granular dan mapping role ke permission.
- [x] **[GOV-03]** Buat helper server untuk cek permission per route/API.
- [x] **[GOV-04]** Buat activity log global untuk create/update/delete/login/export.
- [x] **[GOV-05]** Buat audit trail untuk data sensitif: nilai, pembayaran, siswa, pegawai, BK.
- [x] **[GOV-06]** Buat halaman admin permission matrix.
- [x] **[GOV-07]** Buat halaman audit log dengan filter user, modul, aksi, tanggal.
- [x] **[GOV-08]** Buat approval workflow dasar untuk perubahan data sensitif.
- [x] **[GOV-09]** Tambahkan seed role dan permission default.
- [x] **[GOV-10]** Dokumentasikan standar logging dan permission untuk modul baru.

## Sprint 0.5 - Quality & Security Hardening

- [x] **[QAH-00]** Lakukan audit best practice statis lintas proyek dan dokumentasikan temuan di `AUDIT_BEST_PRACTICES.md`.
- [x] **[QAH-01]** Klasifikasikan 46 kandidat API route tanpa guard langsung: public, authenticated, admin, teacher, student.
- [x] **[QAH-02]** Tambahkan guard langsung pada API admin akademik yang sensitif, terutama rombel transfer, tahun ajaran, teacher-subjects, class schedules, rooms, dan export.
- [x] **[QAH-03]** Tambahkan guard langsung pada API teacher/student/shared yang masih bergantung pada middleware atau belum jelas scope-nya.
- [x] **[QAH-04]** Persempit akses global `/admin` di `proxy.ts` agar role operasional masuk berdasarkan permission modul, bukan akses admin umum.
- [x] **[QAH-05]** Buat helper validasi API untuk parse BigInt, number, pagination, body JSON, dan error `400`.
- [x] **[QAH-06]** Terapkan Zod schema untuk body, query, dan dynamic params pada route mutasi prioritas.
- [x] **[QAH-07]** Validasi allowlist permission subject/action di API permission matrix.
- [x] **[QAH-08]** Tambahkan ownership/scope check untuk nilai guru, CBT, tugas, kelas, forum, dan shared data siswa.
- [x] **[QAH-09]** Inventaris 114 kandidat route mutasi tanpa logging dan kelompokkan mana yang wajib activity log, audit trail, atau cukup tanpa log.
- [x] **[QAH-10]** Tambahkan activity log untuk create/update/delete/export/import pada siswa, GTK, nilai, rapor, CBT, SPMB, pengaturan, dan CMS penting.
  - [x] Tambahkan activity log untuk nilai guru, paket CBT, export SPMB, biodata SPMB, transfer rombel, CRUD siswa, GTK, pembayaran SPMB, dan applicant SPMB.
  - [x] Catat sisa logging route mutasi non-prioritas di `MUTATION_LOGGING_INVENTORY.md`.
- [x] **[QAH-11]** Tambahkan audit trail before/after untuk data sensitif: siswa, keluarga, nilai, rapor, pembayaran/SPMB, pegawai, permission.
- [x] **[QAH-12]** Bersihkan 20 error `npm.cmd run lint -- --quiet`.
- [x] **[QAH-13]** Kurangi penggunaan `any`, `as any`, `ts-ignore`, dan eslint-disable di area CBT, nilai, import, notification, dan integrasi.
- [x] **[QAH-14]** Ganti penggunaan `Date.now()`/`Math.random()` yang mempengaruhi render, ID, token, atau kode akses dengan sumber yang stabil/aman.
- [x] **[QAH-15]** Inventaris 41 indikasi mock/TODO/prototype residue dan tentukan status: implementasi API nyata, sembunyikan, atau label WIP.
- [x] **[QAH-16]** Ganti mock data portal siswa/CBT/material/notifikasi dengan API nyata atau nonaktifkan dari navigasi produksi.
- [x] **[QAH-17]** Standarkan empty/loading/error state dan pola fetch client untuk halaman prioritas.
- [x] **[QAH-18]** Tambahkan negative test minimal untuk akses route sensitif lintas role.
- [x] **[QAH-19]** Tambahkan quality gate lokal/CI: lint, typecheck, Prisma validate, dan test prioritas.
- [x] **[QAH-20]** Update `IMPLEMENTATION_STATUS.md` setelah hardening selesai agar status fitur tidak tertukar dengan prototype.

## Sprint 1 - Portal Orang Tua/Wali

- [x] **[ORT-01]** Rancang model Parent/Guardian account dan relasi wali ke peserta didik.
- [x] **[ORT-02]** Tambahkan role ORANG_TUA ke auth/session/middleware.
- [x] **[ORT-03]** Buat route `app/parent` dan layout portal orang tua.
- [x] **[ORT-04]** Buat dashboard orang tua: anak, absensi, nilai terbaru, tugas, pengumuman.
- [x] **[ORT-05]** Buat halaman detail anak dengan profil, rombel, wali kelas, jadwal.
- [x] **[ORT-06]** Buat halaman nilai dan rapor read-only per anak.
- [x] **[ORT-07]** Buat halaman absensi dan riwayat izin.
- [x] **[ORT-08]** Buat form pengajuan izin sakit/izin tidak masuk.
- [x] **[ORT-09]** Buat pesan/konsultasi orang tua ke wali kelas/guru.
- [x] **[ORT-10]** Integrasikan pengumuman dan notifikasi untuk orang tua.
- [x] **[ORT-11]** Tambahkan API `app/api/parent/*` dengan validasi akses per anak.
- [x] **[ORT-12]** Tambahkan seed akun orang tua demo.

## Sprint 2 - Keuangan/SPP

- [x] **[KEU-01]** Rancang model jenis tagihan, invoice siswa, pembayaran, diskon, denda.
- [x] **[KEU-02]** Buat permission BENDAHARA dan akses modul keuangan.
- [x] **[KEU-03]** Buat dashboard keuangan admin.
- [x] **[KEU-04]** Buat CRUD jenis tagihan.
- [x] **[KEU-05]** Buat generate tagihan per siswa/rombel/tahun ajaran.
- [x] **[KEU-06]** Buat daftar tagihan dengan filter status, rombel, periode.
- [x] **[KEU-07]** Buat input pembayaran manual dan validasi pembayaran.
- [x] **[KEU-08]** Buat kwitansi PDF per pembayaran.
- [x] **[KEU-09]** Buat laporan tunggakan dan pembayaran harian.
- [x] **[KEU-10]** Tampilkan tagihan di portal orang tua.
- [x] **[KEU-11]** Tambahkan upload bukti bayar dari orang tua.
- [x] **[KEU-12]** Tambahkan audit log untuk perubahan tagihan/pembayaran.
- [x] **[KEU-13]** Siapkan adapter payment gateway sebagai fitur lanjutan.

## Sprint 3 - BK, Kedisiplinan, Prestasi

- [x] **[BKS-01]** Rancang model catatan BK, pelanggaran, poin disiplin, prestasi, tindak lanjut.
- [x] **[BKS-02]** Buat permission role BK dan visibilitas data sensitif.
- [x] **[BKS-03]** Buat dashboard BK: kasus aktif, siswa perlu perhatian, tindak lanjut.
- [x] **[BKS-04]** Buat CRUD catatan BK per siswa.
- [x] **[BKS-05]** Buat CRUD pelanggaran dan konfigurasi poin disiplin.
- [x] **[BKS-06]** Buat CRUD prestasi akademik/non-akademik.
- [x] **[BKS-07]** Buat workflow rujukan dari guru/wali kelas ke BK.
- [x] **[BKS-08]** Buat surat panggilan orang tua dari catatan kasus.
- [x] **[BKS-09]** Buat laporan perkembangan siswa.
- [x] **[BKS-10]** Tambahkan kontrol visibilitas ke portal orang tua.
- [x] **[BKS-11]** Tambahkan audit log untuk catatan BK dan pelanggaran.

## Sprint 4 - Perpustakaan

- [x] **[LIB-01]** Rancang model buku, kategori, eksemplar, anggota, transaksi, denda.
- [x] **[LIB-02]** Buat role/permission PUSTAKAWAN.
- [x] **[LIB-03]** Buat dashboard perpustakaan.
- [x] **[LIB-04]** Buat CRUD katalog buku.
- [x] **[LIB-05]** Buat CRUD eksemplar dengan barcode/QR.
- [x] **[LIB-06]** Buat data anggota dari siswa dan GTK.
- [x] **[LIB-07]** Buat alur peminjaman buku.
- [x] **[LIB-08]** Buat alur pengembalian dan perhitungan keterlambatan.
- [x] **[LIB-09]** Buat laporan buku populer dan buku terlambat.
- [x] **[LIB-10]** Buat import katalog dari Excel.
- [x] **[LIB-11]** Tampilkan ketersediaan dan riwayat pinjam di portal siswa.

## Sprint 5 - Inventaris/Sarpras

- [x] **[INV-01]** Rancang model aset, kategori, lokasi, kondisi, mutasi, peminjaman, pemeliharaan.
- [x] **[INV-02]** Buat role/permission SARPRAS.
- [x] **[INV-03]** Buat dashboard inventaris.
- [x] **[INV-04]** Buat CRUD aset dan kategori.
- [x] **[INV-05]** Buat master lokasi aset terhubung ke data ruang.
- [x] **[INV-06]** Buat update kondisi aset dan riwayat kondisi.
- [x] **[INV-07]** Buat mutasi aset antar lokasi.
- [x] **[INV-08]** Buat peminjaman barang/ruang.
- [x] **[INV-09]** Buat jadwal pemeliharaan aset.
- [x] **[INV-10]** Buat QR label aset.
- [x] **[INV-11]** Buat laporan aset rusak, hilang, dan perlu pemeliharaan.

## Sprint 6 - Manajemen Pegawai

- [x] **[SDM-01]** Rancang model absensi pegawai, cuti/izin, dokumen, piket, kontrak.
- [x] **[SDM-02]** Buat dashboard pegawai/SDM.
- [x] **[SDM-03]** Buat absensi pegawai manual/import.
- [x] **[SDM-04]** Buat pengajuan dan approval cuti/izin pegawai.
- [x] **[SDM-05]** Buat jadwal piket pegawai.
- [x] **[SDM-06]** Buat dokumen kepegawaian dengan upload file.
- [x] **[SDM-07]** Buat pengingat masa kontrak/sertifikasi.
- [x] **[SDM-08]** Buat laporan kehadiran pegawai.
- [x] **[SDM-09]** Buat SK/surat tugas terhubung ke modul TU.
- [x] **[SDM-10]** Tambahkan audit log untuk dokumen dan status pegawai.

## Sprint 7 - Surat Menyurat & Administrasi TU

- [x] **[TU-01]** Rancang model surat masuk, surat keluar, disposisi, template, arsip.
- [x] **[TU-02]** Buat role/permission TU.
- [x] **[TU-03]** Buat dashboard tata usaha.
- [x] **[TU-04]** Buat agenda surat masuk.
- [x] **[TU-05]** Buat agenda surat keluar dengan nomor otomatis.
- [x] **[TU-06]** Buat template surat keterangan siswa/pegawai.
- [x] **[TU-07]** Buat generate surat PDF dari template.
- [x] **[TU-08]** Buat arsip digital dan pencarian.
- [x] **[TU-09]** Buat disposisi dan approval surat.
- [x] **[TU-10]** Tambahkan QR validasi surat.

## Sprint 8 - Ekstrakurikuler & Kegiatan

- [x] **[EKS-01]** Rancang model ekstrakurikuler, anggota, pembina, jadwal, presensi, prestasi.
- [x] **[EKS-02]** Buat dashboard ekstrakurikuler.
- [x] **[EKS-03]** Buat CRUD master ekstrakurikuler.
- [x] **[EKS-04]** Buat pengelolaan pembina dan anggota.
- [x] **[EKS-05]** Buat jadwal latihan/kegiatan.
- [x] **[EKS-06]** Buat presensi ekskul.
- [x] **[EKS-07]** Buat catatan prestasi lomba/kegiatan.
- [x] **[EKS-08]** Buat pendaftaran ekskul dari portal siswa.
- [x] **[EKS-09]** Buat publikasi kegiatan ke landing page.
- [x] **[EKS-10]** Buat portofolio non-akademik siswa.

## Sprint 9 - Integrasi Data Pendidikan Indonesia

- [x] **[INT-01]** Inventaris format data yang perlu didukung: Dapodik, EMIS, e-Rapor friendly.
- [x] **[INT-02]** Buat mapping field internal ke format export.
- [x] **[INT-03]** Buat template import Excel standar.
- [x] **[INT-04]** Buat validasi data NISN, NIK, rombel, mapel, orang tua.
- [x] **[INT-05]** Buat laporan data tidak lengkap dan data duplikat.
- [x] **[INT-06]** Buat import dengan preview sebelum simpan.
- [x] **[INT-07]** Buat riwayat import dan rollback.
- [x] **[INT-08]** Buat export data siswa, GTK, rombel, mapel, nilai.
- [x] **[INT-09]** Buat preset format per jenjang.
- [x] **[INT-10]** Tambahkan audit log untuk import/export.

## Sprint 10 - Polish Lintas Modul

- [ ] **[POL-01]** Tambahkan notification center untuk event lintas modul.
- [ ] **[POL-02]** Tambahkan dashboard eksekutif yang membaca keuangan, BK, perpustakaan, inventaris.
- [ ] **[POL-03]** Standarkan export PDF/Excel lintas modul.
- [ ] **[POL-04]** Standarkan empty/loading/error state.
- [x] **[POL-05]** Tambahkan seed demo untuk semua modul baru.
- [ ] **[POL-06]** Tambahkan dokumentasi admin guide per modul.
- [ ] **[POL-07]** Tambahkan test permission dan akses data sensitif.
- [ ] **[POL-08]** Tambahkan backup/restore coverage untuk model baru.
- [ ] **[POL-09]** Review performa query laporan besar.
- [ ] **[POL-10]** Review UX mobile untuk portal orang tua dan siswa.
