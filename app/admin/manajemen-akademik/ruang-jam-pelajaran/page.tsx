"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RuangJamPelajaranPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/manajemen-akademik/ruang-jam-pelajaran/ruang");
  }, [router]);

  return null;
}
