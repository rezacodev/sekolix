# Dokumentasi Sistem Kode Registrasi Otomatis

## 📋 Ringkasan Implementasi

Anda telah berhasil menambahkan sistem kode registrasi otomatis yang ter-generate saat calon siswa melakukan pendaftaran di halaman apply. Sistem ini dilengkapi dengan pengaturan admin untuk mengatur format kode yang akan di-generate.

## ✨ Fitur Utama

### 1. **Auto-Generate Registration Code**
- Kode registrasi di-generate otomatis saat calon siswa mendaftar
- Format: `PREFIX + YEAR_CODE + PADDED_NUMBER + SUFFIX`
- Contoh: `DAFTAR0001`, `DAFTAR240001` (dengan year code), dst

### 2. **Admin Settings untuk Kode Registrasi**
- **Prefix**: Awalan kode (default: "DAFTAR")
- **Suffix**: Akhiran kode (opsional)
- **Padding**: Jumlah digit untuk nomor urut (1-10 digit)
- **Include Year Code**: Opsi untuk menyertakan kode tahun ajaran
- **Reset Counter**: Tombol untuk mereset nomor urut ke 1

### 3. **Kode Tahun Ajaran**
- Field baru `yearCode` di model `TahunAjaran`
- Digunakan saat `includeYearCode = true`
- Contoh: "24" untuk 2024, "25" untuk 2025

### 4. **Display di Landing Page**
- Kode registrasi ditampilkan di success message saat pendaftaran berhasil
- User dapat menyalin kode untuk referensi

### 5. **Display di Admin Panel**
- Kolom "Kode Registrasi" di tabel pendaftaran baru
- Format kode dengan styling khusus

## 📁 File-File yang Ditambahkan/Dimodifikasi

### Database & Schema
- **Migration**: `prisma/migrations/20251215125513_add_registration_code_year_code/migration.sql`
- **Schema Models**:
  - `AdmissionRegistrationCodeSetting`: Menyimpan pengaturan kode registrasi
  - `Applicant.registrationCode`: Field untuk menyimpan kode yang di-generate
  - `TahunAjaran.yearCode`: Field untuk kode tahun ajaran

### Backend - Library & Utilities
- **`src/lib/spmb/registrationCodeGenerator.ts`** (BARU)
  - `generateRegistrationCode(yearId?)`: Generate kode unik untuk setiap applicant
  - `getRegistrationCodeSettings()`: Ambil pengaturan saat ini
  - `resetRegistrationCodeCounter(startNumber?)`: Reset counter
  - `updateRegistrationCodeSettings(data)`: Update pengaturan

### Backend - API Endpoints
- **`app/api/admin/penerimaan-siswa/settings/registration-code/route.ts`** (BARU)
  - `GET`: Ambil pengaturan kode registrasi
  - `POST`: Update pengaturan kode registrasi

- **`app/api/penerimaan-siswa/spmb/register/route.ts`** (MODIFIED)
  - Import `generateRegistrationCode`
  - Auto-generate kode saat membuat applicant baru
  - Return registration code di response

- **`app/api/admin/penerimaan-siswa/settings/years/route.ts`** (MODIFIED)
  - Support field `yearCode` di POST request

### Frontend - Admin Panel
- **`app/admin/penerimaan-siswa/settings/registration-code/page.tsx`** (BARU)
  - Page untuk registration code settings

- **`app/admin/penerimaan-siswa/settings/registration-code/RegistrationCodeSettingsClient.tsx`** (BARU)
  - Component untuk manage registration code settings
  - Form input untuk prefix, suffix, padding, include year code
  - Preview kode yang akan di-generate
  - Tombol reset counter

- **`app/admin/penerimaan-siswa/settings/layout.tsx`** (MODIFIED)
  - Tambah tab "Kode Registrasi" dengan icon Barcode

- **`app/admin/penerimaan-siswa/settings/years/YearsSettingsClient.tsx`** (MODIFIED)
  - Tambah field "Kode Tahun" di form tahun ajaran

### Frontend - Landing Page
- **`src/components/spmb/ApplyForm.tsx`** (MODIFIED)
  - Update feedback type untuk include `registrationCode`
  - Tampilkan kode registrasi di success message
  - Tambah tombol "Salin" untuk copy code

### Admin Table
- **`app/admin/penerimaan-siswa/pendaftaran-baru/columns.tsx`** (MODIFIED)
  - Tambah kolom "Kode Registrasi" di awal tabel
  - Display kode dengan styling `font-mono` dan background slate-100

### Seed Files
- **`prisma/seed-all.mjs`** (BARU): Setup base data
- **`prisma/seed-applicants.mjs`** (BARU): Seed applicants
- **`prisma/seed-fresh.mjs`** (BARU): Clear dan reseed dengan data baru (sudah dijalankan)

## 🚀 Cara Menggunakan

### 1. **Setup di Admin Panel**

#### Konfigurasi Tahun Ajaran
1. Buka: **Admin → Penerimaan Siswa → Pengaturan Penerimaan → Tahun Ajaran**
2. Tambahkan tahun ajaran baru (jika belum ada)
3. **Penting**: Isi field "Kode Tahun" (contoh: "24", "2425", "2024-2025")
4. Aktifkan tahun ajaran tersebut (tombol "Jadikan aktif")

#### Konfigurasi Kode Registrasi
1. Buka: **Admin → Penerimaan Siswa → Pengaturan Penerimaan → Kode Registrasi**
2. Atur pengaturan:
   - **Prefix**: Awalan kode (default: "DAFTAR")
   - **Suffix**: Akhiran kode (opsional, contoh: "-2024")
   - **Panjang Padding**: Pilih jumlah digit untuk nomor urut
   - **Sertakan Kode Tahun**: Centang jika ingin memasukkan tahun ajaran
3. Lihat preview kode di bagian "Pratinjau Kode"
4. Klik "Simpan Pengaturan"
5. Gunakan "Reset Counter ke 1" jika ingin mereset nomor urut (opsional)

### 2. **Pendaftaran di Landing Page**

1. User membuka halaman: `/apply`
2. Isi form pendaftaran (NIK, No HP, Nama Lengkap, etc)
3. Klik "Kirim Pendaftaran"
4. Sistem otomatis generate kode registrasi
5. Success message menampilkan kode yang di-generate
6. User dapat menyalin kode untuk referensi

### 3. **Monitoring di Admin Panel**

1. Buka: **Admin → Penerimaan Siswa → Pendaftaran Baru**
2. Lihat kolom "Kode Registrasi" di awal tabel
3. Setiap applicant baru akan memiliki kode unik

## 📊 Format Kode Registrasi

### Komponen Kode
```
PREFIX + YEAR_CODE + PADDED_NUMBER + SUFFIX
```

### Contoh Konfigurasi

#### Konfigurasi 1 (Standar)
- **Prefix**: DAFTAR
- **Suffix**: (kosong)
- **Padding**: 4 digit
- **Include Year Code**: Ya (dengan yearCode "24")
- **Hasil**: `DAFTAR240001`, `DAFTAR240002`, dst

#### Konfigurasi 2 (Dengan Tahun Lengkap)
- **Prefix**: REG
- **Suffix**: -2024
- **Padding**: 5 digit
- **Include Year Code**: Tidak
- **Hasil**: `REG00001-2024`, `REG00002-2024`, dst

#### Konfigurasi 3 (Sederhana)
- **Prefix**: SISWA
- **Suffix**: (kosong)
- **Padding**: 3 digit
- **Include Year Code**: Tidak
- **Hasil**: `SISWA001`, `SISWA002`, dst

## 🗄️ Data Dummy

Sudah di-seed **10 data dummy applicant** dengan nama-nama calon siswa lengkap:
1. Ahmad Rizki Pratama - `DAFTAR0001`
2. Siti Nurhaliza Wijaya - `DAFTAR0002`
3. Budi Hartono Santoso - `DAFTAR0003`
4. Eka Putri Ramadhani - `DAFTAR0004`
5. Doni Setiawan Kusuma - `DAFTAR0005`
6. Rina Anggraeni Hidayat - `DAFTAR0006`
7. Fajar Budiman Rasyid - `DAFTAR0007`
8. Lestari Wijaya Kusuma - `DAFTAR0008`
9. Muhammad Ihsan Hidayat - `DAFTAR0009`
10. Nadia Salsabila Rahman - `DAFTAR0010`

Untuk reseed dengan data baru, jalankan:
```bash
node prisma/seed-fresh.mjs
```

## 🔄 Alur Kerja Auto-Generate

```
1. User submit form di /apply
   ↓
2. API /api/penerimaan-siswa/spmb/register menerima request
   ↓
3. Validasi data (NIK, Phone, Name, Program, Academic Year)
   ↓
4. Panggil generateRegistrationCode(academicYearId)
   ├─ Ambil registration code settings
   ├─ Tentukan year code dari TahunAjaran (jika includeYearCode = true)
   ├─ Pad nomor urut dengan 0
   ├─ Gabungkan: PREFIX + YEAR_CODE + PADDED_NUMBER + SUFFIX
   └─ Increment counter nextNumber
   ↓
5. Create Applicant dengan registrationCode
   ↓
6. Return response dengan:
   - status: "pending"
   - message: "Data Anda sudah tercatat. Kode registrasi: DAFTAR0001..."
   - registrationCode: "DAFTAR0001"
   - id: applicant_id
   ↓
7. Frontend tampilkan kode di success message
```

## 📝 Catatan Penting

1. **Tahun Ajaran Harus Aktif**: Kode registrasi hanya bisa di-generate jika ada tahun ajaran yang aktif
2. **Program Harus Aktif**: Setidaknya satu program harus aktif untuk allow pendaftaran
3. **Year Code**: Field `yearCode` di TahunAjaran bersifat opsional tapi sangat disarankan untuk di-isi jika menggunakan `includeYearCode = true`
4. **Unique Registration Code**: Setiap applicant mendapat kode unik. Jika ada error saat generate, user bisa coba register lagi
5. **Counter Reset**: Gunakan "Reset Counter ke 1" dengan hati-hati karena bisa menghasilkan duplikat kode jika ada applicant lama

## 🛠️ Troubleshooting

### Kode Tidak Ter-Generate
- Periksa apakah tahun ajaran aktif di menu "Tahun Ajaran"
- Periksa apakah ada minimal 1 program yang aktif
- Check registration code settings di menu "Kode Registrasi"

### Tahun Ajaran Tidak Muncul di Form
- Pastikan tahun ajaran sudah di-buat di menu "Tahun Ajaran"
- Pastikan tahun ajaran sudah di-aktifkan

### Year Code Tidak Muncul di Kode
- Periksa apakah `Sertakan Kode Tahun` sudah dicentang
- Periksa apakah field "Kode Tahun" di TahunAjaran sudah diisi

## 📞 Support

Untuk pertanyaan atau masalah, silakan hubungi developer atau cek file dokumentasi teknis di `/doc`.

---

**Status**: ✅ Implementasi Selesai  
**Tanggal**: 15 Desember 2024  
**Version**: 1.0.0
