# Database Seeding Guide

## Overview

This project uses a single comprehensive seed script (`prisma/seed.mjs`) to initialize the database with all necessary data.

## Default Credentials

### Admin Account

After seeding, use these credentials to login:

- **Email:** `admin@sekolix.com`
- **Password:** `admin123`

> ⚠️ **IMPORTANT:** Change the password immediately after first login in production!

## What Gets Seeded

### 1. Academic Years (Tahun Ajaran)

- **2023-2024** (Inactive)
- **2024-2025** (Inactive)
- **2025-2026** (Active) ← Only one year is active at a time

### 2. Program (Program Keahlian)

- **Multimedia** - Desain grafis dan multimedia

### 3. Registration Code Settings

- Per academic year (independent settings)
- Each year has its own counter and configuration
- Format: `PREFIX + YEAR_CODE + PADDED_NUMBER + SUFFIX`
- Example: `DAFTAR250001` (DAFTAR = prefix, 25 = year code, 0001 = padded number)

### 4. Landing Page Settings

- Hero title and description for admission page
- Toggle for enabling/disabling application form

### 5. Dummy Applicants

- 10 dummy applicants with auto-generated registration codes
- Only for the active academic year (2025-2026)
- NIK, email, phone, and school origin included

## Running the Seed

### Normal Seed (Keeps Existing Data)

```bash
npm run seed
# or
node prisma/seed.mjs
```

- Creates missing data
- Keeps existing data intact
- Useful for adding data to existing database

### Fresh Seed (Clears Everything)

```bash
node prisma/seed.mjs --fresh
# or
npm run seed -- --fresh
```

- **Deletes all data** from the database
- Creates fresh new data
- Useful for starting completely fresh

## Academic Year Management

### Key Rules

1. **Only ONE academic year can be active at a time**
2. Each year has **independent** registration code settings
3. Changing settings in one year **does not affect** other years
4. Registration code counter is **per year** (Year A's count doesn't affect Year B)

### Important Files

- `prisma/seed.mjs` - Main seed script (use this one)
- `prisma/schema.prisma` - Database schema definition
- `src/lib/spmb/registrationCodeGenerator.ts` - Code generation logic

## Database Schema

### AdmissionRegistrationCodeSetting

```
- id: String (auto)
- tahunAjaranId: String (unique FK to TahunAjaran)
- prefix: String (default: "DAFTAR")
- suffix: String (default: "")
- padLength: Number (default: 4)
- includeYearCode: Boolean (default: true)
- nextNumber: Number (default: 1)
```

### Applicant

```
- registrationCode: String (UNIQUE)
- nik: String (unique)
- phone: String
- fullName: String
- email: String
- schoolOrigin: String
```

## Generated Registration Codes Example

For **2025-2026** academic year with default settings:

- 1st applicant: `DAFTAR250001`
- 2nd applicant: `DAFTAR250002`
- 10th applicant: `DAFTAR250010`
- 11th applicant: `DAFTAR250011`

The counter increments automatically with each new applicant.

## Troubleshooting

### If you see "Academic years already exist"

- Use `--fresh` flag to reset: `node prisma/seed.mjs --fresh`
- Or manually delete unwanted years from the database

### If registration codes look wrong

- Check that `yearCode` is set correctly in the academic year
- Check registration code settings in admin panel
- Reset counter if needed

### Database Errors

- Make sure you've run `npx prisma migrate dev` first
- Check that PostgreSQL is running
- Verify `.env` database connection string is correct

## Customization

To customize the seed data, edit `prisma/seed.mjs` and modify:

- Academic year labels and dates
- Program name and description
- Registration code prefix/suffix
- Dummy applicant data

Then run the seed again with `--fresh` flag.
