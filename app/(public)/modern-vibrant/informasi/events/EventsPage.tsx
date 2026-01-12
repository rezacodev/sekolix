import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { Navbar, VibrantFooter } from "@/components/themes/modern-vibrant";
import { formatDate } from "@/lib/utils";

const sampleEvents = [
  {
    title: "Tech Career Fair 2026",
    date: "2026-01-12",
    location: "Hall A SMKN 1",
    description:
      "40+ perusahaan teknologi membuka peluang magang dan kerja untuk siswa tingkat akhir."
  },
  {
    title: "Design Sprint Week",
    date: "2026-02-02",
    location: "Innovation Lab",
    description:
      "Sprint 5 hari untuk membangun prototipe produk digital dengan mentor UX dan startup founder."
  },
  {
    title: "AI & Robotics Camp",
    date: "2026-03-10",
    location: "Tech Studio",
    description: "Bootcamp intensif AI, computer vision, dan robotik dengan demo proyek akhir."
  }
];

export default async function ModernVibrantEvents() {
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />

        <main className="pt-20">
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold mb-4">Agenda & Kegiatan</h1>
              <p className="text-lg text-cyan-100">
                Kegiatan terkini seputar inovasi, karier, dan kolaborasi industri
              </p>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleEvents.map(event => (
              <div
                key={event.title}
                className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/60 transition"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">
                  {formatDate(event.date)}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                <p className="text-slate-200/80 mb-3">{event.description}</p>
                <div className="text-sm text-slate-300">📍 {event.location}</div>
              </div>
            ))}
          </div>
        </main>

        <VibrantFooter
          schoolName="SMK Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 123, Jakarta"
          phone="(021) 1234-5678"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: "https://facebook.com/smkn1jakarta",
            instagram: "https://instagram.com/smkn1jakarta",
            twitter: "https://twitter.com/smkn1jakarta"
          }}
        />
      </div>
    </ThemeProvider>
  );
}
