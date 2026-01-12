import { Header, Footer } from "@/components/themes/modern-vibrant";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Visi & Misi - SMK Negeri 1 Jakarta",
  description:
    "Visi, Misi, dan Tujuan SMK Negeri 1 Jakarta dalam membentuk sumber daya manusia berkualitas"
};

export default async function VisiMisiPage() {
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

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
        <main className="min-h-screen bg-linear-to-b from-slate-50 to-white overflow-x-hidden w-full pt-20">
          {/* Page Header - Full Width */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-medium mb-4">
                <span>🎯 Profil Sekolah</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Visi & Misi
              </h1>
              <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-8">
                Arah dan tujuan kami dalam memberikan pendidikan kejuruan terbaik
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Vision Section */}
              <div className="mb-16">
                <div className="flex items-start gap-6 mb-8">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-linear-to-r from-cyan-500 to-purple-500 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      Visi
                    </h2>
                    <div className="bg-linear-to-r from-cyan-50 to-purple-50 p-8 rounded-lg border border-cyan-200">
                      <p className="text-lg text-gray-800 leading-relaxed font-semibold">
                        Menjadi SMK unggul yang menghasilkan sumber daya manusia profesional,
                        inovatif, dan berkarakter mulia, mampu bersaing di tingkat nasional dan
                        internasional dalam menghadapi perkembangan industri dan teknologi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mission Section */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-linear-to-r from-cyan-500 to-purple-500 text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                      Misi
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-linear-to-r from-cyan-50 to-purple-50 p-6 rounded-lg border border-cyan-200">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <span className="shrink-0 w-6 h-6 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                            1
                          </span>
                          Menyelenggarakan Pendidikan Berkualitas
                        </h3>
                        <p className="text-gray-700">
                          Menyelenggarakan pendidikan dan pelatihan kejuruan yang inovatif, relevan
                          dengan kebutuhan industri, dan sesuai dengan standar internasional.
                        </p>
                      </div>
                      <div className="bg-linear-to-r from-cyan-50 to-purple-50 p-6 rounded-lg border border-cyan-200">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <span className="shrink-0 w-6 h-6 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                            2
                          </span>
                          Mengembangkan Keterampilan Profesional
                        </h3>
                        <p className="text-gray-700">
                          Mengembangkan keterampilan, pengetahuan, dan sikap profesional siswa agar
                          mampu beradaptasi dengan perubahan teknologi dan kebutuhan pasar kerja.
                        </p>
                      </div>
                      <div className="bg-linear-to-r from-cyan-50 to-purple-50 p-6 rounded-lg border border-cyan-200">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <span className="shrink-0 w-6 h-6 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                            3
                          </span>
                          Pembinaan Karakter
                        </h3>
                        <p className="text-gray-700">
                          Membina siswa menjadi individu berkarakter mulia dengan integritas,
                          tanggung jawab, dan dedikasi tinggi dalam setiap aspek kehidupan.
                        </p>
                      </div>
                      <div className="bg-linear-to-r from-cyan-50 to-purple-50 p-6 rounded-lg border border-cyan-200">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <span className="shrink-0 w-6 h-6 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                            4
                          </span>
                          Kemitraan Strategis
                        </h3>
                        <p className="text-gray-700">
                          Membangun kemitraan strategis dengan industri, institusi pendidikan, dan
                          stakeholder lain untuk meningkatkan relevansi dan kualitas pendidikan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Values Section */}
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-center mb-12 bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Nilai-Nilai Inti
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white border-2 border-cyan-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Profesionalisme</h3>
                    <p className="text-gray-600">
                      Komitmen terhadap keunggulan dalam setiap aspek pekerjaan dan pembelajaran
                      dengan standar tertinggi.
                    </p>
                  </div>
                  <div className="p-6 bg-white border-2 border-purple-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Integritas</h3>
                    <p className="text-gray-600">
                      Kejujuran dan konsistensi dalam menerapkan nilai-nilai moral dalam setiap
                      tindakan dan keputusan.
                    </p>
                  </div>
                  <div className="p-6 bg-white border-2 border-cyan-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Inovasi</h3>
                    <p className="text-gray-600">
                      Semangat untuk terus berinovasi dan beradaptasi dengan perubahan zaman untuk
                      memberikan solusi terbaik.
                    </p>
                  </div>
                  <div className="p-6 bg-white border-2 border-purple-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Kolaborasi</h3>
                    <p className="text-gray-600">
                      Kerjasama tim yang harmonis untuk mencapai tujuan bersama dengan saling
                      menghormati dan mendukung.
                    </p>
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
