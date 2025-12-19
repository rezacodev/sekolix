/**
 * Page types
 */

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  publishedAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  publishedAt?: Date;
  isPublished?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image?: string;
  publishedAt?: Date;
  isPublished?: boolean;
}
