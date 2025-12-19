# Landing Page Configuration Analysis

## 📊 Current State Analysis

### 1. **Tema yang Ada**
Terdapat 3 tema landing page:
- **academic-classic** - Tema tradisional/akademik
- **modern-vibrant** - Tema modern dengan animasi
- **minimalist-clean** - Tema minimalis sederhana

### 2. **Database Schema (LandingSection)**
```
Fields:
├── id (String, @id)
├── themeId (String) - Specific theme (academic-classic, modern-vibrant, minimalist-clean)
├── slug (String) - Section identifier (hero, stats, cta, programs, philosophy, etc)
├── title (String)
├── subtitle (String?)
├── body (String?)
├── image (String?)
├── order (Int)
├── isActive (Boolean)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── @@unique([themeId, slug])
```

### 3. **Sections Per Theme**

#### Academic Classic
- ✅ hero
- ✅ stats
- ✅ cta

#### Modern Vibrant
- ✅ hero
- ✅ programs
- ✅ cta

#### Minimalist Clean
- ✅ hero
- ✅ philosophy
- ✅ cta

### 4. **Coverage Assessment**

**MASALAH DITEMUKAN:**

1. **Tidak Semua Tema Memiliki Section yang Sama**
   - Academic Classic: 3 sections (hero, stats, cta)
   - Modern Vibrant: 3 sections (hero, programs, cta)
   - Minimalist Clean: 3 sections (hero, philosophy, cta)
   - ⚠️ Inconsistent section coverage

2. **Static Sections yang Digunakan Tidak Lengkap**
   - Hanya menggunakan **hero section** untuk semua tema
   - Section lain (stats, programs, philosophy, cta) **tidak diintegrasikan** ke halaman tema
   - Banyak hardcoded data tetap di component (sampleNews, sampleFaculty, sampleTimeline, dll)

3. **Data Management Issues**
   - Seed data ada di `prisma/seed.js` (hardcoded)
   - Component masih menggunakan banyak inline/sample data
   - Tidak ada unified way untuk manage landing section content

4. **Admin Interface**
   - Current UI mengelompokkan per theme (per-theme management)
   - Redundant jika section content sama untuk semua tema
   - UX tidak optimal untuk bulk editing

### 5. **Component Integration Status**

**Academic Classic Page:**
```
✅ Hero section - Using from DB
❌ Stats section - Hardcoded sample data
❌ Welcome - Hardcoded text
❌ Programs - Hardcoded data
❌ NewsList - Using API (good!)
❌ Gallery - Using API (good!)
```

**Modern Vibrant Page:**
```
✅ Hero section - Using from DB
❌ BentoGrid - Hardcoded data
❌ StatisticsCounter - Hardcoded data
❌ Programs - Hardcoded data
❌ NewsSection - Using API (good!)
```

**Minimalist Clean Page:**
```
✅ Hero section - Using from DB (split parsing)
❌ MinimalStats - Hardcoded data
❌ MinimalAbout - Hardcoded data
❌ MinimalPrograms - Hardcoded data
```

---

## 🎯 Recommended Solution

### **OPTION 1: Global Landing Sections (RECOMMENDED)**

**Konsep:**
- Hapus `themeId` dari LandingSection schema
- Buat sections yang **universal** untuk semua tema
- Setiap tema hanya tinggal mengkonsumsi data yang sama
- Reduce redundancy, improve maintainability

**Keuntungan:**
- ✅ Single source of truth
- ✅ DRY principle (Don't Repeat Yourself)
- ✅ Easier admin management
- ✅ Smaller database footprint
- ✅ Better cache efficiency

**Schema Baru:**
```prisma
model LandingSection {
  id        String   @id @default(cuid())
  slug      String   @unique  // hero, stats, programs, about, etc
  type      String   // "hero" | "stats" | "content" | "gallery" | "cta"
  title     String
  subtitle  String?
  body      String?  @db.Text
  image     String?
  ctaText   String?
  ctaLink   String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  metadata  Json?    // For flexible data (featured items, etc)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("landing_sections")
}
```

**Global Sections Structure:**
```
hero:
  - title: "Membangun Generasi Unggul..."
  - subtitle: "Sekolah yang menanamkan..."
  - body: "SMK Negeri 1 Jakarta..."
  - image: "https://..."

stats:
  - title: "Statistik Kinerja Sekolah"
  - body: "Lulusan terserap 96%..."
  - metadata: { values: [96, 12, 5] }

programs:
  - title: "Program Unggulan"
  - body: "Pembelajaran coding, desain..."
  - metadata: { count: 12 }

about:
  - title: "Tentang Kami"
  - body: "..." 
  - image: "https://..."

cta:
  - title: "Daftar Sekarang"
  - ctaText: "Mulai Pendaftaran"
  - ctaLink: "/apply"
```

**Admin Interface:**
- Single global editor (tidak per-theme)
- Simpler UI, faster to manage
- All 3 themes auto-use same content

---

### **OPTION 2: Hybrid (Theme-Specific + Global)**

**Konsep:**
- Keep global sections (hero, stats, cta)
- Allow theme-specific overrides jika needed
- Best of both worlds

**Schema:**
```prisma
model LandingSection {
  id        String    @id @default(cuid())
  slug      String
  themeId   String?   // NULL = global, or specific theme
  title     String
  subtitle  String?
  body      String?
  image     String?
  order     Int
  isActive  Boolean
  createdAt DateTime
  updatedAt DateTime

  @@unique([slug, themeId])
  @@map("landing_sections")
}
```

**Pros & Cons:**
- ✅ Flexible for theme-specific content if needed
- ✅ Can fallback to global if theme-specific doesn't exist
- ❌ More complex logic
- ❌ Admin UI more complicated

---

## 💾 Data Storage Recommendation: **Database (Prisma)**

### Why Database > JSON:

1. **Dynamic Updates**
   - ✅ Admin can change content without code deployment
   - ❌ JSON requires code rebuild

2. **Query Flexibility**
   - ✅ Easy to filter by `isActive`, `order`
   - ✅ Can implement search/filter in admin
   - ❌ JSON limited to file read

3. **Performance**
   - ✅ Database can be cached (Redis)
   - ✅ Optimized queries
   - ❌ JSON file must be read entirely

4. **Scalability**
   - ✅ Can easily add more metadata fields
   - ✅ Support for complex data types
   - ❌ JSON structure is rigid

5. **Admin Interface**
   - ✅ Real-time updates
   - ✅ Beautiful WYSIWYG editors
   - ❌ JSON editing is error-prone

### Recommended Stack:
```
Frontend Admin: React Form + Rich Text Editor
├── Handles: title, subtitle, body, image, CTA
├── With: Preview, validation, real-time save
│
API: Next.js API Route
├── PATCH /api/landing-sections/:slug
├── GET /api/landing-sections
│
Database: Prisma + PostgreSQL
├── LandingSection table
├── With caching layer (optional Redis)
│
Public Pages: Server Components
├── Fetch at build/request time
├── Cache with revalidate: 3600 (1 hour)
```

---

## 🔄 Implementation Roadmap

### Phase 1: Database Migration
```
1. Update Prisma schema (remove themeId, add type/metadata)
2. Create migration script
3. Backfill existing data
```

### Phase 2: API Updates
```
1. Update `/api/landing-sections` routes
2. Add type-specific handlers
3. Add validation for different section types
```

### Phase 3: Admin UI Rebuild
```
1. Create new unified LandingPageEditor
2. Remove per-theme grouping
3. Add section type selector
4. Implement rich text editor for body
5. Add preview for each section type
```

### Phase 4: Theme Integration
```
1. Update academic-classic/page.tsx
2. Update modern-vibrant/page.tsx
3. Update minimalist-clean/page.tsx
4. Fetch multiple sections from DB
5. Remove hardcoded data
```

### Phase 5: Testing & Optimization
```
1. Test all 3 themes with new data flow
2. Add ISR (Incremental Static Regeneration)
3. Cache strategy optimization
```

---

## 🎨 Proposed New Admin UI Structure

```
/admin/website-settings/landing/

┌─────────────────────────────────────────────┐
│ Landing Page Sections Configuration         │
│                                             │
│ Filter: [All Types ▼]  [Active Only ✓]    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ Hero Section                        [Edit] │
│ └─ Used on all 3 themes                    │
│ └─ Last updated: Dec 11, 2025             │
│                                             │
│ Statistics Section                 [Edit] │
│ └─ Used on all 3 themes                    │
│ └─ Last updated: Dec 10, 2025             │
│                                             │
│ About Section                      [Edit] │
│ └─ Inactive                                │
│                                             │
│ Programs Section                   [Edit] │
│ └─ Used on all 3 themes                    │
│                                             │
│ CTA Section                        [Edit] │
│ └─ Used on all 3 themes                    │
│                                             │
│ [+ Add New Section]                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📋 Summary

### Current Issues:
- ❌ Inconsistent sections across themes
- ❌ Hero section is only integrated section
- ❌ Heavy reliance on hardcoded sample data
- ❌ Admin UI is theme-centric (redundant)
- ❌ Not scalable for future theme additions

### Proposed Solution:
1. **Migrate to Global Sections** (Remove themeId)
2. **Use Database + API** (Not JSON)
3. **Rebuild Admin UI** (Simplified, unified)
4. **Update Theme Components** (Consume from DB)
5. **Remove Hardcoded Data** (Complete migration to DB)

### Expected Benefits:
- ✅ Single source of truth
- ✅ DRY principle
- ✅ Better performance (cacheable)
- ✅ Easier maintenance
- ✅ Scalable architecture
- ✅ Professional CMS feel
