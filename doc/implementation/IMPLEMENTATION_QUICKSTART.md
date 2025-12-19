# Landing Pages Configuration - Quick Implementation Guide

**Goal**: Migrate from per-theme sections to global sections  
**Effort**: 3-4 weeks  
**Complexity**: Medium  
**Risk**: Low (with safeguards)

---

## ⚡ Quick Start Checklist

- [ ] Backup production database
- [ ] Create staging environment
- [ ] Review all 4 analysis documents
- [ ] Get stakeholder approval
- [ ] Schedule implementation kick-off
- [ ] Begin Phase 1 (schema migration)

---

## 🔄 Step-by-Step Implementation

### PHASE 1: Schema Migration (Days 1-2)

#### 1.1 Update Prisma Schema
```prisma
// OLD
model LandingSection {
  id        String   @id @default(cuid())
  themeId   String   // ← REMOVE
  slug      String
  title     String
  subtitle  String?
  body      String?  @db.Text
  image     String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  @@unique([themeId, slug])  // ← REMOVE
  @@map("landing_sections")
}

// NEW
model LandingSection {
  id        String   @id @default(cuid())
  slug      String   @unique  // ← ADD unique
  type      String            // ← ADD type
  title     String
  subtitle  String?
  body      String?  @db.Text
  image     String?
  ctaText   String?           // ← ADD
  ctaLink   String?           // ← ADD
  metadata  Json?             // ← ADD
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("landing_sections")
}
```

#### 1.2 Create & Run Migration
```bash
# Create migration
npx prisma migrate dev --name global_landing_sections

# Review generated migration file
cat prisma/migrations/[timestamp]_global_landing_sections/migration.sql

# Run on staging first
npx prisma migrate deploy --skip-generate
```

#### 1.3 Verify Migration
```bash
# Check schema updated
npx prisma introspect

# Verify no old themeId column
npx prisma studio
```

### PHASE 2: Data Migration (Days 2-3)

#### 2.1 Create Migration Script
```typescript
// scripts/migrate-to-global-sections.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration to global landing sections...');

  // Step 1: Delete old theme-specific sections
  // (Backup first!)
  const oldSections = await prisma.landingSection.findMany();
  console.log(`Found ${oldSections.length} old sections`);

  // Step 2: Create new global sections
  const globalSections = [
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
          { label: 'Penghargaan Nasional', value: 5 },
        ],
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

  for (const section of globalSections) {
    const result = await prisma.landingSection.upsert({
      where: { slug: section.slug },
      update: section,
      create: section,
    });
    console.log(`✅ Upserted section: ${result.slug}`);
  }

  console.log('✅ Migration completed!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 2.2 Run Migration Script
```bash
npx ts-node scripts/migrate-to-global-sections.ts
```

#### 2.3 Verify Data
```bash
# Check sections in database
npx prisma studio

# Or via SQL
psql -d sekolix -c "SELECT slug, type, title FROM landing_sections ORDER BY \"order\";"
```

### PHASE 3: API Updates (Days 3-4)

#### 3.1 Update GET Endpoint
```typescript
// app/api/landing-sections/route.ts
export async function GET() {
  try {
    const sections = await db.landingSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}
```

#### 3.2 Update PATCH Endpoint
```typescript
// app/api/landing-sections/[slug]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updated = await db.landingSection.update({
      where: { slug },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}
```

### PHASE 4: Admin UI Refactor (Days 4-6)

#### 4.1 Update LandingSectionsEditor
```typescript
// src/components/admin/LandingSectionsEditor.tsx
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type LandingSectionShape = {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  image?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  metadata?: any;
  order: number;
  isActive: boolean;
};

export const LandingSectionsEditor = ({ sections }: { sections: LandingSectionShape[] }) => {
  const [items, setItems] = useState(sections);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Sort by order (NO theme grouping)
  const sorted = useMemo(() => {
    return items.sort((a, b) => a.order - b.order);
  }, [items]);

  const handleChange = (id: string, field: keyof LandingSectionShape, value: any) => {
    setItems((prev) =>
      prev.map((section) => (section.id === id ? { ...section, [field]: value } : section))
    );
  };

  const handleSave = async (section: LandingSectionShape) => {
    setSavingId(section.id);
    setMessage(null);

    const response = await fetch(`/api/landing-sections/${section.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        body: section.body,
        image: section.image,
        ctaText: section.ctaText,
        ctaLink: section.ctaLink,
        metadata: section.metadata,
        order: section.order,
        isActive: section.isActive,
      }),
    });

    if (response.ok) {
      setMessage('✅ Perubahan tersimpan');
    } else {
      setMessage('❌ Gagal menyimpan');
    }

    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`rounded border px-4 py-2 ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="text-sm text-gray-600">
        💡 Semua 3 tema (Academic Classic, Modern Vibrant, Minimalist Clean) menggunakan sections yang sama
      </div>

      <div className="space-y-4">
        {sorted.map((section) => (
          <div key={section.id} className="rounded border p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase text-gray-500">{section.type}</p>
                <h4 className="text-lg font-bold">{section.title}</h4>
              </div>
              <Button
                size="sm"
                disabled={savingId === section.id}
                onClick={() => handleSave(section)}
              >
                {savingId === section.id ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase">Judul</label>
                <Input
                  value={section.title}
                  onChange={(e) => handleChange(section.id, 'title', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Subjudul</label>
                <Input
                  value={section.subtitle ?? ''}
                  onChange={(e) => handleChange(section.id, 'subtitle', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase">Konten</label>
                <Textarea
                  value={section.body ?? ''}
                  onChange={(e) => handleChange(section.id, 'body', e.target.value)}
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase">Gambar</label>
                <Input
                  value={section.image ?? ''}
                  onChange={(e) => handleChange(section.id, 'image', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {section.type === 'cta' && (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase">CTA Teks</label>
                    <Input
                      value={section.ctaText ?? ''}
                      onChange={(e) => handleChange(section.id, 'ctaText', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase">CTA Link</label>
                    <Input
                      value={section.ctaLink ?? ''}
                      onChange={(e) => handleChange(section.id, 'ctaLink', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2">
                Urutan:
                <Input
                  type="number"
                  value={section.order}
                  onChange={(e) => handleChange(section.id, 'order', Number(e.target.value))}
                  className="w-20"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={section.isActive}
                  onChange={(e) => handleChange(section.id, 'isActive', e.target.checked)}
                />
                Aktif
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### PHASE 5: Theme Integration (Days 6-8)

#### 5.1 Update Academic Classic
```typescript
// app/(public)/academic-classic/page.tsx
export default async function AcademicClassicPage() {
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');
  
  // Fetch all sections at once (SIMPLIFIED!)
  const [heroSection, statsSection, programsSection, ctaSection] = await Promise.all([
    db.landingSection.findUnique({ where: { slug: 'hero' } }),
    db.landingSection.findUnique({ where: { slug: 'stats' } }),
    db.landingSection.findUnique({ where: { slug: 'programs' } }),
    db.landingSection.findUnique({ where: { slug: 'cta' } }),
  ]);

  // Use sections in components (rest of page...)
  return (
    <ThemeProvider {...themeConfig}>
      <Hero
        title={heroSection?.title}
        subtitle={heroSection?.subtitle}
        body={heroSection?.body}
        image={heroSection?.image}
      />
      <Stats
        title={statsSection?.title}
        metadata={statsSection?.metadata}
      />
      {/* ... rest of page */}
    </ThemeProvider>
  );
}
```

#### 5.2 Same Pattern for Modern & Minimalist

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] All database migrations successful
- [ ] Old theme-specific sections backed up
- [ ] Global sections created and verified
- [ ] API endpoints tested
- [ ] Academic Classic page displays hero correctly
- [ ] Modern Vibrant page displays same hero
- [ ] Minimalist Clean page displays same hero
- [ ] Admin editor UI loads without errors
- [ ] Can edit hero section
- [ ] Changes appear on all 3 themes immediately
- [ ] CTA buttons work
- [ ] Stats display correctly
- [ ] No console errors
- [ ] Page load time < 100ms
- [ ] Images load correctly
- [ ] Responsive design works

---

## 🚀 Deployment Steps

### 1. On Staging First
```bash
# 1. Backup staging database
pg_dump staging_db > backup_staging.sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Run data migration script
npx ts-node scripts/migrate-to-global-sections.ts

# 4. Test all themes
npm run dev
# Visit: http://localhost:3000/academic-classic
# Visit: http://localhost:3000/modern-vibrant
# Visit: http://localhost:3000/minimalist-clean

# 5. Test admin
# Visit: http://localhost:3000/admin/website-settings/landing
```

### 2. On Production
```bash
# 1. Create backup
pg_dump production_db > backup_production_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy code changes
git push production main

# 3. Run migrations
npx prisma migrate deploy

# 4. Run data migration
npx ts-node scripts/migrate-to-global-sections.ts

# 5. Verify
curl https://yoursite.com/api/landing-sections

# 6. Monitor
- Check page load times
- Monitor error logs
- Test all theme pages
- Confirm admin works
```

---

## ⚠️ Rollback Plan

If anything goes wrong:

```bash
# 1. Stop application
systemctl stop myapp

# 2. Restore database backup
psql production_db < backup_production_[timestamp].sql

# 3. Restore previous code
git revert [commit-hash]
git push production main

# 4. Restart application
systemctl start myapp

# 5. Verify
# Check all pages load correctly
```

---

## 📝 Documentation

Save these in your project:
- [ ] This quickstart guide
- [ ] Migration script
- [ ] Backup location & procedure
- [ ] Rollback procedure
- [ ] Team handoff docs

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ All 3 themes display content from global sections
2. ✅ Admin can edit hero section once
3. ✅ Change immediately visible on all 3 themes
4. ✅ Page load time same or faster
5. ✅ No console errors
6. ✅ Database size reduced (9 → 5 rows)
7. ✅ Admin is happy with new UI
8. ✅ Zero downtime during migration

---

## 🎯 Questions During Implementation?

**Reference these documents**:
- `LANDING_PAGE_ANALYSIS.md` - Why this change
- `LANDING_PAGES_IMPLEMENTATION.md` - Detailed technical guide
- `LANDING_PAGES_VISUAL_COMPARISON.md` - Before/after examples
- `DATABASE_VS_JSON_ANALYSIS.md` - Storage solution logic

**Need help?** Each document has specific technical details.

---

**Ready to start? Get stakeholder approval and begin Phase 1!** ✅
