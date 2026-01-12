import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dummy data templates
const firstNames = [
  "Adi", "Budi", "Citra", "Desy", "Eka", "Farhan", "Gita", "Hendra",
  "Indra", "Joko", "Ketut", "Lina", "Murni", "Nanda", "Oka", "Putri",
  "Qori", "Rini", "Siti", "Teguh", "Ursula", "Vina", "Wayan", "Yanti",
  "Zara", "Ahmad", "Bambang", "Dina", "Eni", "Faisal"
];

const lastNames = [
  "Wijaya", "Santoso", "Rahmat", "Kusuma", "Hermawan", "Gunawan",
  "Pratama", "Suryanto", "Handoko", "Samosir", "Setiawan", "Supriyanto",
  "Sutrisno", "Suyanto"
];

const cities = [
  "Jakarta", "Bandung", "Surabaya", "Medan", "Yogyakarta", "Semarang",
  "Makassar", "Tangerang"
];

const religions = ["Islam", "Kristen Protestan", "Kristen Katolik", "Budha", "Hindu"];
const occupations = ["PNS", "Swasta", "Petani", "Pedagang", "Pensiunan", "Buruh", "Profesional"];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

function generateNIK() {
  return String(getRandomInt(1000000000000000, 9999999999999999));
}

function generateNISN() {
  return String(getRandomInt(10000000000, 99999999999));
}

function generatePhone() {
  return `08${String(getRandomInt(100000000, 999999999)).slice(0, 9)}`;
}

export async function seedRegistrationSettings(years) {
  console.log("⚙️  Seeding registration code settings...");

  const activeYear = years.find(y => y.isActive);
  if (!activeYear) {
    console.log("⚠️  No active year found, skipping registration settings");
    return [];
  }

  const settings = [
    {
      tahunAjaranId: activeYear.id,
      prefix: "DAFTAR",
      suffix: "-2026",
      padLength: 4,
      nextNumber: 1,
      includeYearCode: true
    }
  ];

  const createdSettings = [];
  for (const setting of settings) {
    let regSetting = await prisma.admissionRegistrationCodeSetting.findFirst({
      where: { tahunAjaranId: setting.tahunAjaranId }
    });

    if (!regSetting) {
      regSetting = await prisma.admissionRegistrationCodeSetting.create({
        data: setting
      });
      console.log(`✓ Created registration setting for year: ${activeYear.name}`);
    } else {
      console.log(`ℹ️  Registration setting already exists for year: ${activeYear.name}`);
    }

    createdSettings.push(regSetting);
  }

  console.log(`✓ Seeded ${createdSettings.length} registration settings`);
  return createdSettings;
}

export async function seedApplicants(registrationSettings, years, numApplicants = 50) {
  console.log(`👥 Seeding ${numApplicants} applicants...`);

  const applicants = [];
  // Use the first registration setting (assuming it's the active one)
  const activeSetting = registrationSettings[0];
  const activeYear = years.find(y => y.isActive);

  if (!activeSetting || !activeYear) {
    console.log("⚠️  No registration setting or active year found, skipping applicants");
    return applicants;
  }

  for (let i = 0; i < numApplicants; i++) {
    const registrationCode = `DAFTAR${activeYear.yearCode || '26'}-${String(i + 1).padStart(4, "0")}`;
    const applicantData = {
      registrationCode: registrationCode,
      academicYear: {
        connect: { id: activeYear.id }
      },
      fullName: generateName(),
      nik: generateNIK(),
      nisn: generateNISN(),
      placeOfBirth: getRandomItem(cities),
      dateOfBirth: new Date(
        getRandomInt(2010, 2015),
        getRandomInt(0, 11),
        getRandomInt(1, 28)
      ),
      gender: getRandomItem(["L", "P"]),
      religion: getRandomItem(religions),
      address: `Jl. ${getRandomItem(firstNames)} No. ${getRandomInt(1, 100)}, ${getRandomItem(cities)}`,
      phone: generatePhone(),
      email: `applicant${i + 1}@example.com`,

      // Father's data
      fatherName: generateName(),
      fatherOccupation: getRandomItem(occupations),

      // Mother's data
      motherName: generateName(),
      motherOccupation: getRandomItem(occupations),

      // Guardian data
      guardianName: generateName(),

      // School origin
      schoolOrigin: `SD ${getRandomItem(firstNames)} ${getRandomInt(1, 100)}`,

      // Status
      status: getRandomItem(["pending", "review", "accepted", "rejected"]),
      notes: Math.random() > 0.7 ? "Dokumen lengkap" : null
    };

    let applicant = await prisma.applicant.findFirst({
      where: { registrationCode: registrationCode }
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: applicantData
      });
      console.log(`✓ Created applicant: ${applicant.fullName}`);
    } else {
      console.log(`ℹ️  Applicant already exists: ${applicant.fullName}`);
    }

    applicants.push(applicant);
  }

  console.log(`✓ Seeded ${applicants.length} applicants`);
  return applicants;
}