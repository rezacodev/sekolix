import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Header, Footer } from '@/components/themes/academic-classic';
import { formatDate } from '@/lib/utils';

const sampleEvents = [
  {
    title: 'Pameran Pendidikan & Karier',
    date: '2025-12-20',
    location: 'Aula SMKN 1 Jakarta',
    description: 'Sosialisasi program studi, booth industri, dan konseling karier untuk siswa kelas XII.'
  },
  {
    title: 'Workshop IoT untuk Industri',
    date: '2026-01-15',
    location: 'Lab Elektronika',
    description: 'Pelatihan perangkat IoT dan automasi untuk guru dan siswa terpilih.'
  },
  {
    title: 'Job Fair & Campus Expo',
    date: '2026-02-05',
    location: 'Lapangan Utama',
    description: 'Rekrutmen langsung oleh mitra industri dan informasi kuliah lanjut.'
  },
];

export default async function AcademicClassicEvents() {
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
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Agenda</p>
            <h1 className="text-4xl font-bold mt-2">Agenda & Kegiatan</h1>
            <p className="text-blue-100 mt-3">Jadwal terbaru kegiatan sekolah, workshop, dan pameran karier.</p>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
          {sampleEvents.map((event) => (
            <div key={event.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{event.title}</h3>
                  <p className="text-gray-600 mt-1">{event.description}</p>
                </div>
                <div className="text-sm text-right md:text-center min-w-[180px]">
                  <div className="font-semibold text-blue-900">{formatDate(event.date)}</div>
                  <div className="text-gray-600">{event.location}</div>
                </div>
              </div>
            </div>
          ))}
        </main>

        <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
