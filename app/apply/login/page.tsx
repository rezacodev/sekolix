import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getActiveThemeId, getDefaultThemeConfig, getThemeConfigById } from "@/lib/utils";
import { LoginStatusForm } from "@/components/spmb/LoginStatusForm";

export default async function ApplyLoginPage() {
  const activeThemeId = await getActiveThemeId();
  const themeConfig =
    (await getThemeConfigById(activeThemeId)) ?? getDefaultThemeConfig(activeThemeId);

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
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Penerimaan Siswa</p>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Login Calon Siswa</h1>
              <p className="text-sm text-muted-foreground">
                Masukkan NIK dan nomor HP yang digunakan saat mendaftar untuk melihat status seleksi.
              </p>
            </div>
            <div className="mt-8">
              <LoginStatusForm />
            </div>
            <div className="mt-6 text-center text-sm">
              <Link href="/apply" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Kembali ke formulir pendaftaran
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
