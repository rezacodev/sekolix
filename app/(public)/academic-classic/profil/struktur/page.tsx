import { Header, Footer } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Struktur Organisasi - SMK Negeri 1 Jakarta",
  description: "Struktur organisasi dan kepemimpinan SMK Negeri 1 Jakarta",
};

export default async function StrukturPage() {
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');

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
                <div className="flex items-center gap-2 px-4 py-1 academic-accent-bg-light rounded-full academic-accent-border" style={{borderWidth: '1px'}}>
                  <div className="w-2 h-2 academic-accent-bg rounded-full" />
                  <span className="text-[#001f3f] font-serif text-sm uppercase tracking-wider">
                    Profil Sekolah
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#001f3f] mb-4">
                Struktur Organisasi
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Susunan manajemen dan kepemimpinan institusi pendidikan
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>
        
        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Organizational Chart */}
            <div className="mb-16 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-8">Bagan Struktur Organisasi</h2>
              
              {/* Level 1: Kepala Sekolah */}
              <div className="flex justify-center mb-8">
                <div className="bg-linear-to-r from-blue-900 to-blue-800 text-white px-6 py-4 rounded-lg shadow-lg">
                  <div className="font-bold text-center">Kepala Sekolah</div>
                  <div className="text-sm text-blue-100 text-center">Drs. Ahmad Prasetyo, M.Pd</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center mb-8">
                <div className="h-8 border-l-2 border-blue-900"></div>
              </div>

              {/* Level 2: Vice Principals */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex justify-center">
                  <div className="bg-blue-100 border-2 border-blue-900 px-4 py-3 rounded text-center">
                    <div className="font-bold text-blue-900">Wakil Kepala Sekolah</div>
                    <div className="text-sm text-gray-700">Bidang Kurikulum</div>
                    <div className="text-xs text-gray-600 mt-1">Siti Nurhaliza, M.Pd</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-blue-100 border-2 border-blue-900 px-4 py-3 rounded text-center">
                    <div className="font-bold text-blue-900">Wakil Kepala Sekolah</div>
                    <div className="text-sm text-gray-700">Bidang Kesiswaan</div>
                    <div className="text-xs text-gray-600 mt-1">Budi Santoso, S.Pd</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-blue-100 border-2 border-blue-900 px-4 py-3 rounded text-center">
                    <div className="font-bold text-blue-900">Wakil Kepala Sekolah</div>
                    <div className="text-sm text-gray-700">Bidang Humas & Sarana</div>
                    <div className="text-xs text-gray-600 mt-1">Deni Kuswoyo, S.Pd</div>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="my-8 border-t-2 border-gray-300"></div>

              {/* Level 3: Main Departments */}
              <h3 className="font-bold text-blue-900 mb-4">Unit-Unit Utama</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h4 className="font-bold text-blue-900 mb-2">Program Keahlian</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Teknik Otomotif</li>
                    <li>• Teknik Listrik</li>
                    <li>• Teknik Permesinan</li>
                    <li>• Teknik Elektronika</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h4 className="font-bold text-blue-900 mb-2">Layanan Pendukung</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Perpustakaan & Literasi</li>
                    <li>• BK & Konseling</li>
                    <li>• Unit Kesehatan</li>
                    <li>• Tata Usaha</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Positions */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-blue-900 mb-8">Kepemimpinan Inti</h2>
              <div className="space-y-6">
                <div className="flex gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      AS
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg">Drs. Ahmad Prasetyo, M.Pd</h3>
                    <p className="text-orange-600 font-semibold">Kepala Sekolah</p>
                    <p className="text-gray-700 mt-2 text-sm">
                      Kepala Sekolah dengan pengalaman lebih dari 20 tahun di bidang pendidikan kejuruan. Berdedikasi untuk meningkatkan standar pendidikan dan memperkuat hubungan dengan industri.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      SN
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg">Siti Nurhaliza, M.Pd</h3>
                    <p className="text-orange-600 font-semibold">Wakil Kepala Sekolah Bidang Kurikulum</p>
                    <p className="text-gray-700 mt-2 text-sm">
                      Bertanggung jawab atas pengembangan kurikulum yang relevan dengan kebutuhan industri, peningkatan metode pembelajaran, dan sertifikasi kompetensi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      BS
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg">Budi Santoso, S.Pd</h3>
                    <p className="text-orange-600 font-semibold">Wakil Kepala Sekolah Bidang Kesiswaan</p>
                    <p className="text-gray-700 mt-2 text-sm">
                      Mengelola pengembangan kesiswaan, disiplin, bimbingan konseling, ekstrakurikuler, dan pembinaan karakter siswa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      DK
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg">Deni Kuswoyo, S.Pd</h3>
                    <p className="text-orange-600 font-semibold">Wakil Kepala Sekolah Bidang Humas & Sarana</p>
                    <p className="text-gray-700 mt-2 text-sm">
                      Menjalin hubungan dengan masyarakat, industri, dan stakeholder. Mengelola sarana prasarana serta fasilitas pendukung pembelajaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Komite Sekolah */}
            <div className="bg-linear-to-r from-blue-50 to-orange-50 p-8 rounded-lg border-l-4 border-blue-900">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Komite Sekolah</h2>
              <p className="text-gray-700 mb-4">
                Komite Sekolah adalah lembaga independen yang berperan dalam pengambilan keputusan strategis, pengawasan, dan evaluasi kinerja sekolah.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-bold text-blue-900">Ketua Komite Sekolah:</p>
                  <p className="text-gray-700">Ir. Sukarno, M.Eng (Perwakilan Industri)</p>
                </div>
                <div>
                  <p className="font-bold text-blue-900">Sekretaris:</p>
                  <p className="text-gray-700">Ibu Ratna Dewi, S.H (Perwakilan Orang Tua)</p>
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
