import Link from "next/link";
import { Navbar, Footer, TopBar } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Profil - SMK Negeri 1 Jakarta",
  description: "Profil lengkap SMK Negeri 1 Jakarta - Sejarah, Visi Misi, Struktur Organisasi, Fasilitas, dan Program Keahlian",
};

export default async function ProfilPage() {
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
      <main className="min-h-screen bg-gray-50 overflow-x-hidden w-full pt-40">
        <TopBar />
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Profil Sekolah</h1>
            <p className="text-xl text-blue-100 mb-8">Mengenal lebih jauh tentang SMK Negeri 1 Jakarta</p>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Institusi pendidikan kejuruan terkemuka yang berkomitmen menghasilkan lulusan berkualitas, 
              berkarakter, dan siap bersaing di era global.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900">40+</div>
                <p className="text-gray-700 mt-2">Tahun Berdiri</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">4</div>
                <p className="text-gray-700 mt-2">Program Keahlian</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900">1500+</div>
                <p className="text-gray-700 mt-2">Siswa Aktif</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500">96%</div>
                <p className="text-gray-700 mt-2">Tingkat Kelulusan</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Cards */}
            <h2 className="text-3xl font-bold text-blue-900 mb-10">Jelajahi Profil Sekolah</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sejarah */}
              <Link href="/profil/sejarah">
                <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-blue-900 hover:border-orange-500">
                  <div className="bg-linear-to-r from-blue-900 to-blue-800 p-6 text-white group-hover:from-blue-800 group-hover:to-blue-700 transition-all">
                    <h3 className="text-2xl font-bold">Sejarah</h3>
                    <p className="text-blue-100 mt-1">Perjalanan 40 Tahun</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Telusuri perjalanan panjang SMK Negeri 1 Jakarta sejak pendiriannya tahun 1985 hingga menjadi institusi 
                      pendidikan kejuruan terkemuka.
                    </p>
                    <div className="text-blue-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Baca Selengkapnya →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Visi & Misi */}
              <Link href="/profil/visi-misi">
                <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-orange-500 hover:border-blue-900">
                  <div className="bg-linear-to-r from-orange-600 to-orange-500 p-6 text-white group-hover:from-orange-500 group-hover:to-orange-600 transition-all">
                    <h3 className="text-2xl font-bold">Visi & Misi</h3>
                    <p className="text-orange-100 mt-1">Komitmen Institusi</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Pelajari visi, misi, dan nilai-nilai inti yang menjadi panduan dalam mengarahkan pendidikan 
                      berkualitas dan pembangunan karakter siswa.
                    </p>
                    <div className="text-blue-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Baca Selengkapnya →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Struktur Organisasi */}
              <Link href="/profil/struktur">
                <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-blue-900 hover:border-orange-500">
                  <div className="bg-linear-to-r from-blue-800 to-blue-700 p-6 text-white group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
                    <h3 className="text-2xl font-bold">Struktur Organisasi</h3>
                    <p className="text-blue-100 mt-1">Manajemen & Kepemimpinan</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Ketahui susunan organisasi, kepemimpinan, dan pimpinan yang membawa sekolah menuju visi dan misi 
                      yang telah ditetapkan.
                    </p>
                    <div className="text-blue-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Baca Selengkapnya →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Fasilitas */}
              <Link href="/profil/fasilitas">
                <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-orange-500 hover:border-blue-900">
                  <div className="bg-linear-to-r from-orange-700 to-orange-600 p-6 text-white group-hover:from-orange-600 group-hover:to-orange-700 transition-all">
                    <h3 className="text-2xl font-bold">Fasilitas</h3>
                    <p className="text-orange-100 mt-1">Infrastruktur Modern</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Jelajahi fasilitas lengkap dan modern yang mendukung pembelajaran berkualitas, termasuk 
                      workshop, lab, dan sarana penunjang.
                    </p>
                    <div className="text-blue-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Baca Selengkapnya →
                    </div>
                  </div>
                </div>
              </Link>

              {/* Program Keahlian */}
              <Link href="/profil/program-keahlian">
                <div className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-t-4 border-blue-900 hover:border-orange-500 md:col-span-2">
                  <div className="bg-linear-to-r from-blue-900 to-blue-800 p-6 text-white group-hover:from-blue-800 group-hover:to-blue-900 transition-all">
                    <h3 className="text-2xl font-bold">Program Keahlian</h3>
                    <p className="text-blue-100 mt-1">Pilihan Program Studi Berkualitas</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">
                      Temukan 4 program keahlian utama dengan sertifikasi internasional: Teknik Otomotif, Teknik Listrik, 
                      Teknik Permesinan, dan Teknik Elektronika yang siap mempersiapkan karir cemerlang Anda.
                    </p>
                    <div className="text-blue-900 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Baca Selengkapnya →
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-linear-to-r from-blue-900 to-blue-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Tertarik untuk Bergabung?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Dapatkan pendidikan kejuruan berkualitas tinggi dengan fasilitas modern dan lulusan yang diterima di industri. 
              Hubungi kami sekarang untuk informasi pendaftaran.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:021123456789" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Hubungi Kami
              </a>
              <Link href="/profil/program-keahlian" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Lihat Program
              </Link>
            </div>
          </div>
        </section>

        {/* Key Achievements */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">Pencapaian Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-4xl font-bold text-blue-900 mb-2">A</div>
                <h3 className="font-bold text-blue-900 mb-2">Akreditasi A</h3>
                <p className="text-sm text-gray-700">
                  Akreditasi A dari BAN-S/M menunjukkan standar kualitas pendidikan yang tinggi dan konsisten.
                </p>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
                <h3 className="font-bold text-blue-900 mb-2">Kemitraan Industri</h3>
                <p className="text-sm text-gray-700">
                  Kerjasama strategis dengan perusahaan-perusahaan terkemuka untuk relevansi kurikulum.
                </p>
              </div>

              <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-4xl font-bold text-blue-900 mb-2">95%</div>
                <h3 className="font-bold text-blue-900 mb-2">Penyerapan Kerja</h3>
                <p className="text-sm text-gray-700">
                  Lulusan kami terserap di dunia kerja dalam waktu kurang dari 6 bulan setelah lulus.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </ThemeProvider>
  );
}
