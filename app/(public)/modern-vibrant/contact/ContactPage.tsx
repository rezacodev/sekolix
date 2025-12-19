import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Navbar, VibrantFooter } from '@/components/themes/modern-vibrant';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ModernVibrantContact() {
  const themeConfig = await getThemeConfigById('modern-vibrant') || getDefaultThemeConfig('modern-vibrant');

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />

        <main className="pt-20">
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold mb-4">Hubungi Kami</h1>
              <p className="text-lg text-cyan-100">Ajukan pertanyaan, kolaborasi, atau informasi pendaftaran siswa</p>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 space-y-3">
                <div>
                  <div className="text-sm text-cyan-300">Telepon</div>
                  <div className="text-lg font-semibold">(021) 1234-5678</div>
                </div>
                <div>
                  <div className="text-sm text-cyan-300">Email</div>
                  <div className="text-lg font-semibold">info@smkn1jakarta.sch.id</div>
                </div>
                <div>
                  <div className="text-sm text-cyan-300">Alamat</div>
                  <div className="text-lg font-semibold">Jl. Pendidikan No. 123, Jakarta</div>
                </div>
              </div>

              <form className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-200">Nama</label>
                  <input className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm text-slate-200">Email</label>
                  <input type="email" className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm text-slate-200">Pesan</label>
                  <textarea rows={4} className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none" />
                </div>
                <button type="button" className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-purple-500 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </section>
        </main>

        <VibrantFooter
          schoolName="SMK Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 123, Jakarta"
          phone="(021) 1234-5678"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: "https://facebook.com/smkn1jakarta",
            instagram: "https://instagram.com/smkn1jakarta",
            twitter: "https://twitter.com/smkn1jakarta",
          }}
        />
      </div>
    </ThemeProvider>
  );
}
