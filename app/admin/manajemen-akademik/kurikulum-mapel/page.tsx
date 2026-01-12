import { redirect } from "next/navigation";

export default function KurikulumMapelPage() {
  // Redirect ke tab kurikulum sebagai default
  redirect("/admin/manajemen-akademik/kurikulum-mapel/kurikulum");
}
