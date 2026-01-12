import { db } from "@/lib/db";
import EnhancedGallery from "@/components/gallery/EnhancedGallery";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { MinimalNavbar, MinimalFooter } from "@/components/themes/minimalist-clean";

export const metadata = {
  title: "Gallery",
  description: "Photo Collection"
};

async function getGalleryImages() {
  try {
    const images = await db.gallery.findMany({
      include: {
        album: {
          select: {
            name: true
          }
        }
      },
      orderBy: { order: "asc" }
    });

    return images.map(img => ({
      id: img.id,
      url: img.image,
      title: img.title,
      album: img.album?.name || undefined
    }));
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return [];
  }
}

export default async function MinimalistCleanGalleryPage() {
  const images = await getGalleryImages();
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

  if (!images || images.length === 0) {
    notFound();
  }

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />

        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-slate-900 text-white py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Galeri</h1>
              <p className="text-lg text-slate-300">Koleksi visual momen berharga</p>
            </div>
          </section>

          {/* Gallery */}
          <EnhancedGallery
            images={images}
            layout="grid"
            columns={4}
            enableLazyLoad={true}
            showAlbumFilter={true}
            filterTheme="minimal"
          />
        </main>

        <MinimalFooter
          schoolName="SMK Negeri 1 Jakarta"
          description="Sekolah Menengah Kejuruan Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 1, Jakarta 12345"
          phone="(021) 123-4567"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: "https://facebook.com/smkn1jakarta",
            instagram: "https://instagram.com/smkn1jakarta",
            twitter: "https://twitter.com/smkn1jakarta",
            youtube: "https://youtube.com/smkn1jakarta"
          }}
        />
      </div>
    </ThemeProvider>
  );
}
