# Dokumen Rencana Pengembangan Sistem CMS Website Sekolah

## (Updated: Multi-Theme Support)

## 1. Executive Summary

### 1.1 Deskripsi Proyek

Pengembangan Content Management System (CMS) untuk website sekolah menggunakan teknologi modern dengan fokus pada kemudahan pengelolaan konten, performa optimal, **multi-theme system**, dan skalabilitas untuk integrasi sistem masa depan.

### 1.2 Teknologi Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Media Management**: Cloudinary
- **Authentication**: NextAuth.js / Clerk
- **ORM**: Prisma / Drizzle ORM
- **Theme System**: Dynamic theme switching

### 1.3 Tujuan Milestone 1

Membangun CMS website sekolah yang fungsional dengan fitur manajemen konten lengkap, **3 pilihan tema landing page**, dan panel admin yang user-friendly.

---

## 2. FITUR BARU: Multi-Theme System

### 2.1 Konsep Theme System

**Tiga Tema Landing Page:**

#### **Tema 1: "Academic Classic"**

- **Karakter**: Professional, formal, trustworthy
- **Target**: Sekolah menengah hingga atas, institusi formal
- **Warna Dominan**: Navy blue, white, gold accent
- **Typography**: Serif untuk heading (Playfair Display), Sans-serif untuk body
- **Layout Style**:
  - Grid-based layout traditional
  - Hero section dengan gambar full-width
  - Card-based content sections
  - Sidebar untuk informasi penting
- **Komponen Khas**:
  - Timeline untuk sejarah sekolah
  - Academic calendar dalam grid view
  - Faculty cards dengan foto formal
  - Testimonial dengan quote style klasik
  - News list dengan thumbnail kiri

#### **Tema 2: "Modern Vibrant"**

- **Karakter**: Dynamic, energetic, youthful
- **Target**: Sekolah dasar hingga menengah, sekolah modern
- **Warna Dominan**: Bright colors (teal, orange, purple), gradients
- **Typography**: Modern sans-serif (Poppins/Inter)
- **Layout Style**:
  - Asymmetric layouts dengan geometric shapes
  - Hero section dengan animated elements
  - Bento grid untuk konten
  - Full-bleed images dan overlays
  - Floating cards dengan shadows
- **Komponen Khas**:
  - Interactive statistics dengan counter animation
  - Carousel dengan parallax effect
  - Video backgrounds di hero
  - Card hover animations
  - Icon-based feature showcase
  - Masonry gallery layout

#### **Tema 3: "Minimalist Clean"**

- **Karakter**: Simple, clean, modern-minimal
- **Target**: Sekolah internasional, sekolah dengan branding minimalis
- **Warna Dominan**: Monochrome (black, white, gray) dengan satu accent color
- **Typography**: Clean sans-serif (Inter/Satoshi)
- **Layout Style**:
  - Generous whitespace
  - Single column layouts
  - Minimal borders dan shadows
  - Flat design elements
  - Large typography
- **Komponen Khas**:
  - Simple hero dengan large text
  - List-based news layout
  - Minimal navigation (hamburger menu)
  - Grid gallery tanpa borders
  - Clean forms dengan floating labels
  - Subtle micro-interactions

### 2.2 Theme Configuration System

**Admin Panel - Theme Selector:**

```
Pengaturan > Tema Website
├── Preview Tema (Screenshot semua tema)
├── Pilih Tema Aktif (Radio buttons dengan preview)
├── Customization per Tema:
    ├── Primary Color (Color picker)
    ├── Secondary Color
    ├── Font Heading (Dropdown)
    ├── Font Body (Dropdown)
    └── Logo per tema (Upload)
```

**Fitur Customization:**

- **Color Customization**: Admin bisa override warna utama
- **Font Selection**: Pilih dari Google Fonts populer
- **Logo Upload**: Upload logo berbeda untuk setiap tema (untuk adaptasi warna background)
- **Layout Options**: Toggle beberapa komponen (sidebar, breadcrumb, dll)

---

## 3. Struktur Database (Updated)

### 3.1 Entitas Baru untuk Theme System

```
Themes
- id, name, slug, description, preview_image, is_active, created_at

ThemeSettings
- id, theme_id, key, value, type (color/font/boolean/number)
- Examples:
  - primary_color: "#1e40af"
  - secondary_color: "#f59e0b"
  - font_heading: "Playfair Display"
  - font_body: "Inter"
  - show_sidebar: true
  - hero_style: "fullwidth" | "boxed" | "minimal"

Settings (Updated - tambahkan)
- active_theme_id (reference ke Themes table)
```

### 3.2 Database Schema Lengkap (Updated)

```
Users
- id, name, email, password, role, avatar, created_at, updated_at

Articles (Landing Page Articles)
- id (cuid), title, slug, content (Text), excerpt, image, category (enum),
  isPublished (boolean), publishedAt, created_at, updated_at
- Category: Academic, Achievement, Announcement, Other

News (Landing Page News)
- id (cuid), title, slug, content (Text), excerpt, image, category (enum),
  isPublished (boolean), publishedAt, created_at, updated_at
- Category: School News, Achievement, Event Report, Announcement

Events (School Events)
- id (cuid), title, slug, description (Text), startDate (DateTime), endDate (DateTime),
  location, image, isPublished (boolean), created_at, updated_at

Categories
- id, name, slug, description, parent_id, color (untuk label di themes)

Tags
- id, name, slug

PostTags
- post_id, tag_id

Pages
- id, title, slug, content, template, seo_title, seo_description,
  status, created_at, updated_at

Announcements
- id, title, content, is_pinned, published_at, expired_at, created_at, updated_at

Gallery
- id, title, description, album_id, media_type,
  cloudinary_url, cloudinary_id, created_at

Albums
- id, name, description, cover_image, created_at

Sliders/Banners
- id, title, image_url, link, order, is_active, created_at

Menus
- id, title, url, parent_id, order, target, created_at

Themes (NEW)
- id, name, slug, description, preview_image, is_active, created_at

ThemeSettings (NEW)
- id, theme_id, key, value, type, created_at, updated_at

Settings
- id, key, value, type, created_at, updated_at
- Tambahan: active_theme_id

ActivityLogs
- id, user_id, action, model, model_id, description, ip_address, created_at
```

---

## 4. Arsitektur Theme System

### 4.1 Folder Structure (Updated)

```
/src
  /app
    /(public)
      /[theme]              # Dynamic theme routing
        /page.tsx           # Homepage with theme context
        /berita
        /profil
        /galeri
        /kontak
    /(admin)
      /dashboard
      /berita
      /galeri
      /tema                 # NEW: Theme management
        /page.tsx           # Theme selector & customization
      /pengaturan
    /api
      /auth
      /posts
      /media
      /themes               # NEW: Theme API
  /components
    /themes                 # NEW: Theme-specific components
      /academic-classic
        /Hero.tsx
        /NewsCard.tsx
        /Gallery.tsx
        /Footer.tsx
      /modern-vibrant
        /Hero.tsx
        /NewsCard.tsx
        /Gallery.tsx
        /Footer.tsx
      /minimalist-clean
        /Hero.tsx
        /NewsCard.tsx
        /Gallery.tsx
        /Footer.tsx
    /admin
    /ui
      /breadcrumb.tsx         # NEW: Breadcrumb navigation component
      /rich-text-editor.tsx   # NEW: WYSIWYG editor with Tiptap
  /lib
    /db
    /auth
    /cloudinary
    /themes                 # NEW: Theme utilities
      /themeConfig.ts
      /themeProvider.tsx
  /styles
    /themes                 # NEW: Theme-specific styles
      /academic-classic.css
      /modern-vibrant.css
      /minimalist-clean.css
  /types
  /hooks
    /useTheme.ts            # NEW: Theme hook
/prisma
/public
  /themes                   # NEW: Theme assets
    /academic-classic
    /modern-vibrant
    /minimalist-clean
```

### 4.2 Theme Implementation Strategy

**Approach: Component-based Theme System**

```typescript
// lib/themes/themeConfig.ts
export const themes = {
  'academic-classic': {
    name: 'Academic Classic',
    colors: {
      primary: '#1e3a8a',
      secondary: '#d97706',
      accent: '#fbbf24',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    components: {
      Hero: 'academic-classic/Hero',
      NewsCard: 'academic-classic/NewsCard',
      // ... other components
    }
  },
  // ... other themes
}

// hooks/useTheme.ts
export function useTheme() {
  const activeTheme = await getActiveTheme(); // from database
  return themes[activeTheme.slug];
}

// app/(public)/page.tsx
export default async function HomePage() {
  const theme = await getActiveTheme();
  const ThemeHero = await import(`@/components/themes/${theme.slug}/Hero`);

  return (
    <ThemeProvider theme={theme}>
      <ThemeHero.default />
      {/* other components */}
    </ThemeProvider>
  );
}
```

**CSS Variables Approach:**

```css
/* Tailwind config with CSS variables */
:root {
  --color-primary: theme("primary_color");
  --color-secondary: theme("secondary_color");
  --font-heading: theme("font_heading");
  --font-body: theme("font_body");
}

/* Each theme overrides these variables */
[data-theme="academic-classic"] {
  --color-primary: #1e3a8a;
  --color-secondary: #d97706;
}

[data-theme="modern-vibrant"] {
  --color-primary: #06b6d4;
  --color-secondary: #f97316;
}
```

---

## 5. Fitur Admin Panel untuk Theme Management

### 5.1 Halaman Manajemen Tema

**Layout Halaman:**

```
┌─────────────────────────────────────────────┐
│ 🏠 > Tema                                   │ (Breadcrumb)
├─────────────────────────────────────────────┤
│ Manajemen Tema Website                      │
├─────────────────────────────────────────────┤
│                                             │
│ [Tema Aktif: Academic Classic]              │
│                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│ │ Academic │  │  Modern  │  │Minimalist│  │
│ │ Classic  │  │ Vibrant  │  │  Clean   │  │
│ │ [AKTIF]  │  │          │  │          │  │
│ │ Preview  │  │ Preview  │  │ Preview  │  │
│ └──────────┘  └──────────┘  └──────────┘  │
│   [Gunakan]    [Gunakan]    [Gunakan]      │
│                                             │
│ ┌─ Kustomisasi Tema ───────────────────┐   │
│ │                                       │   │
│ │ Warna Utama:    [#1e3a8a] 🎨         │   │
│ │ Warna Sekunder: [#d97706] 🎨         │   │
│ │ Warna Aksen:    [#fbbf24] 🎨         │   │
│ │                                       │   │
│ │ Font Heading:   [Playfair ▼]         │   │
│ │ Font Body:      [Inter ▼]            │   │
│ │                                       │   │
│ │ Logo Header:    [Upload] 📁           │   │
│ │ Logo Footer:    [Upload] 📁           │   │
│ │                                       │   │
│ │ [ Preview Perubahan ]                 │   │
│ │ [ Simpan Pengaturan ]                 │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 5.2 Content Management Layout Pattern

**Consistent Page Structure:**

```
All admin pages follow consistent layout:
- Container: p-6 max-w-7xl mx-auto
- Breadcrumb at top (mb-6)
- Page header with title and description
- Main content area with space-y-4 or space-y-6

List Pages (Articles, News, Events, Gallery):
┌─────────────────────────────────────┐
│ 🏠 > Section Name                   │
├─────────────────────────────────────┤
│ Section Name                        │
│ Description text                    │
│                      [+ Add Button] │
├─────────────────────────────────────┤
│ [Search] [Filters]                  │
│                                     │
│ DataTable with:                     │
│ - Sortable columns                  │
│ - Search by title                   │
│ - Category/status filters           │
│ - Edit/Delete actions               │
└─────────────────────────────────────┘

Create/Edit Pages:
┌─────────────────────────────────────┐
│ 🏠 > Section > Create New / Edit    │
├─────────────────────────────────────┤
│ Create New Section / Edit Section   │
│ Description text                    │
├─────────────────────────────────────┤
│                                     │
│ Card with Form:                     │
│ ┌─────────────────────────────────┐ │
│ │ Title: [___________________]    │ │
│ │ Slug:  [___________________]    │ │
│ │        (auto-generated)         │ │
│ │                                 │ │
│ │ Category: [Dropdown ▼]          │ │
│ │                                 │ │
│ │ Content:                        │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [B] [I] [H2] [•] [1.] ["']  │ │ │
│ │ ├─────────────────────────────┤ │ │
│ │ │ Rich Text Editor (Tiptap)   │ │ │
│ │ │ with formatting toolbar     │ │ │
│ │ │                             │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ [✓] Published                   │ │
│ │                                 │ │
│ │ [Cancel] [Save Article]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Fitur Halaman:**

1. **Theme Gallery**: Grid preview semua tema dengan screenshot
2. **Quick Switch**: Button untuk langsung switch tema
3. **Live Preview**: Modal preview tema sebelum aktivasi
4. **Customization Panel**: Form untuk customize warna dan font
5. **Reset to Default**: Button untuk reset ke default theme settings
6. **Export/Import**: Export theme settings untuk backup

### 5.2 Theme Preview Modal

```
┌────────────────────────────────────────┐
│  Preview: Modern Vibrant         [✕]  │
├────────────────────────────────────────┤
│                                        │
│  [Iframe: Live preview homepage]       │
│                                        │
│  📱 Desktop  |  Tablet  |  Mobile      │
│                                        │
│  [ Gunakan Tema Ini ]  [ Batal ]      │
└────────────────────────────────────────┘
```

---

## 6. Komponen yang Perlu Dibuat per Tema

### 6.1 Core Components (Semua Tema)

Setiap tema harus memiliki implementasi sendiri untuk:

**Layout Components:**

- `Header.tsx` - Navigation bar
- `Footer.tsx` - Footer dengan info sekolah
- `Sidebar.tsx` (optional untuk beberapa tema)

**Homepage Components:**

- `Hero.tsx` - Hero section
- `StatsSection.tsx` - Statistik sekolah
- `NewsSection.tsx` - Berita terbaru
- `GalleryPreview.tsx` - Preview galeri
- `TestimonialSection.tsx` - Testimoni
- `ContactSection.tsx` - Info kontak

**Content Components:**

- `NewsCard.tsx` - Card berita
- `NewsDetail.tsx` - Detail berita
- `GalleryGrid.tsx` - Grid galeri
- `AnnouncementBanner.tsx` - Banner pengumuman
- `Breadcrumb.tsx` - Breadcrumb navigation

**Form Components:**

- `ContactForm.tsx` - Form kontak
- `SearchBar.tsx` - Pencarian

### 6.2 Shared Components (Theme-agnostic)

Komponen yang sama di semua tema (hanya styling berbeda):

- Button variations
- Input fields
- Modal/Dialog
- Alert/Notification
- Loading states
- Pagination

---

## 7. Timeline Pengembangan (Updated)

### Fase 1: Setup & Foundation (2 minggu)

- Setup project Next.js dengan konfigurasi Tailwind
- Setup database PostgreSQL dan Prisma ORM
- Integrasi Cloudinary
- Setup authentication system
- **Design database schema dengan theme support**
- **Setup theme system architecture**

### Fase 2: Theme System Core (2 minggu)

- **Implementasi theme provider dan context**
- **Database schema untuk themes dan theme_settings**
- **Theme switching mechanism**
- **CSS variables setup dengan Tailwind**
- **Theme configuration utilities**

### Fase 3: Tema 1 - Academic Classic (2-3 minggu)

- **Design dan development semua components**
- **Homepage complete dengan theme**
- **All pages (profil, berita, galeri, kontak)**
- **Responsive implementation**
- **Testing theme 1**

### Fase 4: Tema 2 - Modern Vibrant (2-3 minggu)

- **Design dan development semua components**
- **Homepage dengan animations**
- **All pages dengan vibrant style**
- **Responsive implementation**
- **Testing theme 2**

### Fase 5: Tema 3 - Minimalist Clean (2-3 minggu)

- **Design dan development semua components**
- **Homepage dengan minimalist approach**
- **All pages dengan clean design**
- **Responsive implementation**
- **Testing theme 3**

### Fase 6: Admin Panel Core (2-3 minggu)

- Dashboard layout dengan categorized navigation
  - Dashboard (Home)
  - Website Sekolah/CMS (Articles, News, Events, Gallery)
  - Manajemen User
  - Pengaturan
- Breadcrumb navigation di semua halaman
- Consistent layout (p-6, max-w-7xl, mx-auto)
- User management
- Manajemen berita/artikel dengan WYSIWYG editor (Tiptap)
- Media library integration
- Halaman statis editor

### Fase 7: Admin Panel Extended (2 minggu)

- Manajemen galeri
- Pengumuman
- Menu builder
- Slider/banner management
- **Theme management page**
- **Theme customization panel**
- Settings page
- Refactored CRUD: Separate create/edit pages (bukan modal)
  - Articles: /new dan /[id]/edit
  - News: /new dan /[id]/edit
  - Events: /new dan /[id]/edit
- Rich text editor integration di semua content forms

### Fase 8: Integration & Polish (1-2 minggu)

- **Theme switching testing**
- **Cross-theme consistency check**
- **Theme customization testing**
- Performance optimization
- Bug fixing

### Fase 9: SEO & Optimization (1 minggu)

- SEO meta tags implementation
- Sitemap generation
- Performance optimization per theme
- Image lazy loading
- Caching strategy

### Fase 10: Testing & Deployment (1-2 minggu)

- Theme switching integration testing
- User acceptance testing
- Cross-browser testing per theme
- Bug fixing
- Production deployment
- Documentation

**Total Estimasi: 17-23 minggu (4-6 bulan)**

---

## 8. Technical Implementation Details

### 8.1 Theme Switching Flow

```typescript
// API Route: /api/themes/switch
export async function POST(request: Request) {
  const { themeId } = await request.json();

  // Update active theme in database
  await db.settings.update({
    where: { key: 'active_theme_id' },
    data: { value: themeId }
  });

  // Clear cache
  revalidatePath('/', 'layout');

  return Response.json({ success: true });
}

// Server Component: Get Active Theme
export async function getActiveTheme() {
  const setting = await db.settings.findUnique({
    where: { key: 'active_theme_id' }
  });

  const theme = await db.themes.findUnique({
    where: { id: setting.value },
    include: { settings: true }
  });

  return theme;
}

// Client Component: Theme Provider
'use client';

export function ThemeProvider({ theme, children }) {
  useEffect(() => {
    // Apply theme CSS variables
    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.setAttribute('data-theme', theme.slug);
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 8.2 Dynamic Component Loading

```typescript
// Shared layout untuk semua themes
export default async function PublicLayout({ children }) {
  const theme = await getActiveTheme();

  // Dynamic import theme components
  const Header = dynamic(() => import(`@/components/themes/${theme.slug}/Header`));
  const Footer = dynamic(() => import(`@/components/themes/${theme.slug}/Footer`));

  return (
    <ThemeProvider theme={theme}>
      <Header />
      {children}
      <Footer />
    </ThemeProvider>
  );
}
```

### 8.3 Tailwind Configuration for Themes

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)"
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)"
      }
    }
  },
  // Safelist untuk dynamic classes
  safelist: [
    "bg-primary",
    "text-primary",
    "border-primary"
    // ... other dynamic classes
  ]
};
```

### 8.4 Admin Layout with Categorized Navigation

```typescript
// app/admin/AdminLayoutClient.tsx
type AppCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  href?: string;
  subMenus?: SubMenu[];
};

const appCategories: AppCategory[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "bg-blue-500",
    description: "Overview & Statistics",
    href: "/admin"
  },
  {
    id: "cms",
    name: "Website Sekolah",
    icon: Globe,
    color: "bg-purple-500",
    description: "Content Management",
    subMenus: [
      { name: "Articles", href: "/admin/articles", icon: FileText },
      { name: "News", href: "/admin/news", icon: Newspaper },
      { name: "Events", href: "/admin/events", icon: Calendar },
      { name: "Gallery", href: "/admin/gallery", icon: Image }
    ]
  },
  {
    id: "users",
    name: "Manajemen User",
    icon: Users,
    color: "bg-pink-500",
    description: "User Management",
    subMenus: [{ name: "All Users", href: "/admin/users", icon: UserCircle }]
  },
  {
    id: "settings",
    name: "Pengaturan",
    icon: Settings,
    color: "bg-gray-500",
    description: "System Settings",
    href: "/admin/settings"
  }
];

// Accordion behavior: only one menu expanded at a time
const toggleMenu = (appId: string) => {
  setExpandedMenus(prev => prev.includes(appId) ? [] : [appId]);
};
```

### 8.5 Breadcrumb Navigation

```typescript
// components/ui/breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link href="/admin">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Usage in pages:
<Breadcrumb items={[
  { label: "Articles", href: "/admin/articles" },
  { label: "Create New" }
]} />
```

### 8.6 Rich Text Editor (Tiptap)

```typescript
// components/ui/rich-text-editor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

export function RichTextEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder })
    ],
    content,
    immediatelyRender: false, // SSR fix
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4'
      }
    }
  });

  return (
    <div className="border rounded-lg">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

---

## 9. Design Guidelines per Tema

### 9.1 Academic Classic Design System

**Colors:**

- Primary: `#1e3a8a` (Navy Blue)
- Secondary: `#d97706` (Amber)
- Accent: `#fbbf24` (Gold)
- Background: `#ffffff` (White)
- Text: `#1f2937` (Gray 800)

**Typography:**

- Heading: Playfair Display (Serif)
- Body: Inter (Sans-serif)
- Size scale: 16px base, 1.25 ratio

**Spacing:**

- Generous padding (8-12 spacing units)
- Clear section separation
- Traditional margins

**Components Style:**

- Cards with subtle shadows
- Border radius: 8px (rounded-lg)
- Hover effects: subtle scale
- Buttons: solid with border

**Layout:**

- Max width: 1280px
- Sidebar: 280px
- Grid: 12 columns

### 9.2 Modern Vibrant Design System

**Colors:**

- Primary: `#06b6d4` (Cyan)
- Secondary: `#f97316` (Orange)
- Accent: `#a855f7` (Purple)
- Background: Gradients
- Text: `#0f172a` (Slate 900)

**Typography:**

- Heading: Poppins (Bold, Sans-serif)
- Body: Inter (Sans-serif)
- Size scale: 16px base, 1.333 ratio

**Spacing:**

- Dynamic spacing (6-10 units)
- Overlapping sections
- Asymmetric layouts

**Components Style:**

- Cards with large shadows and hover lift
- Border radius: 16px (rounded-2xl)
- Gradients backgrounds
- Animated hover effects
- Buttons: gradient fills

**Layout:**

- Full-bleed sections
- Bento grid style
- Floating elements

### 9.3 Minimalist Clean Design System

**Colors:**

- Primary: `#000000` (Black)
- Secondary: `#3b82f6` (Blue) - single accent
- Background: `#ffffff` (White)
- Text: `#171717` (Neutral 900)
- Subtle: `#f5f5f5` (Neutral 100)

**Typography:**

- Heading: Inter (Bold, Sans-serif)
- Body: Inter (Regular)
- Size scale: 16px base, 1.5 ratio (large)

**Spacing:**

- Generous whitespace (12-20 units)
- Minimal padding on containers
- Wide letter spacing for headings

**Components Style:**

- Cards: no shadows, 1px border
- Border radius: 0px or 4px (minimal)
- No shadows
- Hover: subtle underlines
- Buttons: outlined or text

**Layout:**

- Max width: 1024px
- Single column preferred
- Centered content
- Minimal navigation

---

## 10. Content Strategy per Tema

### 10.1 Adaptation Guidelines

**Content yang sama, presentation berbeda:**

**Academic Classic:**

- Berita: Grid dengan thumbnail kiri, excerpt panjang
- Galeri: Grid dengan border dan caption
- Hero: Single image dengan overlay text

**Modern Vibrant:**

- Berita: Masonry layout, excerpt pendek, large images
- Galeri: Mosaic layout dengan hover zoom
- Hero: Video background atau carousel

**Minimalist Clean:**

- Berita: List layout, minimal images, focus on text
- Galeri: Simple grid, no effects
- Hero: Large typography, minimal image

### 10.2 Image Optimization per Theme

```javascript
// Image sizes per theme
const imageSizes = {
  "academic-classic": {
    hero: { width: 1920, height: 600 },
    newsCard: { width: 400, height: 300 },
    gallery: { width: 800, height: 600 }
  },
  "modern-vibrant": {
    hero: { width: 1920, height: 800 },
    newsCard: { width: 600, height: 400 },
    gallery: { width: 1200, height: 800 }
  },
  "minimalist-clean": {
    hero: { width: 1920, height: 400 },
    newsCard: { width: 600, height: 400 },
    gallery: { width: 1000, height: 1000 }
  }
};
```

---

## 11. Testing Strategy untuk Multi-Theme

### 11.1 Testing Checklist

**Functional Testing:**

- [ ] Theme switching berfungsi tanpa error
- [ ] Semua components load di setiap tema
- [ ] Customization color/font tersimpan
- [ ] Cache clearing setelah theme switch
- [ ] Navigation consistency across themes
- [ ] Breadcrumb navigation di semua halaman
- [ ] Rich text editor berfungsi tanpa SSR error
- [ ] CRUD operations (create/edit/delete) untuk Articles, News, Events
- [ ] Auto-slug generation dari title
- [ ] Form validation dengan Zod
- [ ] Category filtering dan search di DataTable
- [ ] Menu kategorisasi dengan accordion behavior

**Visual Testing:**

- [ ] Responsive di semua breakpoints per theme
- [ ] Color contrast accessibility
- [ ] Font readability
- [ ] Image optimization per theme
- [ ] Animation performance

**Cross-browser Testing:**

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

**Performance Testing:**

- [ ] Lighthouse score > 90 untuk setiap tema
- [ ] CSS bundle size per theme
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s

### 11.2 Theme-Specific Test Cases

```
Test Case: Theme Switching
1. Admin login
2. Navigate to Theme Management
3. Select different theme
4. Save changes
5. Open public site in new tab
6. Verify theme applied
7. Check all pages render correctly
8. Verify customization persists

Test Case: Theme Customization
1. Select a theme
2. Change primary color
3. Change fonts
4. Upload custom logo
5. Save changes
6. Verify preview shows changes
7. Open public site
8. Verify customizations applied
9. Check color contrast ratios
```

---

## 12. Documentation Requirements (Updated)

### 12.1 Theme Documentation

**Per Theme:**

- Design system documentation (colors, typography, spacing)
- Component usage guidelines
- Customization options
- Best practices for content
- Image size recommendations

**Theme Development Guide:**

- How to create a new theme
- Component structure requirements
- CSS variables usage
- Testing new themes
- Deployment checklist

### 12.2 Admin User Guide (Updated)

Tambahan untuk theme management:

- Cara memilih tema
- Cara customize warna dan font
- Upload logo untuk tema
- Preview tema sebelum aktivasi
- Best practices pemilihan tema
- Troubleshooting theme issues

---

## 13. Future Enhancements untuk Theme System

### 13.1 Advanced Features (Post-Milestone 1)

1. **Custom Theme Builder**
   - Visual theme editor
   - Drag-and-drop layout builder
   - Real-time preview

2. **Theme Marketplace**
   - Import tema dari komunitas
   - Export tema untuk sharing

3. **A/B Testing**
   - Test multiple themes
   - Analytics per theme
   - Conversion tracking

4. **Scheduled Theme Switching**
   - Theme berbeda untuk event khusus
   - Seasonal themes

5. **Multi-language Theme Support**
   - RTL support untuk bahasa Arab
   - Font adjustments per language

6. **Dark Mode**
   - Dark variant per theme
   - Auto-switch based on time
   - User preference memory

---

## 14. Resource Requirements (Updated)

### 14.1 Development Team (Updated)

- 1-2 Full-stack Developer (Next.js) - **increased for theme development**
- 1 UI/UX Designer - **REQUIRED for 3 themes**
- 1 QA Tester - **RECOMMENDED**

### 14.2 Design Assets Required

**Per Theme (3x):**

- Homepage design (Desktop, Tablet, Mobile)
- Inner pages design (Berita, Galeri, Profil, Kontak)
- Component library (buttons, cards, forms)
- Icon set
- Image templates
- Color palette
- Typography scale

**Total:** ~30-40 design mockups

---

## 15. Success Metrics (Updated)

### 15.1 Theme System KPIs

- [ ] 3 themes fully functional
- [ ] Theme switching < 2 seconds
- [ ] No visual glitches during switch
- [ ] All themes pass accessibility tests (WCAG AA)
- [ ] All themes achieve Lighthouse score > 90
- [ ] Theme customization saves successfully
- [ ] Mobile responsive on all themes
- [ ] Cross-browser compatible

### 15.2 User Satisfaction

- Admin dapat switch theme dengan mudah
- Preview theme akurat sebelum aktivasi
- Customization intuitive
- Performance tetap optimal di semua themes
- Content tetap readable di semua themes

---

## 16. Risk Management (Updated)

### 16.1 Additional Risks dengan Multi-Theme

**Risk 1: Inconsistent User Experience**

- Mitigasi: Strict design guidelines per theme, component checklist

**Risk 2: Performance Degradation**

- Mitigasi: Code splitting per theme, lazy loading, CSS optimization

**Risk 3: Maintenance Complexity**

- Mitigasi: Shared components, theme abstraction layer, documentation

**Risk 4: Content Not Optimized for All Themes**

- Mitigasi: Content guidelines, image size recommendations, admin training

**Risk 5: Extended Development Time**

- Mitigasi: Phased theme development, reusable components, clear milestones

---

## 17. Kesimpulan (Updated)

CMS Website Sekolah dengan **Multi-Theme System** ini memberikan fleksibilitas luar biasa bagi sekolah untuk menyesuaikan tampilan website sesuai identitas dan preferensi mereka. Dengan 3 pilihan tema yang berbeda karakternya:

**Keunggulan Sistem:**

- **Fleksibilitas**: Sekolah dapat mengubah tampilan tanpa development
- **Personalisasi**: Customization warna, font, dan logo per tema
- **Skalabilitas**: Mudah menambah tema baru di masa depan
- **Konsistensi**: Content management tetap sama untuk semua tema
- **Modern**: Menggunakan best practices theme system

**Investment Value:**

- One-time development untuk 3 themes
- Future-proof dengan theme architecture
- Dapat dijadikan unique selling point
- Meningkatkan user satisfaction

Sistem ini siap menjadi solusi CMS yang comprehensive dan flexible untuk berbagai tipe sekolah dengan kebutuhan branding yang berbeda.

---

**Estimasi Revised: 17-23 minggu (4-6 bulan) dengan 3 themes complete**
