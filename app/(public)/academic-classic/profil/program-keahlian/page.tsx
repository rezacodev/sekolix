import { Header, Footer } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Program Keahlian - SMK Negeri 1 Jakarta",
  description: "Daftar lengkap program keahlian dan bidang studi di SMK Negeri 1 Jakarta",
};

export default async function ProgramKeahlianPage() {
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
                Program Keahlian
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Pilihan program studi berkualitas dengan sertifikasi internasional
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>
        
        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Program Overview */}
            <div className="mb-12 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Ikhtisar Program</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SMK Negeri 1 Jakarta menawarkan 4 program keahlian utama yang dirancang mengikuti standar industri terkini. 
                Setiap program dilengkapi dengan fasilitas modern, instruktur bersertifikat, dan kerjasama dengan industri 
                untuk memberikan pengalaman pembelajaran yang aplikatif dan relevan dengan kebutuhan pasar kerja.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Semua program telah terakreditasi dan beberapa telah mendapatkan sertifikasi internasional. Lulusan kami 
                tersebar di berbagai perusahaan terkemuka dan mempunyai tingkat penyerapan kerja di atas 95%.
              </p>
            </div>

            {/* Program Details */}
            <div className="space-y-8">
              {/* Program 1 */}
              <div className="bg-white rounded-lg shadow-sm border-t-4 border-blue-900 overflow-hidden">
                <div className="bg-linear-to-r from-blue-900 to-blue-800 p-6 text-white">
                  <h3 className="text-2xl font-bold">Teknik Otomotif</h3>
                  <p className="text-blue-100 mt-2">Menghasilkan teknisi otomotif profesional dan siap bersaing global</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Kompetensi Utama:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Pemeliharaan & perbaikan mesin</li>
                        <li>✓ Sistem kelistrikan otomotif</li>
                        <li>✓ Tuning & modifikasi mesin</li>
                        <li>✓ Diagnosa kerusakan dengan alat scanner</li>
                        <li>✓ Penggunaan alat modern & teknologi</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Sertifikasi & Prospek:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>🎓 LSP Otomotif Level 1, 2, 3</li>
                        <li>🎓 Sertifikasi Toyota & Mitsubishi</li>
                        <li>📊 Peluang kerja: Workshop, dealer, industri otomotif</li>
                        <li>💼 Rata-rata gaji awal: Rp 3-5 juta</li>
                        <li>🚀 Lanjut kuliah di D3/S1 Teknik Otomotif</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Durasi:</strong> 3 tahun | <strong>Kapasitas:</strong> 3 rombel (120 siswa) | 
                      <strong> Instruktur:</strong> 8 orang bersertifikat internasional
                    </p>
                  </div>
                </div>
              </div>

              {/* Program 2 */}
              <div className="bg-white rounded-lg shadow-sm border-t-4 border-orange-500 overflow-hidden">
                <div className="bg-linear-to-r from-orange-600 to-orange-500 p-6 text-white">
                  <h3 className="text-2xl font-bold">Teknik Listrik</h3>
                  <p className="text-orange-100 mt-2">Mempersiapkan teknisi listrik yang kompeten dan inovatif</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Kompetensi Utama:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Instalasi listrik industri & residensial</li>
                        <li>✓ Pengoperasian mesin listrik AC & DC</li>
                        <li>✓ Sistem kontrol & automasi industri</li>
                        <li>✓ Pemeliharaan transformator & panel distribusi</li>
                        <li>✓ Troubleshooting sistem kelistrikan</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Sertifikasi & Prospek:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>🎓 BNSP Instalasi Listrik Level 1, 2</li>
                        <li>🎓 Sertifikasi PLC & Automation</li>
                        <li>📊 Peluang kerja: PLN, manufaktur, properti</li>
                        <li>💼 Rata-rata gaji awal: Rp 3.5-5.5 juta</li>
                        <li>🚀 Lanjut kuliah di D3/S1 Teknik Elektro</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Durasi:</strong> 3 tahun | <strong>Kapasitas:</strong> 3 rombel (120 siswa) | 
                      <strong> Instruktur:</strong> 10 orang bersertifikat
                    </p>
                  </div>
                </div>
              </div>

              {/* Program 3 */}
              <div className="bg-white rounded-lg shadow-sm border-t-4 border-blue-900 overflow-hidden">
                <div className="bg-linear-to-r from-blue-800 to-blue-700 p-6 text-white">
                  <h3 className="text-2xl font-bold">Teknik Permesinan</h3>
                  <p className="text-blue-100 mt-2">Mengembangkan teknisi permesinan dengan presisi tinggi</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Kompetensi Utama:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Pengoperasian mesin bubut & frais</li>
                        <li>✓ Pemrograman & pengoperasian CNC</li>
                        <li>✓ Teknik pembacaan gambar teknik</li>
                        <li>✓ Pemeliharaan mesin industrial</li>
                        <li>✓ Quality control & presisi dimensi</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Sertifikasi & Prospek:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>🎓 BNSP Machining Level 1, 2, 3</li>
                        <li>🎓 Sertifikasi CAD & CAM</li>
                        <li>📊 Peluang kerja: Manufaktur, industri otomotif, aerospace</li>
                        <li>💼 Rata-rata gaji awal: Rp 3.5-5.5 juta</li>
                        <li>🚀 Lanjut kuliah di D3/S1 Teknik Mesin</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Durasi:</strong> 3 tahun | <strong>Kapasitas:</strong> 2 rombel (80 siswa) | 
                      <strong> Instruktur:</strong> 6 orang bersertifikat
                    </p>
                  </div>
                </div>
              </div>

              {/* Program 4 */}
              <div className="bg-white rounded-lg shadow-sm border-t-4 border-orange-500 overflow-hidden">
                <div className="bg-linear-to-r from-orange-700 to-orange-600 p-6 text-white">
                  <h3 className="text-2xl font-bold">Teknik Elektronika</h3>
                  <p className="text-orange-100 mt-2">Melatih teknisi elektronika modern dengan teknologi terkini</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Kompetensi Utama:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Dasar elektronika analog & digital</li>
                        <li>✓ Pemrograman microcontroller & IoT</li>
                        <li>✓ Troubleshooting perangkat elektronik</li>
                        <li>✓ Design & fabrikasi PCB</li>
                        <li>✓ Sistem smart home & automation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-3">Sertifikasi & Prospek:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>🎓 BNSP Electronics Level 1, 2</li>
                        <li>🎓 Sertifikasi Arduino & Embedded Systems</li>
                        <li>📊 Peluang kerja: Tech startup, elektronik, telekomunikasi</li>
                        <li>💼 Rata-rata gaji awal: Rp 4-6 juta</li>
                        <li>🚀 Lanjut kuliah di D3/S1 Teknik Elektronika</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Durasi:</strong> 3 tahun | <strong>Kapasitas:</strong> 2 rombel (80 siswa) | 
                      <strong> Instruktur:</strong> 7 orang bersertifikat
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission & Contact */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Persyaratan Pendaftaran</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Lulusan SMP/sederajat</li>
                  <li>✓ Belum berusia 21 tahun saat memasuki</li>
                  <li>✓ Lulus tes akademik & psikometri</li>
                  <li>✓ Kesehatan prima (tes kesehatan)</li>
                  <li>✓ Memiliki semangat & dedikasi tinggi</li>
                </ul>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-orange-100 p-8 rounded-lg border border-orange-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Hubungi Kami</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>📞 Telepon: (021) 1234-5678</li>
                  <li>📧 Email: pendaftaran@smk1jakarta.sch.id</li>
                  <li>🌐 Website: www.smk1jakarta.sch.id</li>
                  <li>📍 Alamat: Jl. Pendidikan No. 123, Jakarta</li>
                  <li>⏰ Jam Kerja: Senin-Jumat 08:00-16:00</li>
                </ul>
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
