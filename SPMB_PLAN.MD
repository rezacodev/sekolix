# Rencana Integrasi Sistem Penerimaan Siswa Baru (SPMB)

## 1. Tujuan
Menyediakan halaman pendaftaran umum berbasis `NIK + nomor HP` yang terpusat (tidak tergantung tiap tema) serta panel admin untuk verifikasi data, dengan pendekatan yang aman tanpa OTP.

## 2. Prisma Schema: struktur data yang dibutuhkan
Tambahkan model berikut ke `prisma/schema.prisma`:

```prisma
enum ApplicantStatus {
  pending
  review
  accepted
  rejected
}

model Applicant {
  id             String          @id @default(cuid())
  nikHash        String
  phoneHash      String
  nikMasked      String
  phoneMasked    String
  fullName       String
  email          String?
  schoolOrigin   String?
  programChoice  String?
  status         ApplicantStatus @default(pending)
  submissionData Json?
  notes          String?
  handledBy      String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}
```

Untuk mendukung submenu di admin, tambahkan struktur data tambahan:

```prisma
model ApplicantPayment {
   id           String     @id @default(cuid())
   applicantId  String
   method       String
   amount       Int
   proofUrl     String?
   status       String     @default("pending")
   notes        String?
   createdAt    DateTime   @default(now())
   updatedAt    DateTime   @updatedAt

   applicant    Applicant  @relation(fields: [applicantId], references: [id])
}

model ApplicantValidation {
   id           String     @id @default(cuid())
   applicantId  String
   validatorId  String?
   result       String     // valid/invalid/needs-info
   notes        String?
   createdAt    DateTime   @default(now())
   updatedAt    DateTime   @updatedAt

   applicant    Applicant  @relation(fields: [applicantId], references: [id])
}
```

`ApplicantPayment` mempertahankan catatan transaksi/konfirmasi pembayaran untuk submenu Pembayaran, sedangkan `ApplicantValidation` menyimpan hasil proses verifikasi untuk submenu Validasi Siswa.

Penjelasan:
- `nikHash`/`phoneHash` menjaga data sensitif agar tidak tersimpan dalam bentuk mentah.
- `nikMasked`/`phoneMasked` untuk ditampilkan di UI (contoh: `12*****890`).
- `submissionData` dapat menyimpan metadata (IP, user-agent, dokumen yang diunggah).

## 3. Alur Teknis (tanpa OTP)
1. **CTA Landing Page**
   - Semua tema menggunakan `LandingSection` dengan slug khusus (`cta-spmb`) yang mengarah ke `/apply`, sehingga tidak perlu membuat halaman terpisah per tema.
2. **Halaman `/apply` (generic)**
   - Letakkan di `app/apply/page.tsx` dan bungkus dengan `ThemeProvider` dari tema aktif agar tampilan mengikuti warna dan tipografi.
   - Form meminta `NIK`, `Nomor HP`, `Nama Lengkap`, `Email (opsional)`, `Asal Sekolah`, dan `Program Pilihan`.
   - Submit menggunakan `/api/spmb/register`:
     * Validasi dengan `zod` (NIK 16 digit numeric, HP 12-15 digit numeric).
     * Hash `NIK` dan `HP` (misal `bcryptjs`) sebelum penyimpanan.
     * Jika `nikHash` sudah ada, kembalikan respon `alreadyRegistered`.
     * Jika baru, simpan record `Applicant` dengan `status: pending` dan `submissionData` memuat metadata request.
     * Tampilkan konfirmasi pengajuan dan pesan bahwa admin akan menindaklanjutinya.
3. **Halaman status (opsional)**
   - Buat endpoint `/api/spmb/status` untuk menerima NIK + HP yang cocok dengan hash, lalu mengembalikan `status` dan `notes`. Terapkan rate limit (misal 5 permintaan per NIK per 10 menit).
4. **Admin Panel**
   - Tambah menu `Penerimaan Siswa` di [`app/admin/AdminLayoutClient.tsx`](app/admin/AdminLayoutClient.tsx#L40-L100) yang hanya bisa diakses `ADMIN/EDITOR`.
   - Siapkan halaman `app/admin/penerimaan-siswa/pendaftaran-baru`, `.../pembayaran`, dan `.../validasi-siswa` untuk menampilkan daftar applicant, transaksi pembayaran, serta catatan validasi.
   - Setiap detail view cukup memperlihatkan `nikMasked`/`phoneMasked`, status, `notes`, dan `handledBy`; data sensitif tetap disembunyikan.

## 4. Keamanan & Validasi
- Hash data sensitif; hanya `nikMasked`/`phoneMasked` yang bisa dibaca di UI.
- Gunakan `zod` untuk validasi payload `/api/spmb/register` dan `/api/spmb/status`.
- Terapkan rate limiting per NIK/HP untuk endpoint status.
- Simpan metadata audit di `submissionData` (timestamp, IP, user agent) untuk pelacakan.
- Pastikan form `/apply` mengirim data lewat HTTPS, serta gunakan header `SameSite=Strict` untuk cookie jika digunakan.

## 5. Langkah Implementasi Awal
1. Update `prisma/schema.prisma` sesuai model `Applicant` dan jalankan `prisma migrate`.
2. Buat API `/api/spmb/register` (+ `/api/spmb/status` bila diinginkan) dengan hashing data.
3. Tambah halaman `/apply` generik yang memanggil API tersebut dan menampilkan konfirmasi.
4. Tambah menu `Penerimaan Siswa` di admin layout dan kerangka halaman admin untuk daftar & detail data.

## 6. Rencana Menu Admin "Penerimaan Siswa"
1. Menu utama **Penerimaan Siswa** sudah ditambahkan ke [`app/admin/AdminLayoutClient.tsx`](app/admin/AdminLayoutClient.tsx#L40-L100) dan hanya terlihat untuk role `ADMIN` atau `EDITOR`.
2. Di bawah menu tersebut sediakan tiga submenu:
   - **Pendaftaran Baru**: menampilkan daftar `Applicant` dengan status `pending/review`, tombol lihat detail yang memunculkan form untuk ubah status/notes serta aksi lanjutkan (misal kirim email konfirmasi) via Prisma.
   - **Pembayaran**: halaman terpisah yang menampilkan informasi pembayaran terkait applicant (misal bukti transfer, metode), dengan filter status pembayaran dan opsi upload/konfirmasi dari admin.
   - **Validasi Siswa**: berisi daftar applicant yang sudah diterima (`accepted`) untuk diverifikasi lebih lanjut sebelum disinkronkan ke sistem akademik, termasuk tombol tolak/terima final.
3. Setiap submenu mengakses data via API internal (mis. `app/api/admin/penerimaan-siswa/...`) dengan guard NextAuth agar hanya admin/ editor yang dapat memodifikasi data.
4. Pastikan setiap submenu menampilkan `nikMasked`/`phoneMasked`, status terakhir, serta catatan `notes` dan `handledBy` agar histori bisa ditelusuri.

Mohon review rencana ini terlebih dahulu; setelah disetujui saya lanjutkan implementasi secara bertahap.

## 7. Status Implementasi
- ✅ Prisma schema baru (Applicant/Payment/Validation) sudah masuk dan migrasi dijalankan berikut seeding data contoh.
- ✅ `/apply` generic sudah tersedia dengan `ThemeProvider`, `ApplyForm`, serta link di tiap navbar tema.
- ✅ API `/api/spmb/register` dan `/api/spmb/status` saat ini melakukan hashing giat dan menjaga rate limit.
- ✅ Admin Penerimaan Siswa memiliki daftar, breadcrumbs, detail view, dan update API dengan guard role `ADMIN`/`EDITOR`.
- 🟡 Next: lengkapi detail halaman pembayaran/validasi untuk upload bukti dan verifikasi lanjutan (sesuai roadmap).
