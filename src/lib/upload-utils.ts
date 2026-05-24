// Client-safe upload utilities

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  document: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"],
  video: ["mp4", "avi", "mkv", "mov", "wmv"],
  audio: ["mp3", "wav", "ogg", "m4a"],
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  archive: ["zip", "rar"],
};

// Max file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Get file type label
export function getFileTypeLabel(fileType: string): string {
  const labels: Record<string, string> = {
    pdf: "PDF Document",
    doc: "Word Document",
    docx: "Word Document",
    ppt: "PowerPoint",
    pptx: "PowerPoint",
    xls: "Excel",
    xlsx: "Excel",
    mp4: "Video",
    avi: "Video",
    mkv: "Video",
    mov: "Video",
    wmv: "Video",
    mp3: "Audio",
    wav: "Audio",
    ogg: "Audio",
    m4a: "Audio",
    jpg: "Image",
    jpeg: "Image",
    png: "Image",
    gif: "Image",
    webp: "Image",
    zip: "Archive",
    rar: "Archive",
    link: "External Link",
  };

  return labels[fileType.toLowerCase()] || "File";
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// Check if file type is allowed
export function isFileTypeAllowed(filename: string): boolean {
  const ext = getFileExtension(filename);
  return Object.values(ALLOWED_FILE_TYPES).flat().includes(ext);
}

// Get file category from extension
export function getFileCategory(
  filename: string
): keyof typeof ALLOWED_FILE_TYPES | null {
  const ext = getFileExtension(filename);

  for (const [category, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return category as keyof typeof ALLOWED_FILE_TYPES;
    }
  }

  return null;
}
