import Link from "next/link";
import { ApplyForm } from "@/components/spmb/ApplyForm";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getActiveThemeId, getDefaultThemeConfig, getThemeConfigById } from "@/lib/utils";
import { db } from "@/lib/db";

const DEFAULT_HERO = {
  title: "Pendaftaran Siswa Baru Sekolah Kita",
  description:
    "Isi data dasar kamu untuk memulai proses seleksi. Cukup NIK dan nomor HP, sisanya bisa dilengkapi nanti."
};

export default async function ApplyPage() {
  const [activeThemeId, landingSettings, programs, activeYear] = await Promise.all([
    getActiveThemeId(),
    db.admissionLandingSetting.findFirst({ orderBy: { updatedAt: "desc" } }),
    db.program.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    }),
    db.tahunAjaran.findFirst({
      where: { isActive: true },
      orderBy: { startDate: "desc" }
    })
  ]);

  const themeConfig =
    (await getThemeConfigById(activeThemeId)) ?? getDefaultThemeConfig(activeThemeId);

  const heroTitle = landingSettings?.heroTitle ?? DEFAULT_HERO.title;
  const heroDescription = landingSettings?.heroDescription ?? DEFAULT_HERO.description;
  const isApplyFormEnabled = landingSettings?.isApplyFormEnabled ?? true;

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
      <div className="min-h-screen bg-background">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.1),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.1),_transparent_45%)] bg-muted text-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Penerimaan Siswa
                </p>
                <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  {heroTitle}
                </h1>
                <p className="mt-4 text-base text-muted-foreground">{heroDescription}</p>
                {activeYear && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Tahun ajaran aktif: {activeYear.label}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-sm font-semibold">
                <Link
                  href="/"
                  className="rounded-full border border-card px-4 py-2 text-foreground transition hover:border-card hover:bg-muted"
                >
                  Kembali ke Homepage
                </Link>
                <Link
                  href="#apply-form"
                  className="rounded-full border border-card bg-muted px-4 py-2 text-foreground transition hover:bg-muted/80"
                >
                  Daftar
                </Link>
                <Link
                  href="/apply/login"
                  className="rounded-full border border-card bg-muted px-4 py-2 text-foreground transition hover:bg-muted/80"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
          {!isApplyFormEnabled && (
            <div className="rounded-lg border border-card bg-muted px-4 py-3 text-sm text-foreground">
              <p className="font-semibold">Form Pendaftaran Sedang Ditutup</p>
              <p className="mt-1">
                Maaf, form pendaftaran saat ini tidak tersedia. Silakan hubungi sekolah untuk
                informasi lebih lanjut.
              </p>
            </div>
          )}

          {isApplyFormEnabled && (
            <div
              id="apply-form"
              className="rounded-3xl border border-card bg-card p-8 shadow-2xl shadow-slate-900/50 backdrop-blur"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Formulir Pendaftaran</h2>
                <p className="text-sm text-muted-foreground">
                  Pastikan NIK dan nomor HP sudah sesuai dokumen. Data kamu akan dilindungi sesuai
                  kebijakan privasi sekolah.
                </p>
              </div>
              <div className="mt-8">
                <ApplyForm programs={programs} activeYear={activeYear ?? null} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
