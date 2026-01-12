import { Header, Footer } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Sejarah - SMK Negeri 1 Jakarta",
  description: "Sejarah berdirinya dan perkembangan SMK Negeri 1 Jakarta sejak tahun 1985"
};

export default async function SejarahPage() {
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
        <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full pt-20">
          {/* Page Header - Full Width */}
          <div className="text-center bg-blue-50 pt-24 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-block mb-4">
                <div
                  className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border"
                  style={{ borderWidth: "1px" }}
                >
                  <div className="w-2 h-2 academic-accent-bg rounded-full" />
                  <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                    Profil Sekolah
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-4">
                Sejarah SMK Negeri 1 Jakarta
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Perjalanan 40 tahun membangun prestasi dan karakter siswa berkualitas
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>

          {/* Content */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Timeline */}
              <div className="space-y-12">
                {/* 1985 */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                      1985
                    </div>
                    <div className="w-1 h-32 bg-blue-200 mt-4"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Pendirian Sekolah</h3>
                    <p className="text-gray-700 leading-relaxed">
                      SMK Negeri 1 Jakarta didirikan dengan visi untuk menyediakan pendidikan
                      kejuruan berkualitas tinggi yang menghasilkan lulusan siap kerja. Sekolah ini
                      dimulai dengan beberapa program keahlian dan fasilitas yang sederhana namun
                      berdedikasi penuh.
                    </p>
                  </div>
                </div>

                {/* 1990s */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                      1990
                    </div>
                    <div className="w-1 h-32 bg-blue-200 mt-4"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Ekspansi Program</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pada dekade 1990-an, sekolah terus berkembang dengan penambahan program
                      keahlian baru. Kurikulum disesuaikan mengikuti perkembangan industri dan
                      kebutuhan pasar kerja. Prestasi akademik dan non-akademik mulai dirayakan
                      dalam berbagai kompetisi nasional.
                    </p>
                  </div>
                </div>

                {/* 2000s */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                      2000
                    </div>
                    <div className="w-1 h-32 bg-blue-200 mt-4"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Modernisasi Fasilitas</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Era 2000-an membawa transformasi signifikan. Fasilitas sekolah dimodernisasi
                      dengan laboratorium komputer, studio desain, dan workshop industri. Kerjasama
                      dengan industri leader memperkuat komitmen terhadap relevansi kurikulum dan
                      pembelajaran praktis.
                    </p>
                  </div>
                </div>

                {/* 2010s */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                      2010
                    </div>
                    <div className="w-1 h-32 bg-blue-200 mt-4"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Standar Internasional</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Sejak 2010, SMK Negeri 1 Jakarta berusaha mencapai standar internasional.
                      Sertifikasi dan akreditasi diperkuat. Program pertukaran siswa dengan sekolah
                      mitra internasional dimulai. Kurikulum disinkronisasi dengan standar global
                      sambil tetap mempertahankan nilai-nilai lokal.
                    </p>
                  </div>
                </div>

                {/* 2020s */}
                <div className="flex gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                      2020
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Era Digital & Inovasi</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Memasuki dekade 2020, sekolah mengadopsi teknologi digital secara massif.
                      Pembelajaran hybrid, kelas virtual, dan platform e-learning menjadi standar.
                      Program inovasi dan entrepreneurship dikembangkan untuk mempersiapkan siswa
                      menghadapi masa depan yang dinamis dan penuh peluang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Achievements */}
              <div className="mt-16 pt-16 border-t-2 border-gray-200">
                <h2 className="text-3xl font-bold text-blue-900 mb-8">Pencapaian Utama</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-900">
                    <h3 className="font-bold text-blue-900 mb-2">Akreditasi A</h3>
                    <p className="text-gray-700">
                      Akreditasi A dari BAN-S/M menunjukkan standar kualitas pendidikan yang tinggi
                      dan konsisten.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-900">
                    <h3 className="font-bold text-blue-900 mb-2">50+ Kerjasama Industri</h3>
                    <p className="text-gray-700">
                      Kemitraan dengan perusahaan terkemuka memastikan relevansi kurikulum dengan
                      kebutuhan dunia kerja.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-900">
                    <h3 className="font-bold text-blue-900 mb-2">96% Tingkat Kelulusan</h3>
                    <p className="text-gray-700">
                      Mayoritas lulusan terserap di dunia kerja dalam waktu kurang dari 6 bulan
                      setelah lulus.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-900">
                    <h3 className="font-bold text-blue-900 mb-2">Kompetisi Tingkat Nasional</h3>
                    <p className="text-gray-700">
                      Siswa dan guru secara konsisten meraih penghargaan dalam berbagai kompetisi
                      akademik dan olahraga nasional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </ThemeProvider>
  );
}
