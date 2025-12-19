import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { MinimalNavbar, MinimalFooter } from '@/components/themes/minimalist-clean';
import { formatDate } from '@/lib/utils';

const sampleEvents = [
  {
    title: 'Career Day & Company Talks',
    date: '2026-01-20',
    location: 'Aula SMKN 1',
    description: 'Mitra industri berbagi jalur karier, membuka peluang magang, dan rekrutmen cepat.',
  },
  {
    title: 'Workshop UI/UX Fundamentals',
    date: '2026-02-05',
    location: 'Design Lab',
    description: 'Pelatihan praktik desain antarmuka dan prototyping dengan studi kasus aplikasi publik.',
  },
  {
    title: 'Automation & IoT Showcase',
    date: '2026-03-02',
    location: 'Teknopark',
    description: 'Demo proyek otomasi, sensor, dan dashboard produksi dari siswa kelas XI-XII.',
  },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MinimalistCleanEvents() {
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <section className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Agenda</p>
              <h1 className="text-4xl font-light">Agenda & Kegiatan</h1>
              <p className="text-slate-600 max-w-2xl">Jadwal kegiatan siswa: pelatihan keterampilan, kolaborasi industri, dan pameran karya.</p>
            </div>

            <div className="space-y-4">
              {sampleEvents.map((event) => (
                <div key={event.title} className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light">{event.title}</h3>
                      <p className="text-slate-600">{event.description}</p>
                    </div>
                    <div className="text-sm text-slate-500 min-w-[180px] text-right md:text-center">
                      <div className="font-semibold text-slate-900">{formatDate(event.date)}</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <MinimalFooter
          schoolName="SMK Negeri 1 Jakarta"
          description="Sekolah vokasi dengan budaya kolaboratif, teknologi, dan karakter kuat."
          address="Jl. Pendidikan No. 45, Jakarta Pusat"
          phone="(021) 4567-8910"
          email="info@smkn1jakarta.sch.id"
        />
      </div>
    </ThemeProvider>
  );
}
