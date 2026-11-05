# Landing Page & CMS Website Sekolah

Dokumen konsolidasi untuk landing page publik, CMS website sekolah, tema, dan status implementasinya.

---

## 1. Overview

**Stack:** Next.js 14+ · PostgreSQL · Prisma · Tailwind CSS · Cloudinary · NextAuth.js · Tiptap (rich text)

**Tiga tema landing page** yang bisa dipilih dan dikustomisasi dari Admin:

| Tema | Karakter | Target | Warna Dominan |
|------|----------|--------|---------------|
| **Academic Classic** | Professional, formal | SMP–SMA/SMK, institusi formal | Navy blue, white, gold |
| **Modern Vibrant** | Dynamic, youthful | SD–SMP, sekolah modern | Teal, orange, purple + gradient |
| **Minimalist Clean** | Simple, modern-minimal | Sekolah internasional | Monochrome + 1 accent color |

---

## 2. Theme System

### Customization per Tema (Admin Panel → Pengaturan → Tema Website)
- Primary & secondary color (color picker)
- Font heading & body (Google Fonts dropdown)
- Logo upload per tema
- Toggle komponen (hero style, sidebar, dll)

### Komponen Khas per Tema

**Academic Classic:** Timeline sejarah, faculty cards formal, testimonial quote klasik, academic calendar grid, news list + thumbnail kiri.

**Modern Vibrant:** Stats counter animasi, carousel parallax, bento grid konten, masonry gallery, hover card animations, video background hero.

**Minimalist Clean:** Hero dengan large typography, list-based news, minimal navigation (hamburger), borderless gallery, floating label forms, subtle micro-interactions.

---

## 3. Database Schema (Key Tables)

```
Users               – id, name, email, password, role, avatar
Articles/News       – id (cuid), title, slug, content, excerpt, image, category, isPublished
Events              – id, title, slug, description, startDate, endDate, location, image
Pages               – id, title, slug, content, template, seo_title, seo_description, status
Announcements       – id, title, content, is_pinned, published_at, expired_at
Gallery / Albums    – Cloudinary-based, album_id, media_type
Sliders/Banners     – id, title, image_url, link, order, is_active
Menus               – id, title, url, parent_id, order, target
Themes              – id, name, slug, description, preview_image, is_active
ThemeSettings       – id, theme_id, key, value, type  (color/font/boolean/number)
Settings            – key/value store, termasuk active_theme_id
ActivityLogs        – user_id, action, model, model_id, ip_address
```

---

## 4. TODO Checklist

### Phase 1 — Setup & Infrastructure ✅ SELESAI
- [x] Next.js 14, TypeScript, Tailwind, ESLint, Prettier
- [x] PostgreSQL + Prisma ORM, schema & migrations
- [x] NextAuth.js auth flow, login page, protected routes & middleware
- [x] Folder structure (`/components`, `/app`, `/lib`, `/types`, `/public`)

### Phase 2 — Admin Panel ✅ SELESAI
- [x] Admin layout & navigation, dashboard, RBAC
- [x] CRUD forms: artikel, berita, event, halaman statis, galeri
- [x] Form validation + Tiptap rich text editor
- [x] Theme selector UI (radio + preview), color picker, font dropdown
- [x] Save theme config ke database
- [x] Cloudinary integration: upload, media library, lazy loading
- [ ] Logo upload per tema

### Phase 3 — Landing Page Themes ✅ SELESAI
- [x] **Academic Classic:** hero, faculty cards, timeline, news list+thumbnail, testimonial, academic calendar grid, navy/white/gold styling
- [x] **Modern Vibrant:** animated hero, bento grid, stats counter, carousel parallax, interactive cards, masonry gallery, bright/gradient styling
- [x] **Minimalist Clean:** simple hero large text, list news, minimal nav + hamburger, borderless gallery, floating label forms, monochrome styling
- [x] Theme context/provider, dynamic component rendering, CSS variables, theme switching

### Phase 4 — Dynamic Pages (Sebagian Selesai)
- [x] Home, About, news listing + detail, events, contact page
- [x] Image gallery + lightbox, photo album management, lazy loading
- [ ] Contact form + email notification (Resend/SendGrid)
- [ ] CAPTCHA untuk keamanan form
- [ ] Search functionality
- [ ] Breadcrumb navigation
- [ ] Sidebar mobile

### Phase 5 — Testing & Deployment (Belum)
- [ ] Unit tests (Jest/Vitest), integration tests API
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Test theme switching di semua halaman
- [ ] Optimasi: compression gambar, WebP, code splitting, caching, Lighthouse audit
- [ ] Deploy ke Vercel + custom domain + SSL + CI/CD
- [ ] Dokumentasi: admin guide, API docs, content editing guide, troubleshooting
