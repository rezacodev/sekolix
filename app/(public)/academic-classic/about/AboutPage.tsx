import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { Header, Footer, FacultyCards } from "@/components/themes/academic-classic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AcademicClassicAbout() {
  const themeConfig =
    (await getThemeConfigById("academic-classic")) || getDefaultThemeConfig("academic-classic");

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
        <div className="min-h-screen bg-gray-50 pt-20">
          <section className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Profil Sekolah</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-3">Tentang SMK Negeri 1 Jakarta</h1>
              <p className="mt-4 text-blue-100 max-w-3xl">
                Sekolah kejuruan unggulan dengan fokus pada karakter, keilmuan, dan kesiapan karier.
                Terakreditasi A dan bermitra dengan puluhan industri strategis.
              </p>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-3">Visi</h2>
                <p className="text-gray-700 leading-relaxed">
                  Menjadi lembaga pendidikan kejuruan terdepan yang menghasilkan lulusan
                  berkarakter, berdaya saing global, dan siap berkontribusi pada industri masa
                  depan.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-3">Misi</h2>
                <ul className="text-gray-700 space-y-2">
                  <li>• Menyelenggarakan pembelajaran berbasis industri</li>
                  <li>• Mengembangkan karakter, etika, dan kepemimpinan</li>
                  <li>• Memperkuat kemitraan dengan dunia usaha dan dunia industri</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Keunggulan Kami</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="font-semibold text-blue-900">Akreditasi A</p>
                  <p className="text-sm">Standar mutu pendidikan terverifikasi nasional.</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="font-semibold text-blue-900">50+ Mitra Industri</p>
                  <p className="text-sm">Link & match dengan kebutuhan pasar kerja.</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="font-semibold text-blue-900">Instruktur Berpengalaman</p>
                  <p className="text-sm">Praktisi industri yang bersertifikat.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <FacultyCards faculty={[]} />
          </section>

          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
