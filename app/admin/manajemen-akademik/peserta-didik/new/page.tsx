"use client";

import PesertaForm from "../PesertaForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function NewPesertaPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Peserta Didik</h1>
          <p className="text-muted-foreground">
            Tambah data siswa aktif baru melalui formulir di bawah.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulir Peserta</CardTitle>
            <CardDescription>Isi data peserta didik dengan lengkap.</CardDescription>
          </CardHeader>
          <CardContent>
            <PesertaForm initialData={undefined} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
