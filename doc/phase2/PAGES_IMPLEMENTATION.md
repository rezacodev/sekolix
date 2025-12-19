# Pages Management - Implementation Guide

## Overview
Static Pages management system untuk mengelola halaman-halaman statis seperti About Us, Contact, Privacy Policy, Terms of Service, dll.

## Features Implemented

### 1. **Database Model**
- Model: `Page` (mapped to `landing_pages` table)
- Fields:
  - `id` (CUID)
  - `title` (String)
  - `slug` (String, unique)
  - `content` (Text)
  - `description` (String, nullable) - untuk SEO
  - `isPublished` (Boolean)
  - `createdAt`, `updatedAt` (DateTime)

### 2. **Admin Navigation**
- Added "Pages" menu item under "Website Sekolah" category
- Location: `/admin/pages`
- Icon position: After Events, before Gallery

### 3. **CRUD Operations**

#### List Page (`/admin/pages`)
- DataTable with columns:
  - Title (sortable)
  - Slug
  - Description
  - Status (Published/Draft badge)
  - Last Updated (sortable)
  - Actions (Edit/Delete dropdown)
- Features:
  - Search by title
  - Filter by status (Published/Draft)
  - Breadcrumb navigation

#### Create Page (`/admin/pages/new`)
- Form fields:
  - **Title**: Required, auto-generates slug
  - **Slug**: Auto-generated from title, editable, URL-friendly
  - **Description**: Optional, for SEO meta description
  - **Content**: Rich text editor (Tiptap) with formatting toolbar
  - **Published**: Checkbox to publish/unpublish
- Features:
  - Auto-slug generation (lowercase, hyphens, no special chars)
  - Real-time validation with Zod
  - WYSIWYG editor for content
  - Breadcrumb: Home > Pages > Create New

#### Edit Page (`/admin/pages/[id]/edit`)
- Same form as create
- Pre-populated with existing data
- Slug can be edited (with duplicate check)
- Breadcrumb: Home > Pages > Edit

### 4. **API Routes**

#### GET `/api/pages`
- Fetch all pages
- Ordered by created date (desc)
- No authentication required (public)

#### POST `/api/pages`
- Create new page
- Requires authentication
- Validates slug uniqueness
- Returns created page

#### GET `/api/pages/[id]`
- Fetch single page by ID
- No authentication required

#### PUT `/api/pages/[id]`
- Update existing page
- Requires authentication
- Validates slug uniqueness (excluding current page)
- Returns updated page

#### DELETE `/api/pages/[id]`
- Delete page
- Requires authentication
- Returns success message

### 5. **Components Created**

```
app/admin/pages/
├── page.tsx                    # List page wrapper
├── PageActions.tsx             # DataTable and actions
├── columns.tsx                 # Table column definitions
├── new/
│   ├── page.tsx               # Create page wrapper
│   └── PageForm.tsx           # Reusable form component
└── [id]/
    └── edit/
        └── page.tsx           # Edit page wrapper (reuses PageForm)

app/api/pages/
├── route.ts                    # GET all, POST create
└── [id]/
    └── route.ts               # GET, PUT, DELETE by ID

src/components/ui/
└── checkbox.tsx               # New Radix UI checkbox component
```

### 6. **Validation Schema**

```typescript
const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isPublished: z.boolean(),
});
```

### 7. **Consistent Layout**

All pages follow the established pattern:
- Container: `p-6 max-w-7xl mx-auto`
- Breadcrumb navigation at top
- Page header with title and description
- Content area with proper spacing

## Usage Examples

### Creating Common Pages

**About Us Page:**
- Title: "About Us"
- Slug: "about-us" (auto-generated)
- Content: School history, mission, vision, values
- Published: ✓

**Contact Page:**
- Title: "Contact Us"
- Slug: "contact-us"
- Content: Contact form, address, map, phone numbers
- Published: ✓

**Privacy Policy:**
- Title: "Privacy Policy"
- Slug: "privacy-policy"
- Content: Privacy policy details
- Published: ✓

**Terms of Service:**
- Title: "Terms of Service"
- Slug: "terms-of-service"
- Content: Terms and conditions
- Published: ✓

## Access Control

- **List**: No authentication required (for future public API)
- **Create/Edit/Delete**: Requires admin authentication via NextAuth

## SEO Optimization

- **Description field**: Used as meta description
- **Slug**: Clean, URL-friendly URLs
- **Content**: Rich text with proper HTML structure

## Future Enhancements

1. **Page Templates**: Pre-built templates for common pages
2. **SEO Fields**: Add meta keywords, Open Graph tags
3. **Page Ordering**: Manual sorting for footer links
4. **Parent/Child Pages**: Nested page structure
5. **Revisions**: Version history and rollback
6. **Preview**: Preview page before publishing
7. **Scheduled Publishing**: Set publish date/time

## Dependencies Added

- `@radix-ui/react-checkbox`: For checkbox component

## Testing Checklist

- [x] Create new page
- [x] Auto-slug generation works
- [x] Edit existing page
- [x] Delete page with confirmation
- [x] Slug uniqueness validation
- [x] Rich text editor works
- [x] Published/Draft toggle works
- [x] Search and filter work
- [x] Breadcrumb navigation correct
- [x] Responsive layout
- [x] Form validation displays errors
- [x] API authentication works

## Notes

- Slug must be unique across all pages
- Content is stored as HTML from rich text editor
- Unpublished pages won't be visible on public site (future implementation)
- Description is optional but recommended for SEO
