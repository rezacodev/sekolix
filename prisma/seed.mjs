import { PrismaClient } from "@prisma/client";

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
    // 6. SUMMARY
    // ============================================
    console.log("📊 Final Summary:");
    console.log(`   Academic Years: ${years.length}`);
    console.log(`   Active Year: ${activeYear.label} (${activeYear.yearCode})`);
    console.log(`   Program: ${programs["Multimedia"]?.name ?? "N/A"}`);
    
    const totalApplicants = await prisma.applicant.count();
    console.log(`   Total Applicants: ${totalApplicants}`);

    const settings = await prisma.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: activeYear.id },
    });
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
