// Re-export all domain types
export type { UserRole, AuthUser, AuthSession, AuthCredentials } from "./auth.types";
export type { ThemeType, ThemeColors, ThemeFonts, ThemeConfig } from "./theme.types";
export type { Faculty, CreateFacultyInput, UpdateFacultyInput } from "./faculty.types";
export type {
  Gallery,
  GalleryAlbum,
  CreateGalleryInput,
  UpdateGalleryInput
} from "./gallery.types";
export type { Media, MediaUploadResponse, CreateMediaInput } from "./media.types";
export type { PageContent, CreatePageInput, UpdatePageInput } from "./page.types";
export type {
  Post,
  PostType,
  Article,
  News,
  Event,
  CreatePostInput,
  UpdatePostInput
} from "./post.types";
export type {
  Applicant,
  ApplicantStatus,
  CreateApplicantInput,
  UpdateApplicantInput,
  SPMBProgram
} from "./spmb.types";
export type {
  LandingSection,
  CreateLandingSectionInput,
  UpdateLandingSectionInput
} from "./landing-section.types";
export type { BreadcrumbItem, NavItem, DialogProps, AlertProps, TableColumn } from "./ui.types";
