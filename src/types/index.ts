// Re-export all domain-specific types
export type {
  UserRole,
  AuthUser,
  AuthSession,
  AuthCredentials,
} from './domain/auth.types';

export type {
  ThemeType,
  ThemeColors,
  ThemeFonts,
  ThemeConfig,
} from './domain/theme.types';

export type {
  Faculty,
  CreateFacultyInput,
  UpdateFacultyInput,
} from './domain/faculty.types';

export type {
  Gallery,
  GalleryAlbum,
  CreateGalleryInput,
  UpdateGalleryInput,
} from './domain/gallery.types';

export type {
  Media,
  MediaUploadResponse,
  CreateMediaInput,
} from './domain/media.types';

export type {
  PageContent,
  CreatePageInput,
  UpdatePageInput,
} from './domain/page.types';

export type {
  Post,
  PostType,
  Article,
  News,
  Event,
  CreatePostInput,
  UpdatePostInput,
} from './domain/post.types';

export type {
  Applicant,
  ApplicantStatus,
  CreateApplicantInput,
  UpdateApplicantInput,
  SPMBProgram,
} from './domain/spmb.types';

export type {
  LandingSection,
  CreateLandingSectionInput,
  UpdateLandingSectionInput,
} from './domain/landing-section.types';

export type {
  BreadcrumbItem,
  NavItem,
  DialogProps,
  AlertProps,
  TableColumn,
} from './domain/ui.types';
