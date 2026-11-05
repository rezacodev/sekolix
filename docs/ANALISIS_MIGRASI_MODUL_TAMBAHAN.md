# Analisis Migrasi Modul Tambahan

Dokumen ini menganalisis tabel, dependensi, dan tools yang dibutuhkan untuk menerapkan 10 modul tambahan di [ROADMAP_MODUL_TAMBAHAN.md](./ROADMAP_MODUL_TAMBAHAN.md).

Analisis ini berdasarkan cek ringan terhadap `prisma/schema.prisma`, `package.json`, dan dokumen roadmap. Ini belum berupa migration final dan belum menggantikan desain detail per sprint.

## Baseline Schema Saat Ini

Beberapa fondasi penting sudah tersedia:

| Area | Model/Enum yang Sudah Ada | Catatan |
|------|---------------------------|---------|
| Auth | `User`, `UserRole`, `Account`, `Session` | `UserRole` sudah memiliki `SUPERADMIN`, `ADMIN`, `GURU`, `STAFF`, `MURID`, `ORANGTUA`, legacy `EDITOR`, `USER` |
| Permission | `RolePermission` | Sudah cocok untuk CASL-style permission, tetapi masih berbasis enum `UserRole` |
| GTK | `Staff`, `StaffRole` | Data pegawai/guru sudah kaya, tapi belum ada absensi/cuti/dokumen operasional |
| Siswa | `PesertaDidik` | Data orang tua ada sebagai field, tapi belum ada relasi akun wali dan belum ada `userId` langsung ke `User` |
| Akademik | `TahunAjaran`, `Rombel`, `Subject`, `Grade`, `Attendance`, `ReportCard` | Bisa dipakai oleh portal orang tua, BK, integrasi data, dan laporan |
| Ruang | `Room` | Bisa direuse untuk inventaris, peminjaman ruang, dan sarpras |
| Komunikasi | `Message`, `MessageSenderType` | Sudah punya tipe `PARENT`, tetapi butuh identitas parent yang jelas |
| Media/File | `Media`, Cloudinary integration | Bisa dipakai untuk dokumen pegawai, bukti bayar, arsip surat, dan lampiran |
| Integrasi | `ApiKey`, `WebhookConfig` | Sudah tersedia untuk API eksternal dan webhook |
| Notifikasi | `EmailNotificationConfig`, `InAppNotificationSetting` | Baru pengaturan; belum terlihat model notification event/recipient permanen |

## Rekomendasi Strategi Migrasi

1. Buat fondasi lintas modul terlebih dahulu: identity link, audit log, approval, notification, file asset, dan sequence number.
2. Tambahkan modul P1 dengan dampak tinggi: portal orang tua, keuangan, BK.
3. Tambahkan modul operasional P2: perpustakaan, inventaris, pegawai.
4. Tambahkan modul administratif P3: TU/surat, ekstrakurikuler, integrasi data.
5. Hindari menambah terlalu banyak enum yang sering berubah. Untuk role operasional seperti BENDAHARA, BK, PUSTAKAWAN, SARPRAS, pertimbangkan tabel role assignment agar lebih fleksibel daripada memperbesar `UserRole`.

## Migrasi Fondasi Lintas Modul

### 0.1 Identity Link untuk Siswa dan Orang Tua

Masalah utama: `PesertaDidik` menyimpan data orang tua sebagai field, tetapi belum ada model akun wali yang terhubung ke siswa. Portal siswa juga akan lebih kuat jika siswa punya relasi eksplisit ke `User`.

**Perubahan disarankan:**

| Tabel/Perubahan | Tujuan |
|-----------------|--------|
| Tambah `PesertaDidik.userId String? @unique` | Menghubungkan siswa aktif ke akun `User` role `MURID` |
| `GuardianProfile` | Profil orang tua/wali yang terhubung ke akun `User` role `ORANGTUA` |
| `GuardianStudent` | Relasi many-to-many wali dan siswa, mendukung multi-anak dan multi-wali |

**Field penting `GuardianProfile`:**
- `id`
- `userId`
- `name`
- `nik`
- `phone`
- `email`
- `address`
- `occupation`
- `relationshipDefault`
- `isActive`
- `createdAt`, `updatedAt`, `deletedAt`

**Field penting `GuardianStudent`:**
- `id`
- `guardianId`
- `studentId`
- `relationship`
- `isPrimary`
- `canReceiveBilling`
- `canReceiveAcademicReport`
- `canPickUpStudent`
- `verifiedAt`
- `createdAt`, `updatedAt`

**Index/constraint:**
- `GuardianProfile.userId @unique`
- `GuardianStudent @@unique([guardianId, studentId])`
- index `studentId`, `guardianId`

### 0.2 Permission dan Role Operasional

Saat ini `RolePermission` berbasis `UserRole`. Untuk role granular, ada dua opsi.

**Opsi A: tambah enum `UserRole`**
- Tambah `KEPALA_SEKOLAH`, `WAKA`, `TU`, `BENDAHARA`, `BK`, `PUSTAKAWAN`, `SARPRAS`.
- Kelebihan: cepat dan sesuai `RolePermission`.
- Risiko: enum makin kaku dan migration enum PostgreSQL perlu hati-hati.

**Opsi B: role assignment dinamis**
- Tambah `AccessRole`, `UserAccessRole`, `AccessPermission`.
- Kelebihan: role sekolah bisa dikonfigurasi tanpa migration baru.
- Risiko: butuh refactor permission builder.

**Rekomendasi:** untuk produk sekolah multi-kebutuhan, pilih Opsi B. `UserRole` tetap dipakai sebagai role besar: `SUPERADMIN`, `ADMIN`, `STAFF`, `GURU`, `MURID`, `ORANGTUA`.

**Tabel disarankan:**
- `AccessRole`
- `UserAccessRole`
- `AccessPermission`

### 0.3 Audit, Activity Log, dan Approval

Modul tambahan menyentuh pembayaran, catatan BK, dokumen pegawai, dan data siswa. Semua perlu jejak perubahan.

**Tabel disarankan:**

| Tabel | Fungsi |
|-------|--------|
| `ActivityLog` | Catatan aktivitas umum: login, create, update, delete, export |
| `AuditTrail` | Snapshot perubahan field sensitif sebelum/sesudah |
| `ApprovalRequest` | Permintaan persetujuan perubahan data atau aksi penting |
| `ApprovalStep` | Step approval jika butuh lebih dari satu approver |

**Field penting `ActivityLog`:**
- `id`
- `actorUserId`
- `actorName`
- `module`
- `action`
- `entityType`
- `entityId`
- `metadata Json?`
- `ipAddress`
- `userAgent`
- `createdAt`

**Field penting `AuditTrail`:**
- `id`
- `actorUserId`
- `entityType`
- `entityId`
- `action`
- `before Json?`
- `after Json?`
- `reason`
- `createdAt`

### 0.4 Notification Event

Schema saat ini punya setting notifikasi, tetapi modul baru butuh notifikasi aktual per user.

**Tabel disarankan:**
- `Notification`
- `NotificationRecipient`
- `NotificationDelivery`

**Use case:**
- tagihan baru
- pembayaran diterima/ditolak
- siswa alfa
- izin disetujui
- surat selesai
- buku terlambat
- kasus BK perlu tindak lanjut

### 0.5 File Asset Terpusat

Model `Media` sudah ada untuk landing/media. Untuk dokumen privat, lebih aman membuat model generik yang bisa dikaitkan ke modul.

**Tabel disarankan:**
- `FileAsset`

**Field penting:**
- `id`
- `ownerType`
- `ownerId`
- `module`
- `fileName`
- `mimeType`
- `size`
- `url`
- `storageProvider`
- `storageKey`
- `visibility`
- `uploadedBy`
- `createdAt`
- `deletedAt`

**Catatan:** bukti bayar, dokumen pegawai, arsip surat, file BK, dan lampiran import sebaiknya memakai `FileAsset`, bukan field URL tersebar.

### 0.6 Sequence Number

Surat, kwitansi, barcode aset, dan kode eksemplar buku butuh nomor berurutan yang aman.

**Tabel disarankan:**
- `NumberSequence`

**Field penting:**
- `id`
- `scope`
- `prefix`
- `year`
- `currentNumber`
- `padding`
- `format`
- `updatedAt`

## 1. Portal Orang Tua/Wali

**Tergantung pada:** `PesertaDidik`, `User`, `Message`, `Attendance`, `Grade`, `ReportCard`, `Assignment`, `Notification`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `GuardianProfile` | Profil wali/orang tua |
| `GuardianStudent` | Relasi wali ke siswa |
| `StudentLeaveRequest` | Pengajuan izin/sakit dari orang tua |
| `StudentPickupAuthorization` | Opsional, otorisasi penjemput |

**Enum disarankan:**
- `GuardianRelationship`: FATHER, MOTHER, GUARDIAN, OTHER
- `LeaveRequestStatus`: PENDING, APPROVED, REJECTED, CANCELLED
- `LeaveRequestType`: SICK, PERMISSION, FAMILY_EVENT, OTHER

**Catatan migrasi:**
- Data `fatherName`, `motherName`, `guardianName`, dan kontak di `PesertaDidik` bisa dimigrasikan menjadi `GuardianProfile` awal.
- Jangan hapus field lama dulu. Simpan sebagai snapshot/backward compatibility sampai fitur wali stabil.

## 2. Keuangan/SPP

**Tergantung pada:** `PesertaDidik`, `Rombel`, `TahunAjaran`, `GuardianProfile`, `FileAsset`, `ActivityLog`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `FeeType` | Master jenis tagihan: SPP, daftar ulang, kegiatan |
| `BillingBatch` | Batch generate tagihan per rombel/periode |
| `StudentInvoice` | Tagihan utama per siswa |
| `StudentInvoiceItem` | Rincian item tagihan |
| `Payment` | Pembayaran yang diterima |
| `PaymentAllocation` | Alokasi pembayaran ke invoice/item |
| `PaymentProof` | Bukti bayar dari wali/siswa |
| `DiscountProgram` | Diskon/beasiswa |
| `StudentDiscount` | Diskon yang melekat ke siswa |
| `PaymentGatewayTransaction` | Transaksi payment gateway |
| `Receipt` | Kwitansi dan nomor bukti pembayaran |

**Enum disarankan:**
- `InvoiceStatus`: DRAFT, ISSUED, PARTIAL, PAID, OVERDUE, CANCELLED
- `PaymentStatus`: PENDING, VERIFIED, REJECTED, REFUNDED
- `PaymentMethod`: CASH, BANK_TRANSFER, PAYMENT_GATEWAY, OTHER

**Index penting:**
- `StudentInvoice(studentId, status)`
- `StudentInvoice(tahunAjaranId, dueDate)`
- `Payment(status, paidAt)`
- `Receipt(receiptNumber @unique)`

**Catatan migrasi:**
- `ApplicantPayment` untuk SPMB jangan digabung langsung dengan `Payment` sekolah karena konteksnya berbeda. Bisa dibuat adapter laporan gabungan nanti.

## 3. BK, Kedisiplinan, Prestasi

**Tergantung pada:** `PesertaDidik`, `Staff`, `GuardianProfile`, `Message`, `ActivityLog`, `AuditTrail`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `StudentCounselingCase` | Kasus/catatan BK utama |
| `CounselingSession` | Sesi konseling dan tindak lanjut |
| `DisciplineRule` | Master pelanggaran dan poin |
| `DisciplineRecord` | Catatan pelanggaran siswa |
| `StudentAchievement` | Prestasi akademik/non-akademik |
| `StudentDevelopmentNote` | Catatan perkembangan umum |
| `ParentSummonLetter` | Surat panggilan orang tua terkait BK |

**Enum disarankan:**
- `CounselingCaseStatus`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `DisciplineSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- `AchievementLevel`: SCHOOL, DISTRICT, CITY, PROVINCE, NATIONAL, INTERNATIONAL
- `VisibilityLevel`: PRIVATE_BK, HOMEROOM, TEACHER, PARENT_VISIBLE

**Catatan migrasi:**
- Field `PesertaDidik.achievements` bisa tetap sebagai legacy text. Data baru pakai `StudentAchievement`.
- Catatan BK wajib memakai audit trail karena sensitif.

## 4. Perpustakaan

**Tergantung pada:** `PesertaDidik`, `Staff`, `User`, `FileAsset` untuk cover opsional.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `LibraryCategory` | Kategori buku |
| `LibraryPublisher` | Data penerbit opsional |
| `LibraryAuthor` | Data penulis opsional |
| `LibraryBook` | Data bibliografi |
| `LibraryBookAuthor` | Relasi buku-penulis |
| `LibraryCopy` | Eksemplar fisik dengan barcode |
| `LibraryMember` | Anggota dari siswa/staff |
| `LibraryLoan` | Transaksi peminjaman |
| `LibraryFine` | Denda keterlambatan/kerusakan |
| `LibraryReservation` | Reservasi buku |

**Enum disarankan:**
- `LibraryMemberType`: STUDENT, STAFF
- `LibraryCopyStatus`: AVAILABLE, BORROWED, LOST, DAMAGED, IN_REPAIR
- `LibraryLoanStatus`: ACTIVE, RETURNED, OVERDUE, LOST

**Index penting:**
- `LibraryCopy.barcode @unique`
- `LibraryLoan(memberId, status)`
- `LibraryLoan(copyId, status)`
- `LibraryBook(isbn)`

## 5. Inventaris/Sarpras

**Tergantung pada:** `Room`, `Staff`, `FileAsset`, `NumberSequence`, `ActivityLog`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `AssetCategory` | Kategori aset |
| `Asset` | Master aset |
| `AssetLocationHistory` | Riwayat lokasi/mutasi |
| `AssetConditionHistory` | Riwayat kondisi aset |
| `AssetLoan` | Peminjaman aset/ruang |
| `AssetMaintenance` | Jadwal dan catatan pemeliharaan |
| `AssetStockOpname` | Sesi opname |
| `AssetStockOpnameItem` | Hasil cek per aset |

**Enum disarankan:**
- `AssetStatus`: ACTIVE, BORROWED, MAINTENANCE, LOST, DISPOSED
- `AssetCondition`: GOOD, FAIR, DAMAGED, BROKEN
- `AssetLoanStatus`: REQUESTED, APPROVED, BORROWED, RETURNED, REJECTED

**Catatan migrasi:**
- `Room` bisa dipakai sebagai lokasi utama, tetapi tetap butuh lokasi fleksibel untuk aset yang tidak berada di ruang kelas.
- Gunakan `NumberSequence` untuk kode aset dan QR label.

## 6. Manajemen Pegawai Lanjutan

**Tergantung pada:** `Staff`, `User`, `FileAsset`, `Notification`, `ApprovalRequest`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `StaffAttendance` | Absensi pegawai |
| `StaffLeaveRequest` | Pengajuan cuti/izin pegawai |
| `StaffDutySchedule` | Jadwal piket/tugas |
| `StaffDocument` | Dokumen kepegawaian |
| `StaffContract` | Kontrak atau masa kerja |
| `StaffWorkloadRecord` | Beban kerja non-mengajar |

**Enum disarankan:**
- `StaffAttendanceStatus`: PRESENT, LATE, SICK, PERMISSION, ABSENT, LEAVE
- `StaffLeaveStatus`: PENDING, APPROVED, REJECTED, CANCELLED
- `StaffDocumentType`: SK, CERTIFICATE, CONTRACT, IDENTITY, OTHER

**Catatan migrasi:**
- Jangan memasukkan dokumen sebagai JSON di `Staff`. Pakai `StaffDocument` agar bisa audit, expire reminder, dan file management.

## 7. Surat Menyurat & Administrasi TU

**Tergantung pada:** `Staff`, `PesertaDidik`, `SchoolIdentity`, `FileAsset`, `NumberSequence`, `ApprovalRequest`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `LetterTemplate` | Template surat dengan variabel |
| `IncomingLetter` | Surat masuk |
| `OutgoingLetter` | Surat keluar |
| `LetterDisposition` | Disposisi surat |
| `GeneratedLetter` | Surat hasil generate |
| `LetterApproval` | Approval surat jika butuh |
| `ArchiveRecord` | Arsip digital umum |

**Enum disarankan:**
- `LetterStatus`: DRAFT, WAITING_APPROVAL, APPROVED, SENT, ARCHIVED, CANCELLED
- `DispositionStatus`: OPEN, IN_PROGRESS, DONE
- `ArchiveVisibility`: INTERNAL, RESTRICTED, PUBLIC_LINK

**Tools penting:**
- PDF generation sudah tersedia: `pdf-lib`, `pdfkit`.
- QR validasi butuh dependency tambahan jika ingin QR image otomatis.

## 8. Ekstrakurikuler & Kegiatan

**Tergantung pada:** `PesertaDidik`, `Staff`, `AcademicEvent`, `Attendance`, landing CMS opsional.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `Extracurricular` | Master ekskul |
| `ExtracurricularCoach` | Pembina ekskul |
| `ExtracurricularMember` | Anggota siswa |
| `ExtracurricularSchedule` | Jadwal latihan/kegiatan |
| `ExtracurricularAttendance` | Presensi ekskul |
| `ExtracurricularAchievement` | Prestasi ekskul |
| `ExtracurricularRegistration` | Pendaftaran dari portal siswa |

**Enum disarankan:**
- `ExtracurricularMemberStatus`: REGISTERED, ACTIVE, INACTIVE, ALUMNI
- `ExtracurricularRegistrationStatus`: PENDING, APPROVED, REJECTED
- `ExtracurricularAttendanceStatus`: PRESENT, SICK, PERMISSION, ABSENT

**Catatan migrasi:**
- Prestasi siswa bisa memakai `StudentAchievement` dengan tipe `EXTRACURRICULAR`, atau dibuat tabel khusus. Rekomendasi: gunakan `StudentAchievement` sebagai sumber utama agar portofolio siswa tidak tersebar.

## 9. Integrasi Data Pendidikan Indonesia

**Tergantung pada:** hampir semua data akademik, `ApiKey`, `ActivityLog`, `FileAsset`.

**Tabel baru:**

| Tabel | Fungsi |
|-------|--------|
| `DataIntegrationProfile` | Profil format integrasi: Dapodik, EMIS, e-Rapor friendly |
| `DataFieldMapping` | Mapping field internal ke field target |
| `ImportBatch` | Riwayat import |
| `ImportBatchRow` | Row import dan hasil validasi |
| `ExportBatch` | Riwayat export |
| `DataValidationRule` | Aturan validasi data |
| `DataValidationIssue` | Temuan data tidak lengkap/duplikat |

**Enum disarankan:**
- `IntegrationDirection`: IMPORT, EXPORT
- `ImportBatchStatus`: UPLOADED, VALIDATED, IMPORTED, FAILED, ROLLED_BACK
- `ValidationSeverity`: INFO, WARNING, ERROR

**Catatan migrasi:**
- Simpan file sumber import di `FileAsset`.
- Simpan snapshot row import agar rollback dan audit bisa dilakukan.
- Jangan hardcode satu format nasional sebagai schema utama; gunakan mapping agar fleksibel.

## 10. Audit, Keamanan, Tata Kelola Lanjutan

Sebagian sudah dibahas sebagai fondasi. Untuk fase lanjutan:

**Tabel tambahan opsional:**

| Tabel | Fungsi |
|-------|--------|
| `UserDeviceSession` | Tracking device/session pengguna |
| `SecurityAlert` | Alert aktivitas mencurigakan |
| `DataRetentionPolicy` | Kebijakan retensi data per modul |
| `DataExportRequest` | Approval/riwayat export data sensitif |

**Catatan migrasi:**
- Jika memakai NextAuth `Session`, jangan duplikasi session inti. `UserDeviceSession` cukup menyimpan metadata device dan referensi `sessionToken` hash jika diperlukan.

## Urutan Migration yang Disarankan

| Tahap | Migration | Isi |
|-------|-----------|-----|
| 1 | `add_identity_links_and_file_assets` | `PesertaDidik.userId`, `GuardianProfile`, `GuardianStudent`, `FileAsset`, `NumberSequence` |
| 2 | `add_access_roles_and_audit` | `AccessRole`, `UserAccessRole`, `AccessPermission`, `ActivityLog`, `AuditTrail`, `ApprovalRequest`, `ApprovalStep` |
| 3 | `add_notifications` | `Notification`, `NotificationRecipient`, `NotificationDelivery` |
| 4 | `add_parent_portal_models` | `StudentLeaveRequest`, `StudentPickupAuthorization` |
| 5 | `add_finance_models` | `FeeType`, `BillingBatch`, `StudentInvoice`, `Payment`, `Receipt`, diskon, gateway transaction |
| 6 | `add_bk_student_development_models` | BK, pelanggaran, prestasi, tindak lanjut |
| 7 | `add_library_models` | Katalog, eksemplar, anggota, peminjaman, denda |
| 8 | `add_inventory_models` | Aset, kondisi, mutasi, peminjaman, pemeliharaan |
| 9 | `add_staff_operations_models` | Absensi pegawai, cuti, dokumen, kontrak, piket |
| 10 | `add_office_letters_models` | Template, surat masuk/keluar, disposisi, arsip |
| 11 | `add_extracurricular_models` | Ekskul, anggota, jadwal, presensi |
| 12 | `add_data_integration_models` | Mapping, import/export batch, validation issue |

## Tools dan Dependency

### Sudah Tersedia

| Tool | Kegunaan |
|------|----------|
| Prisma | ORM dan migration |
| PostgreSQL | Database utama |
| NextAuth | Auth/session |
| CASL | Permission/ability |
| bcryptjs | Hash password |
| Cloudinary/next-cloudinary | Upload file/media |
| pdf-lib/pdfkit | Generate PDF kwitansi, surat, laporan |
| exceljs | Import/export Excel |
| nodemailer | Email notification |
| zod/react-hook-form | Validasi form |
| Recharts | Dashboard/laporan visual |
| FullCalendar | Kalender akademik/kegiatan |

### Disarankan Ditambah Saat Implementasi

| Kebutuhan | Dependency/Tools Kandidat | Catatan |
|----------|----------------------------|---------|
| QR code surat/aset/buku | `qrcode` atau `@zxing/browser` | `qrcode` cukup untuk generate PNG/SVG QR |
| Barcode scanner browser | native camera + `@zxing/browser` | Untuk perpustakaan dan aset |
| Payment gateway | Midtrans Snap/Core API atau Xendit SDK/API | Pilih satu dulu agar alur tidak bercabang |
| Rate limiting API sensitif | Upstash Redis, `rate-limiter-flexible`, atau middleware custom | Penting untuk login, upload bukti bayar, ujian, import |
| Background job | Vercel Cron, BullMQ + Redis, atau database job table | Untuk reminder tagihan, buku terlambat, email massal |
| Private file access | signed URL Cloudinary atau storage provider privat | Dokumen BK/pegawai/bukti bayar jangan public open URL |
| Sanitasi HTML template surat | `sanitize-html` jika template rich text user-generated | Mengurangi risiko XSS saat preview/generate |
| CSV parsing besar | `papaparse` atau stream parser | ExcelJS cukup untuk XLSX, CSV besar bisa lebih efisien |

## Risiko Desain yang Perlu Diputuskan

1. **Role operasional pakai enum atau tabel dinamis.** Jika target sekolah berbeda-beda, tabel dinamis lebih tahan lama.
2. **File privat.** Cloudinary publik cocok untuk media landing, tetapi dokumen sensitif butuh signed URL atau provider privat.
3. **Nominal uang.** Gunakan `Int` dalam rupiah untuk menghindari floating point.
4. **Audit volume.** Audit dan activity log akan tumbuh besar; perlu index dan retensi.
5. **Portal orang tua multi-anak.** Relasi many-to-many wajib sejak awal.
6. **Data BK.** Harus ada visibilitas ketat dan audit trail.
7. **Import data.** Jangan langsung commit semua row tanpa preview dan validation issue.

## Checklist Sebelum Membuat Migration Final

- [ ] Tentukan strategi role: enum tambahan atau dynamic access role.
- [ ] Tentukan storage dokumen privat.
- [ ] Tentukan payment gateway pertama atau tunda ke fase lanjutan.
- [ ] Tentukan apakah `PesertaDidik.userId` akan diisi untuk semua siswa atau opsional bertahap.
- [ ] Tentukan standar soft delete: `deleted_at` atau `deletedAt`.
- [ ] Tentukan naming convention Prisma baru: camelCase atau snake_case dengan `@map`.
- [ ] Tentukan retensi audit log.
- [ ] Buat ERD per modul sebelum migration besar.
- [ ] Pecah migration per modul agar rollback dan review lebih mudah.
