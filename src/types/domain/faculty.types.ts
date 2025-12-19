/**
 * Faculty types
 */

export interface Faculty {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFacultyInput {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateFacultyInput {
  name?: string;
  description?: string;
  image?: string;
}
