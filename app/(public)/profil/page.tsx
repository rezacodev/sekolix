import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicProfilPage from '../academic-classic/profil/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilPage() {
  await getActiveThemeId();

  // Only academic-classic has a main profil landing page
  // Other themes only have sub-pages accessed via [slug]
  // For consistency, we'll render academic-classic's landing page
  return <AcademicClassicProfilPage />;
}
