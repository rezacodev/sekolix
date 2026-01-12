import { Header, Footer } from "@/components/themes/minimalist-clean";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Program Keahlian - SMK Negeri 1 Jakarta",
  description:
    "Program keahlian unggulan yang ditawarkan SMK Negeri 1 Jakarta dengan kurikulum relevan industri"
};

export default async function ProgramKeahlianPage() {
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
                <span>🎓 Profil Sekolah</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Program Keahlian
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Pilihan karir profesional yang relevan dengan kebutuhan industri
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-16 h-0.5 bg-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-600 mb-16 text-lg">
                SMK Negeri 1 Jakarta menawarkan 4 program keahlian dengan kurikulum modern yang
                dirancang bekerja sama dengan industri terkemuka
              </p>

              {/* Program Mekatronika */}
              <div className="mb-12 bg-white rounded-lg shadow-lg border-l-4 border-slate-900 overflow-hidden">
                <div className="bg-slate-50 p-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">⚙️ Teknik Mekatronika</h2>
                  <p className="text-gray-600">
                    Perpaduan sempurna mekanik, elektronik, dan pemrograman untuk era industri
                    modern
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Kompetensi Utama
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Programmable Logic Controller (PLC)</li>
                        <li>✓ Robotika Industrial</li>
                        <li>✓ Otomasi Sistem</li>
                        <li>✓ Maintenance Prediktif</li>
                        <li>✓ Sistem Pneumatik & Hidrolik</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Prospek Karir
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Technician di Pabrik Manufaktur</li>
                        <li>✓ Operator Robot Industrial</li>
                        <li>✓ Teknisi Automasi</li>
                        <li>✓ Quality Control Engineer</li>
                        <li>✓ Entrepreneur di Bidang Maintenance</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Durasi:</span> 3 Tahun |{" "}
                      <span className="font-bold">Intake:</span> 4 Rombel
                    </p>
                  </div>
                </div>
              </div>

              {/* Program Informatika */}
              <div className="mb-12 bg-white rounded-lg shadow-lg border-l-4 border-slate-900 overflow-hidden">
                <div className="bg-slate-50 p-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">💻 Teknik Informatika</h2>
                  <p className="text-gray-600">
                    Mengembangkan solusi digital dan teknologi informasi untuk transformasi bisnis
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Kompetensi Utama
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Web Development Modern</li>
                        <li>✓ Mobile App Development</li>
                        <li>✓ Database Management</li>
                        <li>✓ Network Administration</li>
                        <li>✓ Cybersecurity Basics</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Prospek Karir
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Web Developer</li>
                        <li>✓ Mobile Developer</li>
                        <li>✓ IT Support Specialist</li>
                        <li>✓ Database Administrator</li>
                        <li>✓ IT Project Manager</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Durasi:</span> 3 Tahun |{" "}
                      <span className="font-bold">Intake:</span> 4 Rombel
                    </p>
                  </div>
                </div>
              </div>

              {/* Program Teknik Elektro */}
              <div className="mb-12 bg-white rounded-lg shadow-lg border-l-4 border-slate-900 overflow-hidden">
                <div className="bg-slate-50 p-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">⚡ Teknik Elektro</h2>
                  <p className="text-gray-600">
                    Mengasah keahlian instalasi, operasi, dan maintenance sistem kelistrikan modern
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Kompetensi Utama
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Instalasi Sistem Tenaga</li>
                        <li>✓ Motor & Transformator</li>
                        <li>✓ Sistem Kontrol Elektrik</li>
                        <li>✓ Power Quality & Distribution</li>
                        <li>✓ Renewable Energy Systems</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Prospek Karir
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Instalatir Listrik</li>
                        <li>✓ Operator Pembangkit Listrik</li>
                        <li>✓ Teknisi Maintenance</li>
                        <li>✓ Energy Manager</li>
                        <li>✓ Konsultan Ketenagalistrikan</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Durasi:</span> 3 Tahun |{" "}
                      <span className="font-bold">Intake:</span> 3 Rombel
                    </p>
                  </div>
                </div>
              </div>

              {/* Program Otomotif */}
              <div className="mb-12 bg-white rounded-lg shadow-lg border-l-4 border-slate-900 overflow-hidden">
                <div className="bg-slate-50 p-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">🚗 Teknik Otomotif</h2>
                  <p className="text-gray-600">
                    Pelatihan praktis dalam perawatan, perbaikan, dan diagnosis kendaraan modern
                  </p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Kompetensi Utama
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Sistem Engine & Fuel</li>
                        <li>✓ Transmisi & Diferensial</li>
                        <li>✓ Sistem Rem & Suspensi</li>
                        <li>✓ Diagnostic & Troubleshooting</li>
                        <li>✓ Kendaraan Hybrid & Elektrik</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-slate-900">→</span> Prospek Karir
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>✓ Mekanik Bengkel</li>
                        <li>✓ Service Advisor</li>
                        <li>✓ Teknisi Service Kendaraan</li>
                        <li>✓ Parts Manager</li>
                        <li>✓ Entrepreneur Bengkel Otomotif</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">Durasi:</span> 3 Tahun |{" "}
                      <span className="font-bold">Intake:</span> 3 Rombel
                    </p>
                  </div>
                </div>
              </div>

              {/* Keunggulan Program */}
              <div className="bg-white rounded-lg p-8 border-2 border-slate-900">
                <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">
                  Keunggulan Program Kami
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-900 text-white">
                        ✓
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Kurikulum Relevan Industri</h3>
                      <p className="text-sm text-gray-600">
                        Dirancang bekerja sama langsung dengan perusahaan besar
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-900 text-white">
                        ✓
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Praktik di Industri</h3>
                      <p className="text-sm text-gray-600">
                        Kesempatan internship di perusahaan ternama
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-900 text-white">
                        ✓
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Instruktur Bersertifikat</h3>
                      <p className="text-sm text-gray-600">
                        Guru dari praktisi industri dengan pengalaman luas
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-slate-900 text-white">
                        ✓
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Fasilitas Modern</h3>
                      <p className="text-sm text-gray-600">
                        Laboratorium dan workshop dengan peralatan terkini
                      </p>
                    </div>
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
