"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const pesertaSchema = z.object({
  nik: z.string().min(1, "NIK wajib"),
  fullName: z.string().min(1, "Nama wajib"),
  phone: z.string().min(1, "Telepon wajib"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  nisn: z.string().optional(),
  placeOfBirth: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  motherTongue: z.string().optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),

  fatherName: z.string().optional(),
  fatherNik: z.string().optional(),
  fatherBirthYear: z.string().optional(),
  fatherEducation: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherIncome: z.string().optional(),

  motherName: z.string().optional(),
  motherNik: z.string().optional(),
  motherBirthYear: z.string().optional(),
  motherEducation: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherIncome: z.string().optional(),

  guardianName: z.string().optional(),
  guardianNik: z.string().optional(),
  guardianBirthYear: z.string().optional(),
  guardianEducation: z.string().optional(),
  guardianOccupation: z.string().optional(),
  guardianIncome: z.string().optional(),

  mobile: z.string().optional(),
  livesWith: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  distanceToSchool: z.string().optional(),
  transportationMode: z.string().optional(),
  anakKe: z.string().optional(),
  jumlahSaudara: z.string().optional(),
  achievements: z.string().optional()
});

export type PesertaFormValues = z.infer<typeof pesertaSchema>;

interface Props {
  initialData?: Partial<PesertaFormValues> & { id?: string };
}

export default function PesertaForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PesertaFormValues>({
    resolver: zodResolver(pesertaSchema),
    defaultValues: {
      nik: initialData?.nik || "",
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      nisn: initialData?.nisn || "",
      placeOfBirth: initialData?.placeOfBirth || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      gender: initialData?.gender || "",
      nationality: initialData?.nationality || "",
      religion: initialData?.religion || "",
      motherTongue: initialData?.motherTongue || "",
      address: initialData?.address || "",
      village: initialData?.village || "",
      district: initialData?.district || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      postalCode: initialData?.postalCode || "",

      fatherName: initialData?.fatherName || "",
      fatherNik: initialData?.fatherNik || "",
      fatherBirthYear: initialData?.fatherBirthYear || "",
      fatherEducation: initialData?.fatherEducation || "",
      fatherOccupation: initialData?.fatherOccupation || "",
      fatherIncome: initialData?.fatherIncome || "",

      motherName: initialData?.motherName || "",
      motherNik: initialData?.motherNik || "",
      motherBirthYear: initialData?.motherBirthYear || "",
      motherEducation: initialData?.motherEducation || "",
      motherOccupation: initialData?.motherOccupation || "",
      motherIncome: initialData?.motherIncome || "",

      guardianName: initialData?.guardianName || "",
      guardianNik: initialData?.guardianNik || "",
      guardianBirthYear: initialData?.guardianBirthYear || "",
      guardianEducation: initialData?.guardianEducation || "",
      guardianOccupation: initialData?.guardianOccupation || "",
      guardianIncome: initialData?.guardianIncome || "",

      mobile: initialData?.mobile || "",
      livesWith: initialData?.livesWith || "",
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      distanceToSchool: initialData?.distanceToSchool || "",
      transportationMode: initialData?.transportationMode || "",
      anakKe: initialData?.anakKe || "",
      jumlahSaudara: initialData?.jumlahSaudara || "",
      achievements: initialData?.achievements || ""
    }
  });

  const onSubmit = async (data: PesertaFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data };
      const url = initialData?.id
        ? "/api/admin/manajemen-akademik/peserta-didik"
        : "/api/admin/manajemen-akademik/peserta-didik";
      const method = initialData?.id ? "PATCH" : "POST";
      const body = initialData?.id
        ? JSON.stringify({ ...payload, id: initialData.id })
        : JSON.stringify(payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Gagal menyimpan data");
        return;
      }

      toast.success(
        initialData?.id ? "Data peserta berhasil diperbarui" : "Peserta berhasil ditambahkan"
      );
      router.push("/admin/manajemen-akademik/peserta-didik");
    } catch (e) {
      console.error(e);
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Data Personal</TabsTrigger>
            <TabsTrigger value="parents">Data Orang Tua</TabsTrigger>
            <TabsTrigger value="additional">Data Tambahan</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NIK" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nisn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NISN</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NISN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempat Lahir</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan tempat lahir" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin</FormLabel>
                        <FormControl>
                          <Input placeholder="Laki-laki/Perempuan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kewarganegaraan</FormLabel>
                        <FormControl>
                          <Input placeholder="Indonesia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agama</FormLabel>
                        <FormControl>
                          <Input placeholder="Islam/Kristen/Hindu/Buddha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherTongue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bahasa Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="Bahasa Indonesia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan alamat lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelurahan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kelurahan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kecamatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kecamatan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kota</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provinsi</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan provinsi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kode pos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Ayah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama ayah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherNik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NIK ayah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherBirthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lahir Ayah</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1980" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="SD/SMP/SMA/S1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pekerjaan Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="Wiraswasta/PNS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penghasilan Ayah</FormLabel>
                        <FormControl>
                          <Input placeholder="<2 juta/2-5 juta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Ibu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama ibu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherNik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NIK ibu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherBirthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lahir Ibu</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1982" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="SD/SMP/SMA/S1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pekerjaan Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="Ibu Rumah Tangga/Guru" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penghasilan Ibu</FormLabel>
                        <FormControl>
                          <Input placeholder="<2 juta/2-5 juta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Wali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Wali</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama wali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guardianNik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK Wali</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan NIK wali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guardianBirthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lahir Wali</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1975" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guardianEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pendidikan Wali</FormLabel>
                        <FormControl>
                          <Input placeholder="SD/SMP/SMA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guardianOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pekerjaan Wali</FormLabel>
                        <FormControl>
                          <Input placeholder="Wiraswasta/Pekerja" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guardianIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penghasilan Wali</FormLabel>
                        <FormControl>
                          <Input placeholder="<2 juta/2-5 juta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontak & Data Siswa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nomor telepon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Masukkan email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nomor mobile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="livesWith"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tinggal Dengan</FormLabel>
                        <FormControl>
                          <Input placeholder="Orang Tua/Wali" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Berat (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tinggi (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="160" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="distanceToSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jarak ke Sekolah (km)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="2.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transportationMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moda Transportasi</FormLabel>
                        <FormControl>
                          <Input placeholder="Jalan kaki/motor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="anakKe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anak Ke-</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jumlahSaudara"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Saudara</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prestasi</FormLabel>
                          <FormControl>
                            <Input placeholder="Deskripsikan prestasi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Link href="/admin/manajemen-akademik/peserta-didik">
            <Button type="button" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4 text-current" />
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4 text-current" />
            {isSubmitting ? "Menyimpan..." : initialData?.id ? "Perbarui Peserta" : "Buat Peserta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
