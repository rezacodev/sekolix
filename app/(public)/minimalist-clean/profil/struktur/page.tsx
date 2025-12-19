import { Header, Footer } from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Struktur Organisasi - SMK Negeri 1 Jakarta",
  description: "Struktur organisasi dan kepemimpinan SMK Negeri 1 Jakarta",
};

export default async function StrukturPage() {
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
                <span>🏢 Profil Sekolah</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Struktur Organisasi
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Tim profesional yang mendedikasikan diri untuk pendidikan berkualitas
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-0.5 bg-gray-900"></div>
              </div>
            </div>
          </div>
        
        {/* Content */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Kepala Sekolah */}
            <div className="flex justify-center mb-12">
              <div className="w-64 bg-slate-900 text-white rounded-lg p-8 text-center shadow-lg">
                <div className="text-4xl mb-2">👔</div>
                <h3 className="text-xl font-bold mb-2">Kepala Sekolah</h3>
                <p className="text-sm mb-1">Drs. Ahmad Santoso, M.Pd</p>
                <p className="text-xs text-slate-400">Kepemimpinan visioner untuk masa depan pendidikan</p>
              </div>
            </div>

            {/* Wakil Kepala Sekolah */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">Wakil Kepala Sekolah</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Wakil Kepala Bidang Kurikulum</h3>
                  <p className="text-gray-600 font-semibold mb-2">Ibu Siti Nurhaliza, M.Pd</p>
                  <p className="text-sm text-gray-600">Mengembangkan kurikulum dan standar pembelajaran</p>
                </div>
                <div className="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">👥</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Wakil Kepala Bidang Kesiswaan</h3>
                  <p className="text-gray-600 font-semibold mb-2">Bapak Bambang Hidayat, S.Pd</p>
                  <p className="text-sm text-gray-600">Pembinaan karakter dan pengembangan siswa</p>
                </div>
                <div className="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Wakil Kepala Bidang Sarana</h3>
                  <p className="text-gray-600 font-semibold mb-2">Bapak Rudi Setiawan, S.Pd</p>
                  <p className="text-sm text-gray-600">Manajemen infrastruktur dan fasilitas sekolah</p>
                </div>
                <div className="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Wakil Kepala Bidang Hubungan Industri</h3>
                  <p className="text-gray-600 font-semibold mb-2">Ibu Eka Wijaya, M.Pd</p>
                  <p className="text-sm text-gray-600">Kerjasama dengan dunia industri dan alumni</p>
                </div>
              </div>
            </div>

            {/* Kepala Departemen */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">Kepala Departemen Program Keahlian</h2>
              <div className="space-y-6">
                {[
                  { name: "Teknik Mekatronika", head: "Drs. Sukarno", icon: "⚙️" },
                  { name: "Teknik Informasi", head: "Ibu Rina Lestari, S.Kom", icon: "💻" },
                  { name: "Teknik Elektro", head: "Bapak Mardi Suharto, S.Pd", icon: "⚡" },
                  { name: "Teknik Otomotif", head: "Bapak Agus Suryanto, S.Pd", icon: "🚗" },
                ].map((dept, idx) => (
                  <div key={idx} className="bg-slate-50 border-l-4 border-slate-900 rounded-lg p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl shrink-0">{dept.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                        <p className="text-gray-600">Kepala: {dept.head}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff dan Guru */}
            <div className="bg-white rounded-lg p-8 border-2 border-slate-900">
              <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 tracking-tight">Tim Pendidik dan Tenaga Kependidikan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-5xl font-bold text-slate-900 mb-2">135+</div>
                  <p className="text-gray-700 font-semibold">Guru Profesional</p>
                  <p className="text-sm text-gray-600 mt-2">Bersertifikat dan berpengalaman di bidangnya</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-5xl font-bold text-slate-900 mb-2">85+</div>
                  <p className="text-gray-700 font-semibold">Staf Pendukung</p>
                  <p className="text-sm text-gray-600 mt-2">Administrasi, keamanan, dan layanan umum</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-5xl font-bold text-slate-900 mb-2">3000+</div>
                  <p className="text-gray-700 font-semibold">Siswa Aktif</p>
                  <p className="text-sm text-gray-600 mt-2">Tersebar di berbagai program keahlian</p>
                </div>
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
