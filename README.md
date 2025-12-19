# CMS Website Sekolah

Sistem Content Management System (CMS) untuk website sekolah menggunakan Next.js 14+, PostgreSQL, dan Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd sekolix

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan database credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed initial data (optional)
npm run seed

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat website.  
Akses admin panel di [http://localhost:3000/admin](http://localhost:3000/admin)

## 📚 Dokumentasi

**Dokumentasi lengkap tersedia di folder [`doc/`](doc/):**

- **[`doc/README.md`](doc/README.md)** - Overview dokumentasi
- **[`doc/INDEX.md`](doc/INDEX.md)** - Daftar lengkap semua dokumentasi
- **[`SPEC.md`](SPEC.md)** - Spesifikasi lengkap sistem
- **[`TODO.md`](TODO.md)** - Task list dan progress

### Dokumentasi per Fase

- **Phase 1** (✅ Complete): [`doc/phase1/`](doc/phase1/) - Setup & Infrastructure
- **Phase 2** (🚧 In Progress): [`doc/phase2/`](doc/phase2/) - Admin Panel & Database
- **Guides**: [`doc/guides/`](doc/guides/) - Quick reference & tutorials

## 🎯 Features

### ✅ Implemented
- **Authentication**: NextAuth.js dengan role-based access
- **Admin Dashboard**: Statistics dan overview
- **User Management**: CRUD users dengan roles (Admin, Editor, User)
- **Content Management**:
  - Articles (blog posts)
  - News (school news)
  - Events (with dates & locations)
  - Pages (static pages: About, Contact, etc.)
  - Gallery (photo albums)
- **Rich Text Editor**: Tiptap WYSIWYG editor
- **Navigation**: Categorized menu dengan accordion
- **Breadcrumbs**: Navigation di semua halaman admin
- **DataTable**: Search, filter, sort untuk semua content

### 🚧 In Progress
- Theme configuration panel
- Media management (Cloudinary integration)
- Email notifications

### 📅 Planned
- Landing page themes (3 variants)
- SEO optimization
- Multi-language support

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod
- **Rich Text**: Tiptap
- **Tables**: TanStack Table

## 📁 Project Structure

```
sekolix/
├── app/                    # Next.js app directory
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin panel pages
│   └── api/               # API routes
├── src/
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities & configurations
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── doc/                  # 📚 Documentation
│   ├── phase1/          # Phase 1 docs
│   ├── phase2/          # Phase 2 docs
│   ├── guides/          # Tutorials
│   └── checklists/      # Scripts & checklists
├── public/              # Static files
├── SPEC.md             # System specification
└── TODO.md             # Task tracking
```

## 🔧 Development

### Running Tests
```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
```

### Database Commands
```bash
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev  # Create migration
npx prisma db push    # Push schema changes
npx prisma generate   # Generate client
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run format        # Format with Prettier
```

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Project Documentation
- **Quick Reference**: [`doc/guides/QUICK_REFERENCE.md`](doc/guides/QUICK_REFERENCE.md)
- **Implementation Guides**: [`doc/phase2/`](doc/phase2/)
- **Full Documentation**: [`doc/INDEX.md`](doc/INDEX.md)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Pastikan set di production:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CLOUDINARY_*` (jika menggunakan Cloudinary)

Lihat deployment guide lengkap di [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)

## 📊 Progress

- **Phase 1**: ✅ Complete (Setup & Infrastructure)
- **Phase 2**: 🚧 In Progress (Admin Panel - 20/XX tasks)
- **Phase 3**: 📅 Planned (Landing Page Themes)
- **Phase 4**: 📅 Planned (Feature Development)
- **Phase 5**: 📅 Planned (Testing & Deployment)

Lihat detail di [`TODO.md`](TODO.md)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: [Your Name]
- **Designer**: [Designer Name]

---

**Last Updated**: December 9, 2025  
**Version**: 1.3.0 (Phase 2 - Admin Panel)

