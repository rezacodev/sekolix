import { db } from '@/lib/db';
import EnhancedGallery from '@/components/gallery/EnhancedGallery';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Navbar, VibrantFooter } from '@/components/themes/modern-vibrant';

export const metadata = {
  title: 'Gallery',
  description: 'Explore our photo collection',
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

export default async function ModernVibrantGalleryPage() {
  const images = await getGalleryImages();
  const themeConfig = await getThemeConfigById('modern-vibrant') || getDefaultThemeConfig('modern-vibrant');

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
      <div className="min-h-screen">
        <Navbar />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri Foto</h1>
              <p className="text-lg text-cyan-100">
                Momen berharga dan prestasi gemilang dalam satu koleksi
              </p>
            </div>
          </section>

          {/* Gallery */}
          <EnhancedGallery
            images={images}
            layout="masonry"
            columns={3}
            enableLazyLoad={true}
            showAlbumFilter={true}
            filterTheme="modern"
          />
        </main>
        
        <VibrantFooter
          schoolName="SMK Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 1, Jakarta 12345"
          phone="(021) 123-4567"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: "https://facebook.com/smkn1jakarta",
            instagram: "https://instagram.com/smkn1jakarta",
            twitter: "https://twitter.com/smkn1jakarta",
            youtube: "https://youtube.com/smkn1jakarta",
          }}
        />
      </div>
    </ThemeProvider>
  );
}
