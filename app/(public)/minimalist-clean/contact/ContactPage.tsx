import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { MinimalNavbar, MinimalFooter, CleanContactForm } from '@/components/themes/minimalist-clean';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const contactInfo = [
  { label: 'Telepon', value: '(021) 4567-8910' },
  { label: 'Email', value: 'info@smkn1jakarta.sch.id' },
  { label: 'Alamat', value: 'Jl. Pendidikan No. 45, Jakarta Pusat' },
];

export default async function MinimalistCleanContact() {
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />

        <main className="pt-24">
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Kontak</p>
              <h1 className="text-4xl font-light">Mari Terhubung</h1>
              <p className="text-slate-600 max-w-2xl">Pertanyaan tentang pendaftaran, kerjasama industri, atau kunjungan sekolah dapat disampaikan melalui formulir berikut.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {contactInfo.map((item) => (
                <div key={item.label} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-lg text-slate-900 font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <CleanContactForm />
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
