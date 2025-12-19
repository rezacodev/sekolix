// Small helper to strip problematic source map comments from HTML content
// Prevents Next.js/Turbopack "Invalid source map" console errors when rendering
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  // Remove inline sourceMappingURL comments (both // and /* */ styles)
  return html.replace(/\n?\s*(\/\/|\/\*)#\s*sourceMappingURL=.*?(\*\/)?/gi, "");
}
