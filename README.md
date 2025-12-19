# Sekolix

Sekolix adalah proyek open-source untuk membantu sekolah-sekolah di Indonesia melakukan digitalisasi dengan mudah, lengkap, terintegrasi penuh, dan murah (bahkan gratis).

## Daftar Isi
- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Kondisi Saat Ini](#kondisi-saat-ini)
- [Persiapan & Jalankan](#persiapan--jalankan)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi](#dokumentasi)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Kontak](#kontak)

## Tentang Proyek

Sekolix membantu sekolah mengelola website, konten, dan proses penerimaan siswa secara digital. Dibangun dengan Next.js, Prisma, dan PostgreSQL.

## Fitur Utama

- Autentikasi dan manajemen user (role-based)
- Panel admin untuk mengelola konten (artikel, berita, event, halaman)
- Modul penerimaan siswa (registrasi, validasi, pembayaran)
- Galeri dan album foto
- Multi-theme landing pages (beberapa tema tersedia, pengaturan tema masih disempurnakan)

## Kondisi Saat Ini

- Nama proyek di `package.json`: `sekolix`.
- Tidak ditemukan referensi nama lama `sekokit` di repo.
- Dev server dapat dijalankan secara lokal (`npm run dev`) dan aplikasi menyajikan halaman serta API (telah diuji singkat).
- Prisma sudah dikonfigurasi dan ada skema serta migration/seed (lihat folder `prisma/`).
- Beberapa fitur admin dan modul penerimaan siswa sudah berfungsi; tema landing page dan manajemen media masih dalam pengembangan.

## Persiapan & Jalankan

Persiapan singkat untuk development:

```bash
# Pasang dependensi
npm install

# Salin contoh environment dan sesuaikan
cp .env.example .env.local
# Edit .env.local (DATABASE_URL, NEXTAUTH_SECRET, dll.)

# Generate Prisma client dan push schema
npx prisma generate
npx prisma db push

# (Opsional) Seed data
npm run prisma:seed

# Jalankan development server
npm run dev
```

Buka http://localhost:3000 untuk melihat aplikasi. Admin ada di `/admin`.

Catatan singkat: saat pengujian, server development berjalan. Beberapa gambar remote mungkin mengembalikan 404 — ini bukan kegagalan build.

## Struktur Proyek (singkat)

```
sekolix/
├─ app/            # Next.js app (halaman & api)
├─ src/            # Komponen, hooks, lib
├─ prisma/         # Schema & migration
├─ public/         # Static assets
├─ doc/            # Dokumentasi proyek (catatan development)
├─ package.json
└─ README.md
```

## Dokumentasi

Dokumentasi internal dan catatan ada di folder `doc/`.

## Kontribusi

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "Add: ..."`
4. Push dan buat Pull Request

Terima kontribusi dari siapa saja — silakan ikuti panduan coding di `doc/`.

## Lisensi

Proyek ini open-source. Tambahkan file LICENSE sesuai kebijakan (mis. MIT) jika belum ada.

## Kontak

Jika butuh bantuan atau ingin kontribusi, buka isu (Issue) di repository atau hubungi pemilik proyek.

---

**Last Updated**: December 19, 2025
Catatan singkat: saat pengujian, server development berjalan. Beberapa gambar remote mungkin mengembalikan 404 — ini bukan kegagalan build.

