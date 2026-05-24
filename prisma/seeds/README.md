# Database Seeding Guide

## Overview
This project uses a modular seeding approach where each module/component has its own seed file for better organization and maintainability.

## Structure
```
prisma/
├── seeds/
│   ├── index.js              # Main seed orchestrator (complete seeding)
│   ├── landing-page/
│   │   └── landing-page.js   # Landing page content (pages, articles)
│   ├── penerimaan-siswa/
│   │   └── penerimaan-siswa.js # Student admission (registration, applicants)
│   ├── manajemen-akademik/
│   │   ├── utils/
│   │   │   └── seed-utils.js # Shared utilities and dummy data
│   │   ├── foundation/
│   │   │   └── foundation.js # School identity, academic years, programs, events
│   │   ├── curriculum/
│   │   │   └── curriculum.js # Curriculums, subjects, and relationships
│   │   ├── classes/
│   │   │   └── classes.js    # Classes, class groups, and relationships
│   │   ├── users/
│   │   │   └── users.js      # Users, staff, teacher assignments, schedules
│   │   ├── students/
│   │   │   └── students.js   # Students, assessments, grades, reports
│   │   ├── ruang-jam-pelajaran.js # Rooms and lesson times
│   │   ├── seed-assessments.ts # Assessment templates
│   │   ├── seed-assignments.ts # Sample assignments
│   │   ├── seed-grades.ts # Sample grades
│   │   ├── seed-syllabus-rpp.ts # Syllabus and lesson plans
│   │   ├── seed-teaching-materials.ts # Learning materials
│   │   └── create-sample-submissions.ts # Assignment submissions
│   ├── manajemen-guru/
│   │   ├── teacher-portal.js # Teacher portal data
│   │   ├── seed-grades-for-guru.ts # Grades for teacher testing
│   │   └── run-all-teacher-seeds.ts # Teacher seeds runner
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

### 1. Landing Page (`landing-page/landing-page.js`)
- **Pages**: Static pages (Tentang Sekolah, Program Akademik, Fasilitas)
- **Articles**: News and announcements (Penerimaan Siswa Baru, Ekstrakurikuler)

### 2. Penerimaan Siswa (`penerimaan-siswa/penerimaan-siswa.js`)
- **Registration Settings**: Registration codes and periods
- **Applicants**: Student applications with complete personal data

### 3. Manajemen Akademik (`manajemen-akademik/`)

#### Foundation (`foundation/foundation.js`)
- School identity, academic years, programs, and academic events

#### Curriculum (`curriculum/curriculum.js`)
- Curriculums, subjects, and their relationships (subject-curriculum, subject-program)

#### Classes (`classes/classes.js`)
- Class levels, class groups (rombels), and subject-class relationships

#### Users (`users/users.js`)
- Users, staff, teacher subject assignments, and class schedules

#### Students (`students/students.js`)
- Student enrollment, assessments, grades, report cards, and exam results

#### Additional Modules
- **Rooms & Times** (`ruang-jam-pelajaran.js`): Rooms and lesson times
- **Academic Data** (`seed-assessments.ts`, `seed-grades.ts`): Additional assessment templates and grades
- **Teaching Materials** (`seed-syllabus-rpp.ts`, `seed-teaching-materials.ts`): Syllabus and materials
- **Assignments** (`seed-assignments.ts`, `create-sample-submissions.ts`): Sample assignments and submissions

### 4. Manajemen Guru (`manajemen-guru/`)
- **Teacher Portal** (`teacher-portal.js`): Teacher-specific data
- **Testing Data** (`seed-grades-for-guru.ts`): Sample grades for teacher testing
- **Runner** (`run-all-teacher-seeds.ts`): Script to run teacher seeds

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