import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Comprehensive seed script - setup database dengan:
 * 1. Multiple academic years (hanya 1 yang aktif)
 * 2. Program keahlian
 * 3. Landing page settings
 * 4. Registration code settings per tahun
 * 5. 30 dummy applicants dengan registration code (variasi lengkap, status, dan kelengkapan)
 */

async function main() {
  try {
    console.log("🌱 Starting comprehensive database seeding...\n");

    // Check for --fresh flag to reset database
    const isFresh = process.argv.includes("--fresh");
    
    if (isFresh) {
      console.log("🗑️  Clearing existing data...");
      
      // Delete in correct order (respecting foreign key constraints)
      await prisma.applicant.deleteMany({});
      await prisma.admissionRegistrationCodeSetting.deleteMany({});
      await prisma.admissionLandingSetting.deleteMany({});
      await prisma.program.deleteMany({});
      await prisma.tahunAjaran.deleteMany({});
      
      console.log("✓ Database cleared\n");
    }

    // ============================================
    // 1. SETUP ACADEMIC YEARS (1 active, rest inactive)
    // ============================================
    console.log("📅 Setting up academic years...");

    // Delete existing years if needed for fresh seeding
    // await prisma.tahunAjaran.deleteMany({});

    let years = await prisma.tahunAjaran.findMany();

    if (years.length === 0) {
      // Create 3 academic years
      const yearsData = [
        {
          label: "2023-2024",
          yearCode: "23",
          startDate: new Date("2023-07-01"),
          endDate: new Date("2024-06-30"),
          registrationFee: 500000,
          isActive: false,
        },
        {
          label: "2024-2025",
          yearCode: "24",
          startDate: new Date("2024-07-01"),
          endDate: new Date("2025-06-30"),
          registrationFee: 600000,
          isActive: false,
        },
        {
          label: "2025-2026",
          yearCode: "25",
          startDate: new Date("2025-07-01"),
          endDate: new Date("2026-06-30"),
          registrationFee: 700000,
          isActive: true, // Only this one is active
        },
      ];

      for (const yearData of yearsData) {
        const year = await prisma.tahunAjaran.create({ data: yearData });
        console.log(`  ✓ Created: ${year.label} (Active: ${year.isActive})`);
        years.push(year);
      }
    } else {
      console.log(`  ✓ Found ${years.length} existing academic years`);
      
      // Ensure only 1 year is active
      const activeYears = years.filter(y => y.isActive);
      if (activeYears.length > 1) {
        console.log(`  ⚠️  Found ${activeYears.length} active years, setting only one as active...`);
        
        // Keep the most recent one as active
        const mostRecent = years.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
        
        for (const year of years) {
          if (year.id !== mostRecent.id && year.isActive) {
            await prisma.tahunAjaran.update({
              where: { id: year.id },
              data: { isActive: false },
            });
            console.log(`  ✓ Set ${year.label} to inactive`);
          }
        }
        
        if (!mostRecent.isActive) {
          await prisma.tahunAjaran.update({
            where: { id: mostRecent.id },
            data: { isActive: true },
          });
          console.log(`  ✓ Set ${mostRecent.label} as active`);
        }
      }
    }

    const activeYear = years.find(y => y.isActive);
    console.log(`\n  📍 Active year: ${activeYear.label} (${activeYear.yearCode})\n`);

    // ============================================
    // Academic events seeding (create default KBM if none exist)
    // ============================================
    console.log("\n📌 Seeding academic events (if none present)...");
    for (const y of years) {
      const existingEvents = await prisma.academicEvent.count({ where: { tahunAjaranId: y.id } });
      if (existingEvents === 0) {
        const start = y.startDate || new Date();
        const end = y.endDate || new Date(start.getFullYear(), 11, 31);

        await prisma.academicEvent.create({
          data: {
            tahunAjaranId: y.id,
            title: "KBM (Default)",
            description: "Kegiatan belajar mengajar (default jika tidak ada kegiatan spesifik)",
            startDate: start,
            endDate: end,
          },
        });

        // sample events for the active year
        if (activeYear && y.id === activeYear.id) {
          // national holiday (example)
          const holidayDate = new Date(start.getFullYear(), 11, 25);
          await prisma.academicEvent.create({
            data: {
              tahunAjaranId: y.id,
              title: "Libur Nasional",
              description: "Contoh libur nasional",
              startDate: holidayDate,
              endDate: holidayDate,
            },
          });

          // midterm exam sample
          const utsStart = new Date(start.getFullYear(), 9, 7);
          const utsEnd = new Date(start.getFullYear(), 9, 11);
          await prisma.academicEvent.create({
            data: {
              tahunAjaranId: y.id,
              title: "Ujian Tengah Semester",
              description: "Ujian tengah semester contoh",
              startDate: utsStart,
              endDate: utsEnd,
            },
          });
        }
        console.log(`  ✓ Seeded default events for ${y.label}`);
      } else {
        console.log(`  ✓ ${y.label} already has ${existingEvents} event(s)`);
      }
    }

    // ============================================
    // 2. SETUP PROGRAMS
    // ============================================
    console.log("🎓 Setting up programs...");

    // Ensure common programs referenced by dummy data exist
    const desiredPrograms = [
      { name: "Multimedia", code: "MM" },
      { name: "Akuntansi", code: "AK" },
      { name: "Teknik Komputer", code: "TK" },
      { name: "Perhotelan", code: "PH" },
    ];

    const programs = {};
    for (const p of desiredPrograms) {
      let found = await prisma.program.findFirst({ where: { name: p.name } });
      if (!found) {
        found = await prisma.program.create({
          data: {
            name: p.name,
            code: p.code,
            description: `${p.name} program - seeded`,
            isActive: true,
          },
        });
        console.log(`  ✓ Created program: ${found.name}`);
      } else {
        console.log(`  ✓ Using existing program: ${found.name}`);
      }
      programs[found.name] = found;
    }

    // ============================================
    // 3. SETUP REGISTRATION CODE SETTINGS PER YEAR
    // ============================================
    console.log("\n⚙️  Setting up registration code settings...");

    for (const year of years) {
      let settings = await prisma.admissionRegistrationCodeSetting.findUnique({
        where: { tahunAjaranId: year.id },
      });

      if (!settings) {
        settings = await prisma.admissionRegistrationCodeSetting.create({
          data: {
            tahunAjaranId: year.id,
            prefix: "DAFTAR",
            suffix: "",
            padLength: 4,
            includeYearCode: true,
            nextNumber: 1,
          },
        });
        console.log(`  ✓ Created for ${year.label}`);
      } else {
        // Reset counter for all years except active one
        if (year.id !== activeYear.id) {
          await prisma.admissionRegistrationCodeSetting.update({
            where: { tahunAjaranId: year.id },
            data: { nextNumber: 1 },
          });
        }
        console.log(`  ✓ Found existing settings for ${year.label}`);
      }
    }

    // ============================================
    // 4. SETUP LANDING PAGE SETTINGS
    // ============================================
    console.log("\n🏠 Setting up landing page settings...");

    let landingSettings = await prisma.admissionLandingSetting.findFirst();

    if (!landingSettings) {
      landingSettings = await prisma.admissionLandingSetting.create({
        data: {
          heroTitle: "Pendaftaran Siswa Baru",
          heroDescription:
            "Selamat datang di portal pendaftaran siswa baru. Silakan isi formulir pendaftaran dengan data yang valid.",
          isApplyFormEnabled: true,
        },
      });
      console.log("  ✓ Created landing page settings");
    } else {
      console.log("  ✓ Using existing landing page settings");
    }

    // ============================================
    // 4.5 SEED DEFAULT USERS (admin + editor)
    // ============================================
    console.log("\n🔐 Ensuring default users (admin + editor) exist...");

    // Admin user
    const adminEmail = "admin@sekolix.test";
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      const hashed = await bcrypt.hash("Admin123!", 10);
      admin = await prisma.user.create({
        data: {
          name: "Admin Sekolah",
          email: adminEmail,
          password: hashed,
          role: "ADMIN",
          adminTheme: "classic-light",
        },
      });
      console.log(`  ✓ Created admin user: ${adminEmail}`);
    } else {
      console.log(`  ✓ Admin user exists: ${adminEmail}`);
    }

    // Editor user
    const editorEmail = "editor@sekolix.test";
    let editor = await prisma.user.findUnique({ where: { email: editorEmail } });
    if (!editor) {
      const hashed = await bcrypt.hash("Editor123!", 10);
      editor = await prisma.user.create({
        data: {
          name: "Editor Sekolah",
          email: editorEmail,
          password: hashed,
          role: "EDITOR",
          adminTheme: "minimalist-light",
        },
      });
      console.log(`  ✓ Created editor user: ${editorEmail}`);
    } else {
      console.log(`  ✓ Editor user exists: ${editorEmail}`);
    }

    // ============================================
    // 5. SETUP DUMMY APPLICANTS (distribute across available years)
    // ============================================
    console.log(`\n👥 Setting up dummy applicants across available academic years...`);

    // Ensure counters start from 1 for all years for predictable seed data
    for (const y of years) {
      await prisma.admissionRegistrationCodeSetting.updateMany({
        where: { tahunAjaranId: y.id },
        data: { nextNumber: 1 },
      });
    }

    const dummyApplicants = [
      { nik: "3171010101900001", phone: "08123456001", fullName: "Ahmad Rizki Pratama", email: "ahmad.rizki@email.com", schoolOrigin: "SMP Negeri 1 Jakarta", programChoice: "Multimedia", status: "pending", profileCompleted: false },
      { nik: "3171010102900002", phone: "08123456002", fullName: "Siti Nurhaliza Wijaya", email: "siti.nurhaliza@email.com", schoolOrigin: "SMP Negeri 2 Jakarta", programChoice: "Akuntansi", status: "review", profileCompleted: true },
      { nik: "3171010103900003", phone: "08123456003", fullName: "Budi Hartono Santoso", email: null, schoolOrigin: "SMP Negeri 3 Jakarta", programChoice: null, status: "pending", profileCompleted: false },
      { nik: "3171010104900004", phone: "08123456004", fullName: "Eka Putri Ramadhani", email: "eka.putri@email.com", schoolOrigin: "SMP Negeri 4 Jakarta", programChoice: "Multimedia", status: "accepted", profileCompleted: true },
      { nik: "3171010105900005", phone: "08123456005", fullName: "Doni Setiawan Kusuma", email: "doni.setiawan@email.com", schoolOrigin: "SMP Negeri 5 Jakarta", programChoice: "Teknik Komputer", status: "rejected", profileCompleted: true },
      { nik: "3171010106900006", phone: "08123456006", fullName: "Rina Anggraeni Hidayat", email: null, schoolOrigin: "SMP Swasta Al-Azhar", programChoice: "Multimedia", status: "review", profileCompleted: false },
      { nik: "3171010107900007", phone: "08123456007", fullName: "Fajar Budiman Rasyid", email: "fajar.budiman@email.com", schoolOrigin: "SMP Islam Raya", programChoice: "Multimedia", status: "pending", profileCompleted: false },
      { nik: "3171010108900008", phone: "08123456008", fullName: "Lestari Wijaya Kusuma", email: "lestari.wijaya@email.com", schoolOrigin: "SMP Negeri 6 Jakarta", programChoice: "Perhotelan", status: "accepted", profileCompleted: true },
      { nik: "3171010109900009", phone: "08123456009", fullName: "Muhammad Ihsan Hidayat", email: "muhammad.ihsan@email.com", schoolOrigin: "SMP Negeri 7 Jakarta", programChoice: null, status: "pending", profileCompleted: false },
      { nik: "3171010110900010", phone: "08123456010", fullName: "Nadia Salsabila Rahman", email: "nadia.salsabila@email.com", schoolOrigin: "SMP Swasta Bumi Putra", programChoice: "Akuntansi", status: "review", profileCompleted: true },
      { nik: "3171010111900011", phone: "08123456011", fullName: "Rizal Fahmi", email: null, schoolOrigin: "SMP Negeri 8 Jakarta", programChoice: "Teknik Komputer", status: "pending", profileCompleted: false },
      { nik: "3171010112900012", phone: "08123456012", fullName: "Maya Sari", email: "maya.sari@email.com", schoolOrigin: "SMP Negeri 9 Jakarta", programChoice: "Multimedia", status: "accepted", profileCompleted: true },
      { nik: "3171010113900013", phone: "08123456013", fullName: "Joko Santoso", email: null, schoolOrigin: "SMP Negeri 10 Jakarta", programChoice: null, status: "review", profileCompleted: false },
      { nik: "3171010114900014", phone: "08123456014", fullName: "Fitri Handayani", email: "fitri.handayani@email.com", schoolOrigin: "SMP Swasta Nurul", programChoice: "Perhotelan", status: "pending", profileCompleted: true },
      { nik: "3171010115900015", phone: "08123456015", fullName: "Arif Kurniawan", email: "arif.kurniawan@email.com", schoolOrigin: "SMP Negeri 11 Jakarta", programChoice: "Multimedia", status: "rejected", profileCompleted: true },
      { nik: "3171010116900016", phone: "08123456016", fullName: "Dewi Lestari", email: null, schoolOrigin: "SMP Negeri 12 Jakarta", programChoice: "Akuntansi", status: "pending", profileCompleted: false },
      { nik: "3171010117900017", phone: "08123456017", fullName: "Hendra Wijaya", email: "hendra.wijaya@email.com", schoolOrigin: "SMP Negeri 13 Jakarta", programChoice: "Teknik Komputer", status: "accepted", profileCompleted: true },
      { nik: "3171010118900018", phone: "08123456018", fullName: "Sinta Mariana", email: null, schoolOrigin: "SMP Swasta Pelita", programChoice: null, status: "pending", profileCompleted: false },
      { nik: "3171010119900019", phone: "08123456019", fullName: "Gilang Pratama", email: "gilang.pratama@email.com", schoolOrigin: "SMP Negeri 14 Jakarta", programChoice: "Perhotelan", status: "review", profileCompleted: true },
      { nik: "3171010120900020", phone: "08123456020", fullName: "Linda Hartono", email: "linda.hartono@email.com", schoolOrigin: "SMP Negeri 15 Jakarta", programChoice: "Akuntansi", status: "accepted", profileCompleted: true },
      { nik: "3171010121900021", phone: "08123456021", fullName: "Yoga Prasetyo", email: null, schoolOrigin: "SMP Negeri 16 Jakarta", programChoice: "Multimedia", status: "pending", profileCompleted: false },
      { nik: "3171010122900022", phone: "08123456022", fullName: "Nina Kurniasih", email: "nina.kurniasih@email.com", schoolOrigin: "SMP Negeri 17 Jakarta", programChoice: "Teknik Komputer", status: "review", profileCompleted: true },
      { nik: "3171010123900023", phone: "08123456023", fullName: "Bambang Susilo", email: null, schoolOrigin: "SMP Negeri 18 Jakarta", programChoice: null, status: "rejected", profileCompleted: false },
      { nik: "3171010124900024", phone: "08123456024", fullName: "Ratna Sari", email: "ratna.sari@email.com", schoolOrigin: "SMP Negeri 19 Jakarta", programChoice: "Perhotelan", status: "accepted", profileCompleted: true },
      { nik: "3171010125900025", phone: "08123456025", fullName: "Fikri Ramadhan", email: null, schoolOrigin: "SMP Negeri 20 Jakarta", programChoice: "Akuntansi", status: "pending", profileCompleted: false },
      { nik: "3171010126900026", phone: "08123456026", fullName: "Erika Mustika", email: "erika.mustika@email.com", schoolOrigin: "SMP Swasta Citra", programChoice: "Multimedia", status: "review", profileCompleted: true },
      { nik: "3171010127900027", phone: "08123456027", fullName: "Wawan Setiawan", email: null, schoolOrigin: "SMP Negeri 21 Jakarta", programChoice: null, status: "pending", profileCompleted: false },
      { nik: "3171010128900028", phone: "08123456028", fullName: "Sari Putri", email: "sari.putri@email.com", schoolOrigin: "SMP Negeri 22 Jakarta", programChoice: "Perhotelan", status: "accepted", profileCompleted: true },
      { nik: "3171010129900029", phone: "08123456029", fullName: "Ade Kurnia", email: null, schoolOrigin: "SMP Negeri 23 Jakarta", programChoice: "Teknik Komputer", status: "review", profileCompleted: false },
      { nik: "3171010130900030", phone: "08123456030", fullName: "Mawar Indah", email: "mawar.indah@email.com", schoolOrigin: "SMP Negeri 24 Jakarta", programChoice: "Akuntansi", status: "accepted", profileCompleted: true },
    ];

    let createdCount = 0;
    for (let idx = 0; idx < dummyApplicants.length; idx++) {
      const data = dummyApplicants[idx];
      // Distribute applicants across years round-robin so admin UI can filter by year
      const targetYear = years[idx % years.length];
      try {
        // Check if applicant exists
        const existing = await prisma.applicant.findUnique({
          where: { nik: data.nik },
        });

        if (existing) {
          console.log(`  ⊘ NIK ${data.nik} already exists, skipping...`);
          continue;
        }

        // Generate registration code using the target year's settings
        const settings = await prisma.admissionRegistrationCodeSetting.findUnique({
          where: { tahunAjaranId: targetYear.id },
        });

        let yearCode = "";
        if (settings && settings.includeYearCode && targetYear.yearCode) {
          yearCode = targetYear.yearCode;
        }

        const paddedNumber = String(settings?.nextNumber ?? 1).padStart(
          settings?.padLength ?? 4,
          "0"
        );
        const registrationCode =
          (settings?.prefix || "DAFTAR") + yearCode + paddedNumber + ((settings && settings.suffix) || "");

        // Create applicant (include optional status, profileCompleted, programChoice)
        const programObj = data.programChoice ? programs[data.programChoice] : null;

        // generate additional profile fields to match complete-profile route
        const gender = idx % 2 === 0 ? "male" : "female";
        const nisn = data.nik.slice(-10);
        const noKK = data.nik.slice(0, 16);
        const placeOfBirth = "Jakarta";
        const dateOfBirth = new Date(2010, 0, Math.min(1 + (idx % 20), 28));
        const nationality = "Indonesia";
        const religions = ["Islam", "Kristen", "Hindu", "Buddha"];
        const religion = religions[idx % religions.length];
        const motherTongue = "Bahasa Indonesia";
        const address = `Jl. Contoh No.${100 + idx}`;
        const village = `Kel. Contoh ${idx}`;
        const district = `Kec. Contoh`;
        const city = "Jakarta";
        const province = "DKI Jakarta";
        const postalCode = `12${String(300 + idx).slice(-3)}`;

        const fatherName = `Bpk. ${data.fullName.split(" ")[0]} Sr.`;
        const fatherNik = (BigInt(data.nik) + 1n).toString().slice(0, 16);
        const fatherBirthYear = 1970 + (idx % 20);
        const fatherEducations = ["SD", "SMP", "SMA", "D3", "S1"];
        const fatherOccupations = ["Wiraswasta", "PNS", "Pegawai Swasta", "Petani", "Pedagang"];
        const fatherIncomes = ["<2 juta", "2-5 juta", "5-10 juta", ">10 juta"];
        const fatherEducation = fatherEducations[idx % fatherEducations.length];
        const fatherOccupation = fatherOccupations[idx % fatherOccupations.length];
        const fatherIncome = fatherIncomes[idx % fatherIncomes.length];

        const motherName = `Ibu ${data.fullName.split(" ")[0]}`;
        const motherNik = (BigInt(data.nik) + 2n).toString().slice(0, 16);
        const motherBirthYear = 1972 + (idx % 18);
        const motherEducations = ["SD", "SMP", "SMA", "D3", "S1"];
        const motherOccupations = ["Ibu Rumah Tangga", "Guru", "Perawat", "Pegawai Swasta", "Wiraswasta"];
        const motherIncomes = ["<2 juta", "2-5 juta", "5-10 juta"];
        const motherEducation = motherEducations[idx % motherEducations.length];
        const motherOccupation = motherOccupations[idx % motherOccupations.length];
        const motherIncome = motherIncomes[idx % motherIncomes.length];

        // Occasionally set guardian data for variety
        let guardianName = null;
        let guardianNik = null;
        let guardianBirthYear = null;
        let guardianEducation = null;
        let guardianOccupation = null;
        let guardianIncome = null;
        if (idx % 7 === 0) {
          guardianName = `Wali ${data.fullName.split(" ")[0]}`;
          guardianNik = (BigInt(data.nik) + 3n).toString().slice(0, 16);
          guardianBirthYear = 1965 + (idx % 25);
          const guardianEducations = ["SMP", "SMA", "D3"];
          const guardianOccupations = ["Pekerja", "Wiraswasta", "Pegawai Swasta"];
          guardianEducation = guardianEducations[idx % guardianEducations.length];
          guardianOccupation = guardianOccupations[idx % guardianOccupations.length];
          guardianIncome = fatherIncomes[idx % fatherIncomes.length];
        }

        const mobile = data.phone; // mirror phone as mobile for seed
        const livesWith = "Orang Tua";
        const weight = 35 + (idx % 30);
        const height = 130 + (idx % 50);
        const distanceToSchool = parseFloat((0.5 + (idx % 10) * 0.2).toFixed(1));
        const transportOptions = ["Jalan Kaki", "Motor", "Angkot", "Sepeda"];
        const transportationMode = transportOptions[idx % transportOptions.length];
        const anakKe = 1 + (idx % 3);
        const jumlahSaudara = 1 + (idx % 4);
        const achievements = idx % 5 === 0 ? "Juara lomba komputer tingkat kecamatan" : null;

        await prisma.applicant.create({
          data: {
            registrationCode,
            nik: data.nik,
            phone: data.phone,
            mobile: mobile,
            fullName: data.fullName,
            email: data.email || null,
            schoolOrigin: data.schoolOrigin || null,
            programChoice: data.programChoice || null,
            programId: programObj ? programObj.id : null,
            // assign applicant to the distributed target year
            academicYearId: targetYear.id,
            submissionData: {
              ip: "127.0.0.1",
              userAgent: "seed-script",
            },
            status: data.status || "pending",
            profileCompleted: Boolean(data.profileCompleted) || false,

            // personal
            gender,
            nisn,
            noKK,
            placeOfBirth,
            dateOfBirth,
            nationality,
            religion,
            motherTongue,
            address,
            village,
            district,
            city,
            province,
            postalCode,

            // father
            fatherName,
            fatherNik,
            fatherBirthYear,
            fatherEducation,
            fatherOccupation,
            fatherIncome,

            // mother
            motherName,
            motherNik,
            motherBirthYear,
            motherEducation,
            motherOccupation,
            motherIncome,

            // guardian (left null)
            guardianName,
            guardianNik,
            guardianBirthYear,
            guardianEducation,
            guardianOccupation,
            guardianIncome,

            // contact/student details
            livesWith,
            weight,
            height,
            distanceToSchool,
            transportationMode,
            anakKe,
            jumlahSaudara,

            // achievements
            achievements,
          },
        });

        // Update counter for the target year
        if (settings) {
          await prisma.admissionRegistrationCodeSetting.update({
            where: { tahunAjaranId: targetYear.id },
            data: { nextNumber: (settings.nextNumber || 1) + 1 },
          });
        }
        console.log(`  ✓ ${data.fullName.padEnd(30)} - Kode: ${registrationCode} - Tahun: ${targetYear.label}`);
        createdCount++;
      } catch (error) {
        console.error(`  ✗ Error creating ${data.fullName}:`, error.message);
      }
    }

    console.log(
      `\n✅ Seeding complete! Created ${createdCount} of ${dummyApplicants.length} applicants\n`
    );
    // ============================================
    // 6. ADDITIONAL CONTENT: PAGES, ARTICLES, NEWS, EVENTS, MEDIA, GALLERY, FACULTY
    // ============================================
    console.log("\n📚 Seeding site content: pages, articles, news, events, media, gallery, faculty...");

    // Pages (profile pages)
    const profilePages = [
      { title: "Sejarah", slug: "sejarah", content: "Sejarah sekolah sejak didirikan...", description: "Sejarah singkat sekolah" },
      { title: "Visi & Misi", slug: "visi-misi", content: "Visi: Menjadi... Misi: ...", description: "Visi dan Misi sekolah" },
      { title: "Struktur Organisasi", slug: "struktur", content: "Struktur organisasi sekolah...", description: "Struktur organisasi" },
      { title: "Fasilitas", slug: "fasilitas", content: "Fasilitas yang tersedia: laboratorium, perpustakaan...", description: "Fasilitas sekolah" },
      { title: "Program Keahlian", slug: "program-keahlian", content: "Program unggulan: Multimedia, Akuntansi...", description: "Daftar program keahlian" },
    ];

    for (const p of profilePages) {
      const existing = await prisma.page.findUnique({ where: { slug: p.slug } });
      if (!existing) {
        await prisma.page.create({ data: { title: p.title, slug: p.slug, content: p.content, description: p.description, isPublished: true, isVisible: true } });
        console.log(`  ✓ Page seeded: ${p.title}`);
      }
    }

    // Articles
    const sampleArticles = [
      { title: "Kegiatan Literasi Sekolah", slug: "kegiatan-literasi", excerpt: "Program literasi siswa...", category: "Academic", content: "Detail kegiatan literasi...", isPublished: true },
      { title: "Ekstrakurikuler Juara", slug: "ekskul-juara", excerpt: "Prestasi ekstrakurikuler...", category: "Achievement", content: "Detail prestasi...", isPublished: true },
      { title: "Peningkatan Mutu Pembelajaran", slug: "peningkatan-mutu", excerpt: "Inisiatif peningkatan mutu...", category: "Academic", content: "Detail program...", isPublished: false },
    ];

    for (const a of sampleArticles) {
      const existing = await prisma.article.findUnique({ where: { slug: a.slug } });
      if (!existing) {
        await prisma.article.create({ data: { title: a.title, slug: a.slug, content: a.content, excerpt: a.excerpt, category: a.category, isPublished: a.isPublished } });
        console.log(`  ✓ Article seeded: ${a.title}`);
      }
    }

    // News
    const sampleNews = [
      { title: "Penerimaan Siswa Baru Dibuka", slug: "psb-dibuka", excerpt: "Pendaftaran dibuka sampai...", content: "Informasi pendaftaran...", category: "Announcement", isPublished: true },
      { title: "Libur Semester", slug: "libur-semester", excerpt: "Libur semester pada...", content: "Detail libur...", category: "Announcement", isPublished: true },
      { title: "Juara Lomba Sains", slug: "juara-lomba-sains", excerpt: "Siswa meraih juara...", content: "Detail lomba...", category: "Achievement", isPublished: true },
    ];
    for (const n of sampleNews) {
      const existing = await prisma.news.findUnique({ where: { slug: n.slug } });
      if (!existing) {
        await prisma.news.create({ data: { title: n.title, slug: n.slug, content: n.content, excerpt: n.excerpt, category: n.category, isPublished: n.isPublished } });
        console.log(`  ✓ News seeded: ${n.title}`);
      }
    }

    // Events (site-level) — create some events tied to active year where relevant
    const sampleEvents = [
      { title: "OSN Sekolah", slug: "osn-sekolah", description: "Olimpiade sains internal", startDate: new Date(activeYear.startDate || new Date()), endDate: new Date((activeYear.startDate || new Date()).getTime() + 2 * 24 * 3600 * 1000), location: "Aula" },
      { title: "Festival Seni", slug: "festival-seni", description: "Festival seni tahunan", startDate: new Date((activeYear.startDate || new Date()).getTime() + 30 * 24 * 3600 * 1000), endDate: new Date((activeYear.startDate || new Date()).getTime() + 32 * 24 * 3600 * 1000), location: "Lapangan" },
      { title: "Open House", slug: "open-house", description: "Open house untuk calon siswa dan orang tua", startDate: new Date((activeYear.startDate || new Date()).getTime() + 10 * 24 * 3600 * 1000), endDate: new Date((activeYear.startDate || new Date()).getTime() + 10 * 24 * 3600 * 1000), location: "Gedung Serbaguna" },
    ];
    for (const ev of sampleEvents) {
      const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
      if (!existing) {
        await prisma.event.create({ data: { title: ev.title, slug: ev.slug, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, location: ev.location, isPublished: true } });
        console.log(`  ✓ Event seeded: ${ev.title}`);
      }
    }

    // Media
    const mediaItems = [
      { title: "Hero Image", url: "https://placehold.co/1200x600", publicId: "hero-1200x600", type: "image", folder: "landing_media", size: 102400 },
      { title: "Facility Image", url: "https://placehold.co/800x600", publicId: "facility-800x600", type: "image", folder: "landing_media", size: 64000 },
      { title: "Teacher Photo", url: "https://placehold.co/400x400", publicId: "teacher-400x400", type: "image", folder: "landing_media", size: 32000 },
    ];
    for (const m of mediaItems) {
      const existing = await prisma.media.findFirst({ where: { publicId: m.publicId } });
      if (!existing) {
        await prisma.media.create({ data: m });
        console.log(`  ✓ Media seeded: ${m.title}`);
      }
    }

    // Albums & Galleries
    const albumDefs = [
      { name: "Kegiatan Sekolah", description: "Foto kegiatan selama satu tahun" },
      { name: "Fasilitas", description: "Foto fasilitas sekolah" },
    ];
    for (const a of albumDefs) {
      let album = await prisma.album.findUnique({ where: { name: a.name } });
      if (!album) {
        album = await prisma.album.create({ data: a });
        console.log(`  ✓ Album created: ${a.name}`);
      }

      // create 4 images per album
      for (let i = 1; i <= 4; i++) {
        const title = `${a.name} - Foto ${i}`;
        const imageUrl = `https://placehold.co/800x600?text=${encodeURIComponent(title)}`;
        const exists = await prisma.gallery.findFirst({ where: { title, albumId: album.id } });
        if (!exists) {
          await prisma.gallery.create({ data: { title, image: imageUrl, albumId: album.id, order: i } });
        }
      }
    }

    // Landing sections
    const sections = [
      { slug: "hero", type: "hero", title: "Selamat Datang di Sekolah Kami", subtitle: "Mencetak generasi unggul", body: "Informasi singkat tentang sekolah.", isActive: true, order: 0 },
      { slug: "programs", type: "programs", title: "Program Keahlian", subtitle: "Pilih program yang sesuai", body: "Multimedia, Akuntansi, Teknik Komputer", isActive: true, order: 10 },
      { slug: "cta-apply", type: "cta", title: "Daftar Sekarang", subtitle: "Pendaftaran dibuka", body: "Klik tombol daftar untuk memulai proses pendaftaran", isActive: true, order: 20 },
    ];
    for (const s of sections) {
      const existing = await prisma.landingSection.findUnique({ where: { slug: s.slug } });
      if (!existing) {
        await prisma.landingSection.create({ data: { slug: s.slug, type: s.type, title: s.title, subtitle: s.subtitle, body: s.body, isActive: s.isActive, order: s.order } });
        console.log(`  ✓ Landing section seeded: ${s.slug}`);
      }
    }

    // Theme configs
    const themes = [
      { name: "Academic Classic", themeId: "academic-classic", primaryColor: "#001f3f", headingFont: "'Playfair Display', serif", bodyFont: "Inter, sans-serif", isActive: true },
      { name: "Modern Vibrant", themeId: "modern-vibrant", primaryColor: "#ff6b6b", headingFont: "'Poppins', sans-serif", bodyFont: "Inter, sans-serif", isActive: false },
    ];
    for (const t of themes) {
      const existing = await prisma.themeConfig.findFirst({ where: { themeId: t.themeId } });
      if (!existing) {
        await prisma.themeConfig.create({ data: t });
        console.log(`  ✓ Theme created: ${t.name}`);
      }
    }

    // Faculty
    const facultyList = [
      { name: "Drs. H. Ahmad Suparman", position: "Kepala Sekolah", department: null, email: "kepsek@sekolix.test", phone: "08123450001", bio: "Kepala sekolah berpengalaman" },
      { name: "Siti Aminah, S.Pd.", position: "Guru Multimedia", department: "Multimedia", email: "siti.aminah@sekolix.test", phone: "08123450002" , bio: "Guru multimedia berpengalaman"},
      { name: "Budi Santoso, S.Kom.", position: "Guru TKJ", department: "Teknik Komputer", email: "budi.santoso@sekolix.test", phone: "08123450003" , bio: "Guru TKJ"},
      { name: "Rina Marlina, S.Ak.", position: "Guru Akuntansi", department: "Akuntansi", email: "rina.marlina@sekolix.test", phone: "08123450004" , bio: "Guru akuntansi"},
    ];
    for (const f of facultyList) {
      const existing = await prisma.faculty.findFirst({ where: { email: f.email } });
      if (!existing) {
        await prisma.faculty.create({ data: { name: f.name, position: f.position, department: f.department, email: f.email, phone: f.phone, bio: f.bio } });
        console.log(`  ✓ Faculty added: ${f.name}`);
      }
    }

    // Applicant payments & validations (for accepted applicants)
    const acceptedApplicants = await prisma.applicant.findMany({ where: { status: "accepted" }, take: 20 });
    for (let i = 0; i < acceptedApplicants.length; i++) {
      const a = acceptedApplicants[i];
      // create a payment for some applicants to simulate partial/complete payments
      if (i % 2 === 0) {
        const amount = (a.academicYearId ? (await prisma.tahunAjaran.findUnique({ where: { id: a.academicYearId } })).registrationFee : 0) || 0;
        if (amount > 0) {
          await prisma.applicantPayment.create({ data: { applicantId: a.id, method: "Transfer", amount: Math.floor(amount / (i % 3 === 0 ? 1 : 2)), status: "confirmed" } });
        }
      }

      // create validation record for some
      if (i % 3 === 0) {
        await prisma.applicantValidation.create({ data: { applicantId: a.id, result: "valid", notes: "Dokumen lengkap" } });
      }
    }

    // ============================================
    // 7. SUMMARY
    // ============================================
    console.log("\n📊 Final Summary:");
    console.log(`   Academic Years: ${years.length}`);
    console.log(`   Active Year: ${activeYear.label} (${activeYear.yearCode})`);
    console.log(`   Program example: ${programs["Multimedia"]?.name ?? "N/A"}`);
    const totalApplicants = await prisma.applicant.count();
    console.log(`   Total Applicants: ${totalApplicants}`);

    const settings = await prisma.admissionRegistrationCodeSetting.findUnique({ where: { tahunAjaranId: activeYear.id } });
    if (settings) {
      console.log(`\n⚙️  Registration Code Settings (${activeYear.label}):`);
      console.log(`   Format: ${settings.prefix}${activeYear.yearCode}${String(settings.nextNumber).padStart(settings.padLength, "0")}${settings.suffix || ""}`);
      console.log(`   Next Number: ${settings.nextNumber}`);
    }

    const landing = await prisma.admissionLandingSetting.findFirst();
    if (landing) {
      console.log(`\n🏠 Landing Page Settings:`);
      console.log(`   Form Enabled: ${landing.isApplyFormEnabled ? "Yes" : "No"}`);
    }

  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
