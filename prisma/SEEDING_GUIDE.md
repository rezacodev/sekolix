# Prisma Seeding – Refactor Guide & Best Practice

Dokumen ini berisi:
1. Evaluasi struktur seed Prisma saat ini
2. Panduan refaktor agar scalable
3. Best practice pembuatan seed ke depan
4. Pola yang direkomendasikan untuk fitur baru

Cocok untuk aplikasi skala menengah–besar (Sistem Akademik, ERP, LMS, dsb).

---

## 1. Gambaran Struktur Seed Saat Ini

Struktur seed saat ini:

```text
prisma/seeds/
├── index.js
├── landing-page/
├── manajemen-akademik/
│   ├── foundation/
│   ├── curriculum/
│   ├── classes/
│   ├── students/
│   ├── users/
│   ├── utils/
│   ├── seed-assignments.ts
│   ├── seed-grades.ts
│   ├── seed-syllabus-rpp.ts
│   └── ...
├── manajemen-guru/
├── penerimaan-siswa/
✅ Kelebihan
Sudah berbasis domain/fitur (sangat bagus)

Tidak berdasarkan tabel mentah

Ada pemisahan modul (akademik, guru, siswa)

Sudah ada util helper

⚠️ Masalah yang Akan Muncul ke Depan
index.js berpotensi jadi God File

Tidak ada pemisahan master vs dummy

Tidak semua seed idempotent (aman dijalankan ulang)

Beberapa file seed terlalu “procedural”

Sulit menjalankan seed per skenario

2. Prinsip Refaktor (WAJIB DIPAHAMI)
Sebelum refaktor, pegang prinsip ini:

Seeder ≠ Script sekali pakai

Seeder harus:

Bisa dijalankan ulang

Bisa dipanggil sebagian

Tidak tergantung urutan implicit

Seeder mengikuti alur bisnis, bukan tabel

3. Struktur Seeder yang Direkomendasikan (Target)
text
Copy code
prisma/seeds/
├── _core/
│   ├── index.ts
│   ├── academic-years.seed.ts
│   ├── roles.seed.ts
│   └── settings.seed.ts
│
├── landing-page/
│   ├── index.ts
│   └── landing-page.seed.ts
│
├── akademik/
│   ├── index.ts
│   ├── foundation.seed.ts
│   ├── curriculum.seed.ts
│   ├── classes.seed.ts
│   ├── subjects.seed.ts
│   ├── rooms.seed.ts
│   └── lesson-times.seed.ts
│
├── users/
│   ├── index.ts
│   ├── admin.seed.ts
│   ├── teacher.seed.ts
│   └── student.seed.ts
│
├── guru/
│   ├── index.ts
│   ├── teaching-materials.seed.ts
│   ├── syllabus.seed.ts
│   └── rpp.seed.ts
│
├── dummy/
│   ├── index.ts
│   ├── assignments.dummy.ts
│   ├── grades.dummy.ts
│   └── submissions.dummy.ts
│
├── scenarios/
│   ├── minimal.seed.ts
│   ├── demo.seed.ts
│   └── full.seed.ts
│
├── utils/
│   ├── prisma.ts
│   └── seed-utils.ts
│
└── seed.ts
4. Cara Refaktor Bertahap (Aman & Realistis)
STEP 1 – Pecah index.js
❌ Jangan semua logic di index.js

ts
Copy code
// seed.ts (root)
import { seedCore } from './_core'
import { seedAkademik } from './akademik'
import { seedUsers } from './users'

async function main() {
  await seedCore()
  await seedUsers()
  await seedAkademik()
}

main()
STEP 2 – Gunakan index.ts per domain
ts
Copy code
// akademik/index.ts
export async function seedAkademik() {
  await seedFoundation()
  await seedCurriculum()
  await seedClasses()
}
➡️ Domain bertindak sebagai orchestrator kecil

STEP 3 – Pastikan Semua Seed Idempotent
❌

ts
Copy code
await prisma.role.create({ data: { name: 'admin' } })
✅

ts
Copy code
await prisma.role.upsert({
  where: { name: 'admin' },
  update: {},
  create: { name: 'admin' },
})
STEP 4 – Pisahkan MASTER vs DUMMY
Jenis	Lokasi	Boleh Production
Master	_core, akademik	✅ Ya
Dummy	dummy/	❌ Tidak

ts
Copy code
if (process.env.NODE_ENV !== 'production') {
  await seedDummy()
}
5. Best Practice Pembuatan Seed ke Depan
5.1 Satu File = Satu Konsep Bisnis
❌ seed-academic-all.ts
✅ curriculum.seed.ts, classes.seed.ts

5.2 Jangan Hardcode ID
❌

ts
Copy code
classId: 1
✅

ts
Copy code
const classA = await prisma.class.findFirst({ where: { name: 'X-A' } })
5.3 Gunakan Helper untuk Relasi Kompleks
ts
Copy code
createAssignments({
  rombel,
  subject,
  teacher,
})
5.4 Gunakan Skenario Seeder
bash
Copy code
npx prisma db seed -- --scenario=demo
ts
Copy code
// scenarios/demo.seed.ts
export async function seedDemo() {
  await seedCore()
  await seedAkademik()
  await seedDummy()
}
6. Pola untuk Fitur Baru (WAJIB IKUT)
Saat fitur baru ditambahkan:

Tentukan domain:

akademik / guru / siswa / keuangan / dll

Buat folder jika perlu

Buat:

xxx.seed.ts

daftarkan di index.ts domain

Jangan sentuh seed domain lain kecuali perlu

7. Anti-Pattern yang Harus Dihindari ❌
Seed saling memanggil lintas domain

Seed membaca file seed lain langsung

Seed menghapus data production

Seed terlalu bergantung urutan implicit

Seed dijadikan migration

8. Kesimpulan
Struktur seed kamu:

✅ Sudah domain-based (bagus)

⚠️ Perlu orchestration & standardisasi

🚀 Sangat potensial untuk jangka panjang

Dengan refaktor bertahap ini:

Penambahan fitur akan lebih aman

Debug seed jauh lebih mudah

Bisa dipakai sebagai standar tim / open-source