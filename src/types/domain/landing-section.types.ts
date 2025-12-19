/**
 * Landing Section types
 */

export interface LandingSection {
  id: string;
  name: string;
  content: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLandingSectionInput {
  name: string;
  content: string;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface UpdateLandingSectionInput {
  name?: string;
  content?: string;
  isVisible?: boolean;
  displayOrder?: number;
}
