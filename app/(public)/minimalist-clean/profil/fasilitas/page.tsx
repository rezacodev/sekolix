import { Header, Footer } from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Fasilitas - SMK Negeri 1 Jakarta",
  description:
    "Fasilitas lengkap dan modern untuk mendukung pembelajaran berkualitas di SMK Negeri 1 Jakarta"
};

export default async function FasilitasPage() {
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

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
                <span>🏫 Profil Sekolah</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Fasilitas Pendidikan
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Infrastruktur modern untuk mendukung pembelajaran optimal
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-0.5 bg-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Fasilitas Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Lab Komputer */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4 border-slate-900">
                  <div className="bg-slate-50 p-6 h-40 flex items-center justify-center">
                    <div className="text-6xl">💻</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Laboratorium Komputer</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ 5 Lab dengan total 150+ komputer</li>
                      <li>✓ Spesifikasi terkini dan terupdate</li>
                      <li>✓ Software profesional berlisensi</li>
                      <li>✓ Jaringan fiber optic berkecepatan tinggi</li>
                    </ul>
                  </div>
                </div>

                {/* Lab Mekatronika */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4 border-slate-900">
                  <div className="bg-slate-50 p-6 h-40 flex items-center justify-center">
                    <div className="text-6xl">⚙️</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      Laboratorium Mekatronika
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ Peralatan PLC dan robotika terbaru</li>
                      <li>✓ 3 ruang praktik terpisah</li>
                      <li>✓ Simulasi industri 4.0</li>
                      <li>✓ Standar DIN dan ISO internasional</li>
                    </ul>
                  </div>
                </div>

                {/* Lab Elektro */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4 border-slate-900">
                  <div className="bg-slate-50 p-6 h-40 flex items-center justify-center">
                    <div className="text-6xl">⚡</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Laboratorium Elektro</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ 2 Lab daya dan kontrol</li>
                      <li>✓ Peralatan instalasi listrik modern</li>
                      <li>✓ Trainer panel dan switchboard</li>
                      <li>✓ Keselamatan kerja prioritas utama</li>
                    </ul>
                  </div>
                </div>

                {/* Lab Otomotif */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-t-4 border-slate-900">
                  <div className="bg-slate-50 p-6 h-40 flex items-center justify-center">
                    <div className="text-6xl">🚗</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Workshop Otomotif</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ Area praktik 2000 m²</li>
                      <li>✓ Lift dan diagnostic tools profesional</li>
                      <li>✓ Bengkel servis standar industri</li>
                      <li>✓ Training kendaraan hybrid & listrik</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Fasilitas Penunjang */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">
                  Fasilitas Penunjang
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📚</span> Perpustakaan Digital
                    </h3>
                    <p className="text-sm text-gray-600">
                      Koleksi 5000+ buku dan jurnal digital dengan akses 24/7
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🏋️</span> Aula Olahraga
                    </h3>
                    <p className="text-sm text-gray-600">
                      Fasilitas olahraga lengkap dengan basketball court dan volleyball
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎓</span> Aula Serbaguna
                    </h3>
                    <p className="text-sm text-gray-600">
                      Kapasitas 1000 orang untuk acara seminar dan konferensi
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🍽️</span> Kantin dan Kafetaria
                    </h3>
                    <p className="text-sm text-gray-600">
                      Makanan sehat dan bergizi dengan harga terjangkau
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🏥</span> Klinik Kesehatan
                    </h3>
                    <p className="text-sm text-gray-600">
                      Layanan kesehatan 24 jam dengan tenaga medis profesional
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-slate-900">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🛏️</span> Asrama Siswa
                    </h3>
                    <p className="text-sm text-gray-600">
                      Akomodasi nyaman untuk siswa dari luar kota
                    </p>
                  </div>
                </div>
              </div>

              {/* Teknologi dan Konektivitas */}
              <div className="bg-white rounded-lg p-8 border-2 border-slate-900 mb-16">
                <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">
                  Teknologi dan Konektivitas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-slate-900">✓</span> Jaringan dan Internet
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Fiber optic 1 Gbps dedicated</li>
                      <li>• WiFi 6 coverage seluruh area</li>
                      <li>• Network monitoring 24/7</li>
                      <li>• Cloud infrastructure terpercaya</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-slate-900">✓</span> Sistem Informasi
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Portal siswa dan guru terintegrasi</li>
                      <li>• E-learning platform interaktif</li>
                      <li>• CCTV monitoring di setiap area</li>
                      <li>• Sistem keamanan akses modern</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sertifikasi */}
              <div className="bg-slate-50 rounded-lg p-8 text-center border-2 border-slate-900">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Sertifikasi dan Standar</h3>
                <p className="text-gray-600 mb-6">
                  Semua fasilitas kami memenuhi standar internasional dan regulasi pemerintah
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">🏅</div>
                    <p className="text-sm font-semibold">ISO 9001:2015</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="text-sm font-semibold">Akreditasi A</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">✨</div>
                    <p className="text-sm font-semibold">SSN Terpercaya</p>
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
