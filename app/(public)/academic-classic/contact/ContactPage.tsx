import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Header, Footer } from '@/components/themes/academic-classic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const contactInfo = {
  phone: '(021) 4567-8910',
  email: 'humas@smkn1jakarta.sch.id',
  address: 'Jl. Pendidikan No. 45, Jakarta Pusat',
};

export default async function AcademicClassicContact() {
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
        <div className="min-h-screen bg-gray-50 pt-20">

        <header className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Kontak</p>
            <h1 className="text-4xl font-bold mt-2">Hubungi SMK Negeri 1 Jakarta</h1>
            <p className="text-blue-100 mt-3 max-w-3xl">Informasi dan pertanyaan seputar pendaftaran, kemitraan industri, atau kunjungan sekolah.</p>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-wide text-blue-800 font-semibold">Telepon</p>
              <p className="mt-2 text-gray-800 font-semibold">{contactInfo.phone}</p>
              <p className="text-sm text-gray-600">Senin - Jumat, 08.00 - 16.00</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-wide text-blue-800 font-semibold">Email</p>
              <p className="mt-2 text-gray-800 font-semibold">{contactInfo.email}</p>
              <p className="text-sm text-gray-600">Tanggapan maksimal 1 hari kerja</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-xs uppercase tracking-wide text-blue-800 font-semibold">Alamat</p>
              <p className="mt-2 text-gray-800 font-semibold">{contactInfo.address}</p>
              <p className="text-sm text-gray-600">Jakarta Pusat, DKI Jakarta</p>
            </div>
          </div>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Formulir Kontak</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input type="email" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Nomor Telepon</label>
                  <input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Pesan</label>
                <textarea rows={5} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="button" className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition">Kirim Pesan</button>
            </form>
          </section>
        </main>

        <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
