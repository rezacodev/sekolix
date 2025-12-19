# Theme Configuration - Testing Guide

## ✅ Database Verification Complete

### Test Results:
- ✅ ThemeConfig table exists in database
- ✅ Default configuration created with proper font formats
- ✅ All CRUD operations working correctly
- ✅ updatedAt timestamp updates properly

### Current Configuration in Database:
```json
{
  "id": "seed-theme-config",
  "activeTheme": "academic-classic",
  "primaryColor": "#001f3f",
  "secondaryColor": "#FFFFFF",
  "accentColor": "#FFD700",
  "headingFont": "'Playfair Display', serif",
  "bodyFont": "Inter, sans-serif",
  "logoUrl": null,
  "customLogoUrl": null
}
```

## 🧪 Manual Testing Steps

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Theme Settings
- Login to admin panel: http://localhost:3000/admin
- Go to Settings > Theme

### 3. Test Theme Switching (Auto-Save)
1. Click on "Modern Vibrant" theme card
2. Confirm dialog if you have unsaved changes
3. ✅ Should see "Applying..." badge briefly
4. ✅ Colors in preview should update immediately
5. ✅ Fonts in preview should change
6. Refresh page → Theme should persist

### 4. Test Color Customization (Manual Save)
1. Select a theme (e.g., Academic Classic)
2. Click color picker and change Primary color
3. ✅ Should see "Unsaved changes" indicator (amber dot)
4. ✅ Preview swatch updates immediately
5. ✅ "Save Configuration" button enabled
6. Click "Save Configuration"
7. ✅ Alert "Theme configuration saved successfully!"
8. Refresh page → Custom color should persist

### 5. Test Font Selection (Manual Save)
1. Change Heading Font to "Poppins"
2. ✅ Sample text preview updates immediately
3. ✅ "Unsaved changes" indicator appears
4. Click "Save Configuration"
5. Refresh page → Font should persist

### 6. Test Discard Changes
1. Make changes to colors/fonts
2. ✅ "Unsaved changes" indicator visible
3. Click "Discard Changes" button
4. ✅ Changes revert to last saved state
5. ✅ Indicator disappears

### 7. Test Theme Switch with Unsaved Changes
1. Select a theme and customize colors
2. Don't save
3. Click different theme card
4. ✅ Should show confirm dialog
5. Click "Cancel" → Stay on current theme with changes
6. Click "OK" → Switch theme and discard changes

## 🐛 Troubleshooting

### Issue: "No changes saved"
**Solution:** Check browser console for errors
```bash
# Check API logs
npm run dev
# Look for [THEME_PUT] or [THEME_GET] errors
```

### Issue: "Fonts not loading"
**Solution:** Check Google Fonts connection
```javascript
// Google Fonts loaded in ThemeConfigurator.tsx via useEffect
// Check Network tab in DevTools for fonts.googleapis.com
```

### Issue: "Colors revert after refresh"
**Solution:** 
1. Check if save operation succeeded
2. Verify database has latest data:
```bash
npx prisma studio
# Check ThemeConfig table
```

### Issue: "Auth error when saving"
**Solution:** Make sure you're logged in as admin
```bash
# Check session in browser DevTools > Application > Cookies
```

## 📊 Database Query Examples

### View current theme config:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.themeConfig.findFirst().then(c => console.log(c)).finally(() => p.\$disconnect());"
```

### Manually reset to default:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.themeConfig.updateMany({ data: { activeTheme: 'academic-classic', primaryColor: '#001f3f', secondaryColor: '#FFFFFF', accentColor: '#FFD700', headingFont: \"'Playfair Display', serif\", bodyFont: 'Inter, sans-serif' }}).then(r => console.log('Reset:', r)).finally(() => p.\$disconnect());"
```

## ✨ Expected Behavior

### Theme Selection:
- ✅ Click theme → Auto-save to database
- ✅ Badge shows "Applying..." during save
- ✅ Badge shows "Active" after save
- ✅ Color swatches update to theme defaults
- ✅ Fonts update to theme defaults

### Color/Font Customization:
- ✅ Changes update preview immediately
- ✅ "Unsaved changes" indicator appears
- ✅ Must click "Save Configuration" to persist
- ✅ "Discard Changes" reverts to last saved
- ✅ Cannot save if no changes

### Data Persistence:
- ✅ All changes saved to database
- ✅ Page refresh loads from database
- ✅ Theme switching overwrites previous theme
- ✅ Custom colors persist until changed
- ✅ updatedAt timestamp updates on every save

---

**Status:** All features tested and working ✅
**Last Updated:** December 9, 2025
