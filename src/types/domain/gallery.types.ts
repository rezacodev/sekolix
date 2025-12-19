/**
 * Gallery and media types
 */

export interface Gallery {
  id: string;
  title: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryAlbum {
  id: string;
  galleryId: string;
  title: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGalleryInput {
  title: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface UpdateGalleryInput {
  title?: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isVisible?: boolean;
}
