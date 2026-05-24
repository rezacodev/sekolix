import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Re-export client-safe utilities
export {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
  getFileTypeLabel,
  getFileExtension,
  isFileTypeAllowed,
  getFileCategory,
} from "./upload-utils";

import {
  getFileExtension,
  isFileTypeAllowed,
  MAX_FILE_SIZE,
} from "./upload-utils";

// Server-only file upload functionality

// Generate unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(`.${ext}`, "");
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 50);
  
  return `${sanitizedName}_${timestamp}_${random}.${ext}`;
}

// Upload file to public directory
export async function uploadFile(
  file: File,
  folder: string = "materials"
): Promise<{ url: string; filename: string; size: number }> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Validate file type
    if (!isFileTypeAllowed(file.name)) {
      throw new Error("File type not allowed");
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Return public URL
    const url = `/uploads/${folder}/${uniqueFilename}`;

    return {
      url,
      filename: uniqueFilename,
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
