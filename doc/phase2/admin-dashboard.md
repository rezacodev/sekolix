# Phase 2 - Admin Dashboard

## Fitur yang Dibuat
- Admin layout + navigasi (sidebar) dengan proteksi role ADMIN
- Dashboard homepage dengan kartu statistik (users, articles, news, events, galleries)
- User management page (read-only list)
- Halaman login admin dengan Credentials (NextAuth)

## Rute
- `/admin` — dashboard
- `/admin/users` — daftar user
- `/admin/login` — login admin/editor

## Akses
- Role ADMIN wajib: layout melakukan `getServerSession(authOptions)` dan redirect ke `/admin/login` bila tidak memenuhi.
- Creds seed: 
  - admin@sekolix.test / Admin123!
  - editor@sekolix.test / Editor123!

## Data yang digunakan
- Model Prisma tetap `User`, `Article`, `News`, `Event`, `Gallery`, `ThemeConfig` (tabel prefiks `landing_` sudah di-@@map)
- Dashboard menampilkan count published untuk article/news/event dan total gallery + users.

## Menjalankan
```bash
npm run dev
# akses http://localhost:3000/admin (redirect ke /admin/login bila belum login)
```

## Catatan
- User management saat ini read-only (listing). CRUD akan ditambahkan di fase berikut.
- Form konten (articles/news/events/gallery) belum dibuat (bagian Content Management Forms).
