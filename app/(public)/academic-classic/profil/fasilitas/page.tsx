import Image from "next/image";
import { Header, Footer } from "@/components/themes/academic-classic";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Fasilitas - SMK Negeri 1 Jakarta",
  description: "Fasilitas dan infrastruktur penunjang pembelajaran di SMK Negeri 1 Jakarta",
};

export default async function FasilitasPage() {
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
                Fasilitas Sekolah
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Infrastruktur modern mendukung pembelajaran berkualitas tinggi
              </p>
              <div className="w-24 h-1 academic-accent-bg mx-auto mt-6" />
            </div>
          </div>
        
        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Workshop & Labs */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Workshop & Laboratorium</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1486262715619-67b519e0bbe3?w=500&h=300&fit=crop"
                      alt="Workshop Otomotif"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Workshop Otomotif</h3>
                    <p className="text-gray-700 mb-4">
                      Fasilitas lengkap untuk pembelajaran teknik otomotif dengan peralatan diagnostik modern dan bengkel standar industri.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Diagnostic Engine Analyzer</li>
                      <li>✓ Lift Hidrolik 4 Tiang</li>
                      <li>✓ Mesin Simulasi Kondisi Real</li>
                      <li>✓ Tool Lengkap Standar Industri</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=300&fit=crop"
                      alt="Laboratorium Listrik"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Laboratorium Listrik</h3>
                    <p className="text-gray-700 mb-4">
                      Lab listrik dengan instalasi panel listrik bertegangan tinggi dan peralatan uji standar nasional dan internasional.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Panel Distribusi Tenaga</li>
                      <li>✓ Mesin AC & DC</li>
                      <li>✓ Trafo & Peralatan Pengukuran</li>
                      <li>✓ Sistem PLC Modern</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1565043666747-69f6646db940?w=500&h=300&fit=crop"
                      alt="Workshop Permesinan"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Workshop Permesinan</h3>
                    <p className="text-gray-700 mb-4">
                      Ruang permesinan dengan mesin CNC dan konvensional untuk melatih kemampuan pemesinan presisi tinggi.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Mesin CNC 3 Axis</li>
                      <li>✓ Mesin Bubut Paralel</li>
                      <li>✓ Mesin Frais Standar</li>
                      <li>✓ Mesin Grinding & Drilling</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1563181286-d3fee3d55364?w=500&h=300&fit=crop"
                      alt="Laboratorium Elektronika"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Laboratorium Elektronika</h3>
                    <p className="text-gray-700 mb-4">
                      Lab elektronika dilengkapi dengan peralatan testing canggih untuk praktik troubleshooting dan design sirkuit elektronik.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Oscilloscope Digital</li>
                      <li>✓ Function Generator</li>
                      <li>✓ Multimeter & Tester Khusus</li>
                      <li>✓ Trainer Elektronika</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Facilities */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Fasilitas Pembelajaran</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1580693944550-95d1d68827b5?w=500&h=300&fit=crop"
                      alt="Ruang Kelas Modern"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Ruang Kelas Modern</h3>
                    <p className="text-gray-700">
                      Semua ruang kelas dilengkapi dengan AC, proyektor, smart board interaktif, dan koneksi internet berkecepatan tinggi untuk pembelajaran digital.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1507842064697-8f3ff1703ad0?w=500&h=300&fit=crop"
                      alt="Perpustakaan"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Perpustakaan & Learning Center</h3>
                    <p className="text-gray-700">
                      Koleksi buku 10.000+ judul, majalah teknis, jurnal, akses e-library, dan ruang belajar kelompok dengan WiFi penuh.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop"
                      alt="Lab Komputer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Lab Komputer</h3>
                    <p className="text-gray-700">
                      3 lab dengan 150+ unit komputer, dilengkapi software profesional, CAD, simulation tools, dan sistem keamanan berlapis.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=300&fit=crop"
                      alt="Ruang Multimedia"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Ruang Multimedia & Design</h3>
                    <p className="text-gray-700">
                      Studio untuk media pembelajaran, video production, desain grafis dengan peralatan profesional dan iklim kontrol.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop" alt="Ruang Seminar" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Ruang Pertemuan & Seminar</h3>
                    <p className="text-gray-700">
                      Aula & ruang seminar dengan kapasitas hingga 500 orang, sistem audiovisual canggih untuk acara akademik & non-akademik.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-blue-900 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=300&fit=crop" alt="Asrama Siswa" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Asrama Siswa</h3>
                    <p className="text-gray-700">
                      Asrama berstandar internasional untuk siswa luar daerah dengan fasilitas keamanan, penunjang akademik, dan rekreasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sports & Recreation */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Sarana Olahraga & Rekreasi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1546519638-68711109d298?w=500&h=300&fit=crop" alt="Lapangan Basket" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">❋ Lapangan Basket Standar</h3>
                    <p className="text-sm text-gray-700">Indoor & outdoor dengan fasilitas lighting profesional</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500&h=300&fit=crop" alt="Lapangan Sepakbola" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">⚽ Lapangan Sepakbola</h3>
                    <p className="text-sm text-gray-700">Lapangan standar dengan rumput sintetis & drainage modern</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1503465463093-ac5ff5688c07?w=500&h=300&fit=crop" alt="Lapangan Voli" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">🏐 Lapangan Voli</h3>
                    <p className="text-sm text-gray-700">3 lapangan indoor dengan sistem pencahayaan berstandar kompetisi</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=500&h=300&fit=crop" alt="Kolam Renang" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">🏊 Kolam Renang</h3>
                    <p className="text-sm text-gray-700">Kolam Olympic-size dengan sistem filtrasi modern</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop" alt="Gym & Fitness" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">🏋️ Gym & Fitness Center</h3>
                    <p className="text-sm text-gray-700">Equipment modern dengan pelatih profesional bersertifikat</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-b-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1577720643272-265f434b8bc0?w=500&h=300&fit=crop" alt="Ruang Seni" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-900 mb-2">🎨 Ruang Seni & Budaya</h3>
                    <p className="text-sm text-gray-700">Studio seni, musik, dan tari dengan peralatan profesional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Services */}
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Layanan Pendukung</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1576091160550-112accb0c0f5?w=500&h=300&fit=crop" alt="Klinik Kesehatan" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">🏥 Klinik Kesehatan</h3>
                    <p className="text-gray-700 text-sm">
                      Layanan kesehatan 24/7 dengan dokter dan perawat, pemeriksaan kesehatan berkala, dan farmasi lengkap.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1564834744159-c0d6b5f66e23?w=500&h=300&fit=crop" alt="Kantin" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">🍽️ Kantin & Cafeteria</h3>
                    <p className="text-gray-700 text-sm">
                      Kantin bersih bersertifikat dengan menu bergizi, halal, dan terjangkau untuk semua kalangan.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop" alt="Transportasi" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">🚌 Transportasi</h3>
                    <p className="text-gray-700 text-sm">
                      Bus sekolah dengan rute mencakup seluruh wilayah Jakarta untuk kemudahan akses siswa.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1549148328-7f4d8f7d7d5a?w=500&h=300&fit=crop" alt="Keamanan" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 Keamanan</h3>
                    <p className="text-gray-700 text-sm">
                      Sistem keamanan berlapis dengan CCTV, security gate, dan tim keamanan profesional 24 jam.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop" alt="IT Infrastructure" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">💻 IT Infrastructure</h3>
                    <p className="text-gray-700 text-sm">
                      Server, cloud system, WiFi coverage 100%, backup system, dan cybersecurity terdepan.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop" alt="Aksesibilitas" fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">♿ Aksesibilitas</h3>
                    <p className="text-gray-700 text-sm">
                      Fasilitas ramah difabel dengan ramp, lift, toilet khusus, dan dukungan pendampingan siswa.
                    </p>
                  </div>
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
