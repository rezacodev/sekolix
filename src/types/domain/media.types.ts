/**
 * Media types
 */

export interface Media {
  id: string;
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadResponse {
  success: boolean;
  media?: Media;
  error?: string;
}

export interface CreateMediaInput {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}
