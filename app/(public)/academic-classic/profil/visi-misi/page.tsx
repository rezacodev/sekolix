import { Header, Footer } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Visi & Misi - SMK Negeri 1 Jakarta",
  description: "Visi, misi, dan nilai-nilai inti SMK Negeri 1 Jakarta dalam membentuk generasi muda berkualitas",
};

export default async function VisiMisiPage() {
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
                Visi & Misi
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Panduan strategis dalam mengarahkan visi pendidikan dan pembangunan karakter
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>
        
        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Visi */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Visi</h2>
              <div className="bg-linear-to-r from-blue-50 to-orange-50 border-l-4 border-blue-900 p-8 rounded-r-lg">
                <p className="text-xl text-gray-800 leading-relaxed font-semibold">
                  &ldquo;Menjadi lembaga pendidikan kejuruan terdepan yang menghasilkan sumber daya manusia berkualitas tinggi, 
                  berkarakter luhur, berdaya saing global, dan siap berkontribusi pada pembangunan bangsa.&rdquo;
                </p>
              </div>
              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-bold text-blue-900 mb-4">Penjelasan Visi:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-blue-900 font-bold">•</span>
                    <span><strong>Terdepan:</strong> Memimpin dalam inovasi pendidikan dan pengembangan kurikulum berbasis kompetensi industri</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-900 font-bold">•</span>
                    <span><strong>Berkualitas Tinggi:</strong> Standar pendidikan yang selalu meningkat dan memenuhi atau melampaui ekspektasi stakeholder</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-900 font-bold">•</span>
                    <span><strong>Berkarakter Luhur:</strong> Lulusan yang tidak hanya terampil teknis tetapi juga memiliki moral dan etika yang kuat</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-900 font-bold">•</span>
                    <span><strong>Daya Saing Global:</strong> Mampu bersaing di pasar kerja internasional dengan sertifikasi dan kompetensi yang diakui dunia</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Misi */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Misi</h2>
              <div className="space-y-4">
                <div className="bg-white border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm">
                  <div className="flex gap-4">
                    <div className="text-orange-500 font-bold text-2xl w-8">1</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Menyelenggarakan pendidikan kejuruan berkualitas tinggi</h3>
                      <p className="text-gray-700">Memberikan pembelajaran yang relevan dengan kebutuhan industri, menggunakan metode pedagogi modern, dan mengintegrasikan teori dengan praktik real-world.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm">
                  <div className="flex gap-4">
                    <div className="text-orange-500 font-bold text-2xl w-8">2</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Mengembangkan kompetensi siswa secara holistik</h3>
                      <p className="text-gray-700">Memfasilitasi pengembangan hard skills (teknis) dan soft skills (komunikasi, leadership, problem-solving) untuk menghadapi tantangan dunia kerja modern.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm">
                  <div className="flex gap-4">
                    <div className="text-orange-500 font-bold text-2xl w-8">3</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Membina karakter dan nilai-nilai kearifan lokal</h3>
                      <p className="text-gray-700">Membangun siswa yang tidak hanya kompeten tetapi juga berakhlak mulia, menghargai budaya lokal, dan berkontribusi pada kehidupan bermasyarakat.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm">
                  <div className="flex gap-4">
                    <div className="text-orange-500 font-bold text-2xl w-8">4</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Membangun kemitraan strategis dengan industri dan institusi pendidikan</h3>
                      <p className="text-gray-700">Menciptakan ekosistem pembelajaran yang melibatkan dunia usaha, lembaga sertifikasi, dan universitas untuk meningkatkan relevansi dan karir siswa.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-l-4 border-orange-500 p-6 rounded-r-lg shadow-sm">
                  <div className="flex gap-4">
                    <div className="text-orange-500 font-bold text-2xl w-8">5</div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2">Mendorong inovasi, kreativitas, dan kewirausahaan</h3>
                      <p className="text-gray-700">Memfasilitasi siswa untuk menjadi innovators dan entrepreneurs, membuka peluang untuk menciptakan lapangan kerja dan berkontribusi pada pertumbuhan ekonomi.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nilai-Nilai Inti */}
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Nilai-Nilai Inti (Core Values)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-blue-900 to-blue-700 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Integritas</h3>
                  <p>Berkomitmen pada kejujuran, transparansi, dan konsistensi dalam setiap tindakan dan keputusan.</p>
                </div>

                <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Keunggulan</h3>
                  <p>Selalu berusaha memberikan yang terbaik, mencapai standar tertinggi, dan terus melakukan perbaikan berkelanjutan.</p>
                </div>

                <div className="bg-linear-to-br from-blue-800 to-blue-600 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Inovasi</h3>
                  <p>Terbuka terhadap ide baru, mendorong kreativitas, dan terus mengembangkan metode pembelajaran yang lebih efektif.</p>
                </div>

                <div className="bg-linear-to-br from-orange-600 to-orange-700 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Kolaborasi</h3>
                  <p>Bekerja sama secara efektif, menghargai keberagaman, dan menciptakan lingkungan yang inklusif dan saling mendukung.</p>
                </div>

                <div className="bg-linear-to-br from-blue-700 to-blue-500 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Keberlanjutan</h3>
                  <p>Bertanggung jawab terhadap lingkungan, masyarakat, dan generasi mendatang dalam setiap program dan keputusan.</p>
                </div>

                <div className="bg-linear-to-br from-orange-700 to-orange-800 text-white p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-3">Kerendahan Hati</h3>
                  <p>Tetap merendah, siap belajar, dan mendengarkan masukan untuk terus berkembang dan meningkatkan diri.</p>
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
