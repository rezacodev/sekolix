import { Header, Footer } from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Sejarah - SMK Negeri 1 Jakarta",
  description: "Sejarah berdirinya dan perkembangan SMK Negeri 1 Jakarta sejak tahun 1985",
};

export default async function SejarahPage() {
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');

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
        <main className="min-h-screen bg-white overflow-x-hidden w-full pt-20">
          {/* Page Header - Full Width */}
          <div className="text-center bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-full text-gray-600 text-sm mb-4">
                <span>📚 Profil Sekolah</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sejarah SMK Negeri 1 Jakarta
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Perjalanan 40 tahun membangun prestasi dan karakter siswa berkualitas
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-0.5 bg-gray-900"></div>
              </div>
            </div>
          </div>
        
        {/* Content */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Timeline */}
            <div className="space-y-12">
              {/* 1985 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">1985</div>
                  <div className="w-1 h-32 bg-slate-300 mt-4"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Pendirian Sekolah</h3>
                  <p className="text-gray-700 leading-relaxed">
                    SMK Negeri 1 Jakarta didirikan dengan visi untuk menyediakan pendidikan kejuruan berkualitas tinggi yang menghasilkan lulusan siap kerja. Sekolah ini dimulai dengan beberapa program keahlian dan fasilitas yang sederhana namun berdedikasi penuh.
                  </p>
                </div>
              </div>

              {/* 1990 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">1990</div>
                  <div className="w-1 h-32 bg-slate-300 mt-4"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Ekspansi Program</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Tahun ini menandai era baru dengan penambahan program keahlian. Fasilitas pembelajaran ditingkatkan dengan peralatan modern, dan jumlah siswa meningkat pesat mencerminkan kepercayaan masyarakat terhadap kualitas pendidikan kami.
                  </p>
                </div>
              </div>

              {/* 2000 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">2000</div>
                  <div className="w-1 h-32 bg-slate-300 mt-4"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Sertifikasi Internasional</h3>
                  <p className="text-gray-700 leading-relaxed">
                    SMK Negeri 1 Jakarta berhasil meraih sertifikasi internasional. Pengakuan ini membuktikan komitmen kami terhadap standar kualitas pendidikan global dan kemampuan menghasilkan lulusan yang kompetitif di tingkat nasional dan internasional.
                  </p>
                </div>
              </div>

              {/* 2010 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">2010</div>
                  <div className="w-1 h-32 bg-slate-300 mt-4"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Transformasi Digital</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Kami memulai transformasi digital dengan mengintegrasikan teknologi terkini dalam proses pembelajaran. Investasi dalam infrastruktur teknologi mempersiapkan siswa untuk menghadapi era industri 4.0.
                  </p>
                </div>
              </div>

              {/* 2025 */}
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">2025</div>
                </div>
                <div className="pb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Era Inovasi Berkelanjutan</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Hari ini, SMK Negeri 1 Jakarta terus berinovasi dengan tetap mempertahankan nilai-nilai inti kami. Kami berkomitmen untuk mencetak generasi muda yang tidak hanya terampil secara teknis tetapi juga memiliki karakter kuat dan kesadaran sosial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 tracking-tight">Pencapaian Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border-l-4 border-slate-900 rounded-lg bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-2">40+ Tahun Pengalaman</h3>
                <p className="text-gray-600">Mendidik generasi demi generasi dengan dedikasi penuh terhadap keunggulan pendidikan kejuruan.</p>
              </div>
              <div className="p-6 border-l-4 border-slate-900 rounded-lg bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ribuan Lulusan Sukses</h3>
                <p className="text-gray-600">Menghasilkan profesional terampil yang tersebar di industri lokal maupun internasional.</p>
              </div>
              <div className="p-6 border-l-4 border-slate-900 rounded-lg bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Akreditasi A</h3>
                <p className="text-gray-600">Mempertahankan status akreditasi tertinggi sebagai bukti komitmen pada kualitas.</p>
              </div>
              <div className="p-6 border-l-4 border-slate-900 rounded-lg bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Penghargaan Nasional</h3>
                <p className="text-gray-600">Meraih berbagai penghargaan dari institusi pendidikan dan industri terkemuka.</p>
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
