import { db } from '@/lib/db';
import EnhancedGallery from '@/components/gallery/EnhancedGallery';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Header, Footer } from '@/components/themes/academic-classic';

export const metadata = {
  title: 'Gallery',
  description: 'Photo Gallery',
};

async function getGalleryImages() {
  try {
    const images = await db.gallery.findMany({
      include: {
        album: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return images.map((img) => ({
      id: img.id,
      url: img.image,
      title: img.title,
      album: img.album?.name || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch gallery:', error);
    return [];
  }
}

export default async function AcademicClassicGalleryPage() {
  const images = await getGalleryImages();
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');

  if (!images || images.length === 0) {
    notFound();
  }

  return (
    <ThemeProvider
      primaryColor={themeConfig.primaryColor}
      secondaryColor={themeConfig.secondaryColor}
      accentColor={themeConfig.accentColor}
      textColor={themeConfig.textColor}
      borderColor={themeConfig.borderColor}
      grayColor={themeConfig.grayColor}
      headingFont={themeConfig.headingFont}
      bodyFont={themeConfig.bodyFont}
    >
      <div className="w-full">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                Galeri Foto
              </h1>
              <p className="text-lg text-blue-100">
                Dokumentasi perjalanan dan pencapaian institusi
              </p>
            </div>
          </section>

          {/* Gallery */}
          <div className="bg-gray-50">
            <EnhancedGallery
              images={images}
              layout="grid"
              columns={3}
              enableLazyLoad={true}
              showAlbumFilter={true}
              filterTheme="academic"
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}
