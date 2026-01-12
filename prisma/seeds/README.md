# Database Seeding Guide

## Overview
This project uses a modular seeding approach where each module/component has its own seed file for better organization and maintainability.

## Structure
```
prisma/
├── seeds/
│   ├── index.js              # Main seed orchestrator (complete seeding)
│   ├── landing-page.js       # Landing page content (pages, articles)
│   ├── penerimaan-siswa.js   # Student admission (registration, applicants)
│   ├── manajemen-akademik.js # Academic management (all academic data)
│   └── README.md             # This documentation
└── seed.mjs                  # Legacy seed file (deprecated)
```

## Available Scripts

### Complete Modular Seeding (Recommended)
```bash
# Run complete modular seed (all modules)
npm run prisma:seed:modular

# Or use prisma directly
npx prisma db seed
```

### Legacy Seeding (Deprecated)
```bash
# Run legacy seed (full seeding with all data)
npx prisma db seed -- --seed prisma/seed.mjs
```

## Seed Modules

### 1. Landing Page (`landing-page.js`)
- **Pages**: Static pages (Tentang Sekolah, Program Akademik, Fasilitas)
- **Articles**: News and announcements (Penerimaan Siswa Baru, Ekstrakurikuler)

### 2. Penerimaan Siswa (`penerimaan-siswa.js`)
- **Registration Settings**: Registration codes and periods
- **Applicants**: Student applications with complete personal data

### 3. Manajemen Akademik (`manajemen-akademik.js`)
- **School Identity**: School information and settings
- **Tahun Ajaran**: Academic years
- **Programs**: Study programs (IPA, IPS, Bahasa)
- **Academic Events**: School events and exam schedules
- **Users & Staff**: Admin and teacher accounts
- **Curriculums**: Educational curriculums (Merdeka, Nasional, etc.)
- **Subjects**: Academic subjects (Matematika, Bahasa Indonesia, etc.)
- **Subject-Curriculum Relationships**: Links subjects to curriculums
- **Classes**: Class levels (1-12 for SD, SMP, SMA)
- **Subject-Class Relationships**: Links subjects to classes
- **Class Groups (Rombel)**: Student groups per class
- **Teacher Assignments**: Subject assignments to teachers
- **Class Schedules**: Weekly schedules
- **Students (Peserta Didik)**: Enrolled students
- **Assessments & Grades**: Student evaluations
- **Report Cards**: Academic reports
- **Exam Results**: Test results

## Data Included

### Landing Page
- 3 static pages (Tentang Sekolah, Program Akademik, Fasilitas)
- 2 articles (Penerimaan Siswa Baru, Ekstrakurikuler)

### Penerimaan Siswa
- 1 active registration code (PSB2026)
- 50 sample applicants with complete data

### Manajemen Akademik
- 1 school identity (SMA Negeri 1 Jakarta)
- 2 academic years (current and previous)
- 3 programs (IPA, IPS, Bahasa)
- Multiple academic events
- 1 admin + 15 staff accounts
- 5 curriculums (Merdeka 2023, Nasional 2024, etc.)
- 20 subjects (complete academic subjects)
- 59 subject-curriculum relationships
- 12 class levels (1-12)
- 156 subject-class relationships
- 12 classes with multiple rombel each
- Teacher-subject assignments
- Complete class schedules
- 100 enrolled students
- 200 assessments with grades
- 50 report cards
- 100 exam results

## Usage Examples

### Seed Only Landing Page
```javascript
import { seedLandingPage } from './seeds/landing-page.js';
const content = await seedLandingPage();
```

### Seed Only Student Admission
```javascript
import { seedRegistrationSettings, seedApplicants } from './seeds/penerimaan-siswa.js';
const settings = await seedRegistrationSettings();
const applicants = await seedApplicants(settings);
```

### Seed Only Academic Foundation
```javascript
import {
  seedSchoolIdentity,
  seedTahunAjaran,
  seedPrograms,
  seedCurriculums,
  seedSubjects
} from './seeds/manajemen-akademik.js';

const school = await seedSchoolIdentity();
const years = await seedTahunAjaran();
const programs = await seedPrograms();
const curriculums = await seedCurriculums();
const subjects = await seedSubjects();
```

## Notes
- All seed functions check for existing data to avoid duplicates
- Relationships are created using junction tables (SubjectCurriculum, SubjectClass)
- The modular approach allows for selective seeding of specific modules
- Legacy seed file is kept for backward compatibility but should not be used for new development
- All passwords are hashed using bcrypt
- Sample data uses realistic Indonesian educational context