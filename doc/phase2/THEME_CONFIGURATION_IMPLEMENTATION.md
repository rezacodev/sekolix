# Theme Configuration Panel - Implementation Documentation

## Overview
Theme Configuration Panel memungkinkan administrator untuk mengelola tampilan website sekolah dengan memilih dan menyesuaikan tema, warna, dan font tanpa perlu menulis kode.

## Implementation Date
**Completed**: January 2025

## Features Implemented

### 1. Theme Selection
- **3 Pre-defined Themes**:
  - **Academic Classic**: Professional, formal, trustworthy (Navy Blue, White, Gold)
  - **Modern Vibrant**: Dynamic, energetic, youthful (Cyan, Orange, Purple)
  - **Minimalist Clean**: Simple, clean, modern-minimal (Black, White, Blue)

- **Theme Preview Cards**:
  - Visual representation of each theme
  - Color swatches showing primary, secondary, accent colors
  - Active badge indicator
  - One-click theme switching

### 2. Color Customization
- **3 Color Types**:
  - Primary Color: Main brand color
  - Secondary Color: Supporting color
  - Accent Color: Highlights and call-to-actions

- **Dual Input Method**:
  - Native HTML5 color picker for visual selection
  - Text input for hex code entry (#RRGGBB)
  - Live preview swatch
  - Hex validation on save

### 3. Typography Control
- **Font Selection**:
  - Heading Font: For titles and headings
  - Body Font: For paragraphs and content
  
- **Available Fonts** (Google Fonts):
  - Inter
  - Poppins
  - Playfair Display
  - Roboto
  - Open Sans
  - Lato
  - Montserrat
  - Merriweather
  - Raleway
  - Ubuntu

- **Live Preview**: See font changes in sample text

### 4. Theme Actions
- **Save Configuration**: Persist changes to database
- **Reset to Theme Default**: Restore original theme colors/fonts
- **Preview Changes**: (Planned) View changes before applying

## Database Schema

```prisma
model ThemeConfig {
  id              String   @id @default(cuid())
  activeTheme     String   @default("academic-classic")
  primaryColor    String   @default("#001f3f")
  secondaryColor  String   @default("#FFFFFF")
  accentColor     String   @default("#FFD700")
  headingFont     String   @default("Playfair Display")
  bodyFont        String   @default("Inter")
  logoUrl         String?
  customLogoUrl   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("landing_theme_configs")
}
```

## File Structure

```
app/admin/settings/theme/
├── page.tsx                    # Server component page wrapper
└── ThemeConfigurator.tsx       # Client component main UI

app/api/theme/
└── route.ts                    # API endpoints (GET, PUT)
```

## Component Architecture

### ThemeSettingsPage (Server Component)
**File**: `app/admin/settings/theme/page.tsx`

**Responsibilities**:
- Authentication check
- Fetch or create ThemeConfig from database
- Render breadcrumb navigation
- Pass config to ThemeConfigurator

**Key Code**:
```tsx
// Get or create theme config
let themeConfig = await db.themeConfig.findFirst();

if (!themeConfig) {
  themeConfig = await db.themeConfig.create({
    data: {
      activeTheme: "academic-classic",
      primaryColor: "#001f3f",
      secondaryColor: "#FFFFFF",
      accentColor: "#FFD700",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
    },
  });
}
```

### ThemeConfigurator (Client Component)
**File**: `app/admin/settings/theme/ThemeConfigurator.tsx`

**State Management**:
```tsx
const [config, setConfig] = useState(initialConfig);
const [isSaving, setIsSaving] = useState(false);
```

**Key Functions**:

1. **handleThemeSelect(themeId)**:
   - Finds theme by ID
   - Updates all colors and fonts to theme defaults
   - Triggers re-render with new values

2. **handleColorChange(colorType, value)**:
   - Updates specific color (primary/secondary/accent)
   - Allows custom hex values

3. **handleFontChange(fontType, value)**:
   - Updates heading or body font
   - Selected from predefined list

4. **handleReset()**:
   - Reverts to current theme's default values
   - Useful for undoing customizations

5. **handleSave()**:
   - Validates and sends PUT request to API
   - Shows loading state
   - Refreshes page on success

## API Routes

### GET /api/theme
**Purpose**: Fetch current theme configuration

**Response**:
```json
{
  "id": "cuid",
  "activeTheme": "academic-classic",
  "primaryColor": "#001f3f",
  "secondaryColor": "#FFFFFF",
  "accentColor": "#FFD700",
  "headingFont": "Playfair Display",
  "bodyFont": "Inter",
  "logoUrl": null,
  "customLogoUrl": null
}
```

### PUT /api/theme
**Purpose**: Update theme configuration

**Authentication**: Required (NextAuth session)

**Validation**:
- Hex color format: `/^#[0-9A-F]{6}$/i`
- Valid themes: academic-classic, modern-vibrant, minimalist-clean

**Request Body**:
```json
{
  "activeTheme": "modern-vibrant",
  "primaryColor": "#06b6d4",
  "secondaryColor": "#f97316",
  "accentColor": "#a855f7",
  "headingFont": "Poppins",
  "bodyFont": "Inter"
}
```

**Error Responses**:
- `401`: Unauthorized (no session)
- `400`: Invalid color format or theme
- `500`: Server error

## UI Components Used

### shadcn/ui Components:
- **Card**: Theme preview cards, color/font sections
- **Button**: Save, Reset, Preview actions
- **Label**: Form field labels
- **Input**: Color picker, hex text input
- **Select**: Font dropdown menus
- **Badge**: Active theme indicator

### Icons (lucide-react):
- **Palette**: Color/theme sections
- **Type**: Typography section
- **Save**: Save button
- **RotateCcw**: Reset button
- **Eye**: Preview button

## User Experience Flow

1. **Initial Load**:
   - Fetch current theme config
   - Display active theme with badge
   - Show current colors and fonts

2. **Theme Selection**:
   - Click theme card → Update all values instantly
   - See color swatches change
   - Font previews update

3. **Color Customization**:
   - Click color swatch → Native picker opens
   - OR type hex code directly
   - See immediate preview

4. **Font Selection**:
   - Open dropdown → See font samples
   - Select font → Preview updates

5. **Save Changes**:
   - Click "Save Configuration"
   - Button shows loading state
   - Success alert → Page refreshes
   - Changes visible across site

6. **Reset to Default**:
   - Click "Reset to Theme Default"
   - All customizations revert to theme base
   - No save required (manual save needed to persist)

## Responsive Design

- **Desktop** (md+): 3-column grid for theme cards, 3-column for colors, 2-column for fonts
- **Mobile** (< md): Single column stack for all sections
- **Color Pickers**: Fixed width swatches + flexible input fields
- **Font Preview**: Scales appropriately on small screens

## Future Enhancements (TODO)

### Phase 1 Improvements:
1. **Logo Upload**:
   - File input with image preview
   - Cloudinary integration
   - Per-theme logo support
   - Custom logo override

2. **Live Preview**:
   - Modal with iframe showing landing page
   - Real-time color/font changes
   - "Apply Changes" button

3. **Theme Export/Import**:
   - Download theme as JSON
   - Upload custom theme file
   - Share themes between instances

### Phase 2 Enhancements:
4. **Advanced Customization**:
   - Custom CSS editor
   - Additional color slots (error, warning, success)
   - Border radius control
   - Shadow intensity

5. **Theme Marketplace**:
   - Browse community themes
   - One-click theme installation
   - Rate and review themes

6. **Accessibility**:
   - Color contrast checker
   - WCAG compliance warnings
   - Dark mode support

## Testing Checklist

### Functional Tests:
- [ ] Theme selection updates all colors and fonts
- [ ] Color picker saves hex values correctly
- [ ] Font selection applies to preview text
- [ ] Reset button restores theme defaults
- [ ] Save button persists to database
- [ ] Changes survive page refresh
- [ ] Validation rejects invalid hex codes
- [ ] Auth required for PUT requests

### UI/UX Tests:
- [ ] Theme cards show active indicator
- [ ] Color swatches display correctly
- [ ] Font previews render properly
- [ ] Responsive layout works on mobile
- [ ] Loading states display during save
- [ ] Error messages show for failures
- [ ] Success feedback after save

### Integration Tests:
- [ ] API routes authenticate properly
- [ ] Database updates correctly
- [ ] Landing page reflects theme changes
- [ ] Multiple users don't conflict
- [ ] Theme applies to all pages

## Known Issues / Limitations

1. **Logo Upload**: Not yet implemented (fields exist but no UI)
2. **Preview Modal**: Planned but not implemented
3. **Color Validation**: Only checks hex format, not contrast/accessibility
4. **Font Loading**: Assumes Google Fonts available, no fallback
5. **Single Config**: Only one theme config per site (not per-user)

## Related Documentation

- [SPEC.md](../../SPEC.md) - Original theme system requirements
- [TODO.md](../../TODO.md) - Implementation tracking
- [Admin Dashboard Implementation](../phase2/ADMIN_DASHBOARD_IMPLEMENTATION.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial implementation with 3 themes, color/font customization |

## Developer Notes

### Adding New Themes:
1. Add theme object to `themes` array in ThemeConfigurator.tsx
2. Include id, name, description, colors, fonts
3. Update `validThemes` in API route validation

### Adding New Fonts:
1. Add font name to `fontOptions` array
2. Ensure font is available on Google Fonts
3. Update font loading in landing page layout

### Modifying Color Slots:
1. Add field to ThemeConfig model
2. Run Prisma migration
3. Update ThemeConfigurator UI
4. Add to API validation
5. Apply in landing page CSS

---

**Status**: ✅ Complete (Core Features)
**Next Phase**: Logo Upload + Live Preview
