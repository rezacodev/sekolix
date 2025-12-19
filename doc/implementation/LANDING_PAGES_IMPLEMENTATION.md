# Landing Page Configuration - Implementation Guide

## Step 1: Prisma Schema Update

### Current Schema:
```prisma
model LandingSection {
  id        String   @id @default(cuid())
  themeId   String   // ← REMOVE THIS
  slug      String
  title     String
  subtitle  String?
  body      String?  @db.Text
  image     String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([themeId, slug])  // ← CHANGE THIS
  @@map("landing_sections")
}
```

### New Schema (Global):
```prisma
model LandingSection {
  id        String   @id @default(cuid())
  slug      String   @unique  // hero, stats, programs, about, cta, etc
  type      String   // "hero" | "stats" | "content" | "cta" | "gallery"
  title     String
  subtitle  String?
  body      String?  @db.Text
  image     String?
  ctaText   String?
  ctaLink   String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  metadata  Json?    // For flexible/complex data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("landing_sections")
}
```

## Step 2: Global Section Definitions

### Recommended Global Sections:
```javascript
const landingSections = [
  {
    slug: 'hero',
    type: 'hero',
    title: 'Membangun Generasi Unggul Melalui Karakter dan Keilmuan',
    subtitle: 'Sekolah yang menanamkan integritas, etika, dan keahlian berbasis industri.',
    body: 'SMK Negeri 1 Jakarta memadukan kurikulum nasional dan praktik industri agar lulusan siap bekerja serta terus mengembangkan kemampuan kepemimpinan.',
    image: 'https://placehold.co/1200x800?text=Hero',
    order: 1,
    isActive: true,
  },
  {
    slug: 'stats',
    type: 'stats',
    title: 'Statistik Kinerja Sekolah',
    subtitle: 'Angka-angka yang mencerminkan prestasi dan kepercayaan masyarakat.',
    body: 'Lulusan terserap di dunia kerja sebesar 96%, 12 program industri, dan 5 kompetisi tingkat nasional setiap tahunnya.',
    metadata: {
      stats: [
        { label: 'Tingkat Kelulusan', value: 96, suffix: '%' },
        { label: 'Program Keahlian', value: 12 },
        { label: 'Penghargaan Nasional', value: 5 }
      ]
    },
    order: 2,
    isActive: true,
  },
  {
    slug: 'programs',
    type: 'content',
    title: 'Program Unggulan',
    subtitle: 'Kurikulum berbasis industri kreatif dan teknologi tinggi.',
    body: 'Pembelajaran coding, desain interaksi, hingga studio AR/VR dipadu dalam project sprint bersama mitra industri.',
    order: 3,
    isActive: true,
  },
  {
    slug: 'about',
    type: 'content',
    title: 'Tentang Kami',
    subtitle: 'Pendidikan Berkualitas untuk Masa Depan',
    body: 'Dengan pengalaman lebih dari 30 tahun, kami berkomitmen memberikan pendidikan berkualitas yang mempersiapkan siswa menghadapi tantangan global.',
    image: 'https://placehold.co/1200x800?text=About',
    order: 4,
    isActive: true,
  },
  {
    slug: 'cta',
    type: 'cta',
    title: 'Daftar Sekarang',
    subtitle: 'Pendaftaran Gelombang Baru Telah Dibuka',
    ctaText: 'Mulai Pendaftaran',
    ctaLink: '/apply',
    body: 'Ajukan pertanyaan melalui tim admission, jadwalkan tur kampus, dan dapatkan beasiswa kompetitif.',
    order: 5,
    isActive: true,
  },
];
```

## Step 3: API Endpoint Updates

### GET /api/landing-sections
```typescript
// Get all active sections
export async function GET() {
  const sections = await db.landingSection.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(sections);
}

// Get specific section by slug
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const section = await db.landingSection.findUnique({
    where: { slug: params.slug },
  });
  if (!section) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(section);
}
```

### PATCH /api/landing-sections/:slug
```typescript
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const body = await req.json();
  const updated = await db.landingSection.update({
    where: { slug: params.slug },
    data: body,
  });
  return NextResponse.json(updated);
}
```

## Step 4: Theme Component Updates

### Before (Academic Classic):
```typescript
const heroSection = await prisma.landingSection.findFirst({
  where: { themeId: 'academic-classic', slug: 'hero', isActive: true },
});
```

### After:
```typescript
// Fetch multiple sections at once
const [heroSection, statsSection, programsSection] = await Promise.all([
  db.landingSection.findUnique({ where: { slug: 'hero' } }),
  db.landingSection.findUnique({ where: { slug: 'stats' } }),
  db.landingSection.findUnique({ where: { slug: 'programs' } }),
]);
```

## Step 5: Migration Script

```typescript
// scripts/migrate-landing-sections.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting landing sections migration...');

  // 1. Create new global sections
  const sections = [
    { slug: 'hero', type: 'hero', ... },
    { slug: 'stats', type: 'stats', ... },
    // ... rest of sections
  ];

  for (const section of sections) {
    await prisma.landingSection.upsert({
      where: { slug: section.slug },
      update: section,
      create: section,
    });
  }

  // 2. Delete old theme-specific duplicates (optional)
  // Backup first, then:
  // await prisma.landingSection.deleteMany({
  //   where: { slug: { in: [...] } }
  // });

  console.log('Migration completed!');
  await prisma.$disconnect();
}

migrate().catch(console.error);
```

## Step 6: Admin UI Restructure

### New Admin Page Structure:
```
/admin/website-settings/landing/
├── LandingSectionsEditor.tsx (refactored - NO theme grouping)
│   ├── SectionList (global, not per-theme)
│   ├── SectionForm (universal form for all types)
│   └── SectionPreview (theme-aware preview)
└── page.tsx (server component to fetch all sections)
```

### New LandingSectionsEditor:
```typescript
export const LandingSectionsEditor = ({ sections }: { sections: LandingSectionShape[] }) => {
  const [items, setItems] = useState(sections);

  // No theme grouping - just sort by order
  const sorted = useMemo(() => {
    return items.sort((a, b) => a.order - b.order);
  }, [items]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Landing Page Sections</h2>
        <Button onClick={handleAddSection}>+ Add Section</Button>
      </div>

      <div className="grid gap-4">
        {sorted.map((section) => (
          <SectionCard key={section.slug} section={section} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  );
};
```

## Step 7: Testing Checklist

- [ ] Database migration successful
- [ ] All 3 themes display same hero content
- [ ] Admin can edit hero section globally
- [ ] Changes reflect on all 3 themes
- [ ] Old theme-specific sections deleted/archived
- [ ] Stats section now displays properly
- [ ] CTA section integrated
- [ ] No console errors
- [ ] Cache invalidation working

## Step 8: Rollback Plan (if needed)

```bash
# Restore backup
psql -d sekolix < backup_before_migration.sql

# Or with Prisma:
npx prisma migrate resolve --rolled-back migration_name
```

---

## Questions to Decide:

1. **Backward Compatibility**: Do you want to keep old theme-specific data?
   - YES → Use migration script to archive
   - NO → Direct delete after backup

2. **Timeline**:
   - Full implementation in one go? Or phased (hero first)?

3. **Metadata Storage**:
   - Use `metadata` Json field for flexible data?
   - Or create separate table for stats, gallery items, etc.?

4. **Preview**:
   - Should admin see how section looks on each theme?
   - Recommend: Yes, add theme-aware preview toggle
