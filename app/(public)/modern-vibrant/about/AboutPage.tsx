import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import {
  Navbar,
  VibrantFooter,
  AboutSection,
  StatisticsCounter
} from "@/components/themes/modern-vibrant";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModernVibrantAbout() {
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

  const statistics = [
    {
      id: "1",
      value: 2500,
      label: "Active Students",
      icon: "users" as const,
      suffix: "+",
      color: themeConfig.primaryColor
    },
    {
      id: "2",
      value: 150,
      label: "Expert Teachers",
      icon: "books" as const,
      suffix: "+",
      color: themeConfig.secondaryColor
    },
    {
      id: "3",
      value: 50,
      label: "Awards Won",
      icon: "awards" as const,
      suffix: "+",
      color: themeConfig.accentColor
    },
    {
      id: "4",
      value: 30,
      label: "Countries",
      icon: "globe" as const,
      suffix: "+",
      color: themeConfig.accentColor
    }
  ];

  const footerData = {
    schoolName: "SMK Negeri 1 Jakarta",
    address: "Jl. Pendidikan No. 123, Jakarta",
    phone: "(021) 1234-5678",
    email: "info@smkn1jakarta.sch.id",
    socialMedia: {
      facebook: "https://facebook.com/smkn1jakarta",
      instagram: "https://instagram.com/smkn1jakarta",
      twitter: "https://twitter.com/smkn1jakarta"
    }
  };

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-cyan-50 to-white text-slate-900">
        <Navbar />

        <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Tentang SMK Negeri 1 Jakarta</h1>
            <p className="text-lg text-cyan-100">
              Sekolah inovatif yang membangun masa depan melalui pendidikan kejuruan berkualitas
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 space-y-4 text-slate-700">
              <p className="text-lg leading-relaxed">
                Kami mengintegrasikan kurikulum berbasis proyek, keterlibatan industri, dan
                pembelajaran berbasis teknologi untuk memastikan setiap siswa siap bersaing di dunia
                kerja modern.
              </p>
              <p className="text-lg leading-relaxed">
                Fokus kami ada pada karakter, keterampilan abad 21, dan kemampuan berkolaborasi
                lintas disiplin agar lulusan memiliki keunggulan kompetitif dan mentalitas inovator.
              </p>
            </div>
            <div className="flex-1">
              <AboutSection />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <StatisticsCounter statistics={statistics} />
        </section>

        <VibrantFooter {...footerData} />
      </div>
    </ThemeProvider>
  );
}
