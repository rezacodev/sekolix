import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { MinimalNavbar, MinimalFooter, MinimalAbout } from "@/components/themes/minimalist-clean";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MinimalistCleanAbout() {
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />

        <main className="pt-24">
          <MinimalAbout
            badge="Tentang Kami"
            title="Sekolah Vokasi dengan Fokus Keterampilan Nyata"
            description1="SMK Negeri 1 Jakarta membekali siswa dengan kompetensi praktis, pengalaman industri, dan portofolio proyek nyata."
            description2="Pembelajaran kolaboratif, lab modern, dan pendampingan karier memastikan lulusan siap kerja atau melanjutkan studi."
            features={[
              { text: "Akreditasi A dengan kurikulum industri" },
              { text: "40+ mitra perusahaan untuk magang" },
              { text: "Sertifikasi kompetensi untuk tiap jurusan" }
            ]}
            imageUrl="https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=900&q=80"
          />

          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid md:grid-cols-3 gap-8 border-t border-slate-200 pt-12">
              {[
                {
                  title: "Fokus Industri",
                  desc: "Pembelajaran berbasis proyek dengan mentor praktisi."
                },
                {
                  title: "Laboratorium",
                  desc: "Peralatan terkini untuk otomasi, desain, dan komputasi."
                },
                {
                  title: "Karier & Kampus",
                  desc: "Bimbingan karier, beasiswa, dan jalur kuliah lanjut."
                }
              ].map(item => (
                <div key={item.title} className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{item.title}</p>
                  <p className="text-lg text-slate-700 leading-relaxed">{item.desc}</p>
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
