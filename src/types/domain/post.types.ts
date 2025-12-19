/**
 * Post types (Articles, News, Events)
 */

export type PostType = 'article' | 'news' | 'event';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  type: PostType;
  publishedAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article extends Post {
  type: 'article';
  category?: string;
}

export interface News extends Post {
  type: 'news';
}

export interface Event extends Post {
  type: 'event';
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  type: PostType;
  publishedAt?: Date;
  isPublished?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image?: string;
  publishedAt?: Date;
  isPublished?: boolean;
}
