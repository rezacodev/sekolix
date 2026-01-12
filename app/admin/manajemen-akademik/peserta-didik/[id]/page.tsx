"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PesertaForm from "../PesertaForm";

type PesertaFormData = {
  id?: string;
  nik: string;
  fullName: string;
  phone: string;
  email?: string;
  nisn?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  address?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  fatherName?: string;
  fatherNik?: string;
  fatherBirthYear?: string;
  fatherEducation?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName?: string;
  motherNik?: string;
  motherBirthYear?: string;
  motherEducation?: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  guardianNik?: string;
  guardianBirthYear?: string;
  guardianEducation?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
  mobile?: string;
  livesWith?: string;
  weight?: string;
  height?: string;
  distanceToSchool?: string;
  transportationMode?: string;
  anakKe?: string;
  jumlahSaudara?: string;
  achievements?: string;
};

export default function EditPesertaPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<PesertaFormData | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/manajemen-akademik/peserta-didik?id=${id}`);
        const data = await res.json();
        const item = data.item || null;
        if (item) {
          setInitialData({
            id,
            nik: item.nik || "",
            fullName: item.fullName || "",
            phone: item.phone || "",
            email: item.email || "",
            nisn: item.nisn || "",
            placeOfBirth: item.placeOfBirth || "",
            dateOfBirth: item.dateOfBirth || "",
            gender: item.gender || "",
            nationality: item.nationality || "",
            religion: item.religion || "",
            motherTongue: item.motherTongue || "",
            address: item.address || "",
            village: item.village || "",
            district: item.district || "",
            city: item.city || "",
            province: item.province || "",
            postalCode: item.postalCode || "",
            fatherName: item.fatherName || "",
            fatherNik: item.fatherNik || "",
            fatherBirthYear: item.fatherBirthYear?.toString() || "",
            fatherEducation: item.fatherEducation || "",
            fatherOccupation: item.fatherOccupation || "",
            fatherIncome: item.fatherIncome || "",
            motherName: item.motherName || "",
            motherNik: item.motherNik || "",
            motherBirthYear: item.motherBirthYear?.toString() || "",
            motherEducation: item.motherEducation || "",
            motherOccupation: item.motherOccupation || "",
            motherIncome: item.motherIncome || "",
            guardianName: item.guardianName || "",
            guardianNik: item.guardianNik || "",
            guardianBirthYear: item.guardianBirthYear?.toString() || "",
            guardianEducation: item.guardianEducation || "",
            guardianOccupation: item.guardianOccupation || "",
            guardianIncome: item.guardianIncome || "",
            mobile: item.mobile || "",
            livesWith: item.livesWith || "",
            weight: item.weight?.toString() || "",
            height: item.height?.toString() || "",
            distanceToSchool: item.distanceToSchool?.toString() || "",
            transportationMode: item.transportationMode || "",
            anakKe: item.anakKe?.toString() || "",
            jumlahSaudara: item.jumlahSaudara?.toString() || "",
            achievements: item.achievements || ""
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Peserta Didik</h1>
          <p className="text-muted-foreground">Update data peserta didik</p>
        </div>

        <div className="mt-4">
          {initialData ? (
            <PesertaForm initialData={initialData} />
          ) : (
            <div>Data tidak ditemukan</div>
          )}
        </div>
      </div>
    </div>
  );
}
