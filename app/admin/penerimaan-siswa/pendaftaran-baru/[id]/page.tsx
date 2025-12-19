import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ApplicantStatusForm } from "@/components/admin/applicant/ApplicantStatusForm";
import { ClientBreadcrumb } from "../../../ClientBreadcrumb";
import { formatRupiah } from "@/lib/utils/currency";

export default async function ApplicantDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const applicant = await db.applicant.findUnique({
    where: { id },
    include: {
      program: true,
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
      validations: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!applicant) {
    return notFound();
  }

  return (
    <>
      <ClientBreadcrumb 
        breadcrumbs={[
          { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" },
          { label: "Pendaftaran Baru", href: "/admin/penerimaan-siswa/pendaftaran-baru" },
          { label: applicant.fullName || "Detail Pendaftar" },
        ]}
      />
      <div className="space-y-8 p-6">
        {/* Nama & Identitas */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{applicant.fullName || "-"}</h1>
          <p className="text-muted-foreground">Detail informasi pendaftar.</p>
        </div>

        {/* top summary removed — now shown in right column */}

        {/* Data Lengkap */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Completion Status */}
          <section className="rounded-3xl border border-card bg-card p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-6">Data Profil Lengkap</h3>
            <div className="space-y-4">
              <div className="rounded-2xl border border-card bg-muted px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Status Kelengkapan</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    (applicant as Record<string, unknown>).profileCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}>
                    {(applicant as Record<string, unknown>).profileCompleted ? "Lengkap" : "Belum Lengkap"}
                  </span>
                </div>
              </div>

              {/* Data Pribadi */}
              {(Boolean(applicant.address) || Boolean(applicant.nationality) || Boolean(applicant.religion) || Boolean((applicant as Record<string, unknown>).motherTongue) || Boolean((applicant as Record<string, unknown>).village) || Boolean((applicant as Record<string, unknown>).district) || Boolean((applicant as Record<string, unknown>).city) || Boolean((applicant as Record<string, unknown>).province) || Boolean(applicant.email) || Boolean(applicant.schoolOrigin) || Boolean(applicant.gender) || Boolean(applicant.dateOfBirth) || Boolean(applicant.placeOfBirth) || Boolean(applicant.nisn) || Boolean(applicant.noKK)) ? (
                <div className="rounded-2xl border border-card p-4 bg-card">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Data Pribadi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {applicant.email ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="text-foreground font-medium">{applicant.email}</div>
                      </div>
                    ) : null}
                    {applicant.schoolOrigin ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Asal Sekolah</div>
                        <div className="text-foreground font-medium">{applicant.schoolOrigin}</div>
                      </div>
                    ) : null}
                    {applicant.gender ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Jenis Kelamin</div>
                        <div className="text-foreground font-medium">{String(applicant.gender).charAt(0).toUpperCase() + String(applicant.gender).slice(1)}</div>
                      </div>
                    ) : null}
                    {applicant.dateOfBirth ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Tanggal Lahir</div>
                        <div className="text-foreground font-medium">{applicant.dateOfBirth.toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                      </div>
                    ) : null}
                    {applicant.placeOfBirth ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Tempat Lahir</div>
                        <div className="text-foreground font-medium">{applicant.placeOfBirth}</div>
                      </div>
                    ) : null}
                    {applicant.nisn ? (
                      <div>
                        <div className="text-xs text-muted-foreground">NISN</div>
                        <div className="text-foreground font-medium">{applicant.nisn}</div>
                      </div>
                    ) : null}
                    {applicant.nik ? (
                      <div>
                        <div className="text-xs text-muted-foreground">NIK</div>
                        <div className="text-foreground font-medium">{applicant.nik}</div>
                      </div>
                    ) : null}
                    {applicant.noKK ? (
                      <div>
                        <div className="text-xs text-muted-foreground">No. KK</div>
                        <div className="text-foreground font-medium">{applicant.noKK}</div>
                      </div>
                    ) : null}
                    {applicant.address ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Alamat</div>
                        <div className="text-foreground font-medium">{applicant.address}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).village ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Desa/Kel</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).village)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).district ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Kecamatan</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).district)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).city ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Kota</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).city)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).province ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Provinsi</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).province)}</div>
                      </div>
                    ) : null}
                    {applicant.nationality ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Kewarganegaraan</div>
                        <div className="text-foreground font-medium">{applicant.nationality}</div>
                      </div>
                    ) : null}
                    {applicant.religion ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Agama</div>
                        <div className="text-foreground font-medium">{applicant.religion}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).motherTongue ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Bahasa Ibu</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherTongue)}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Data Orang Tua */}
              {(Boolean((applicant as Record<string, unknown>).fatherName) || Boolean((applicant as Record<string, unknown>).motherName) || Boolean((applicant as Record<string, unknown>).fatherOccupation) || Boolean((applicant as Record<string, unknown>).motherOccupation) || Boolean((applicant as Record<string, unknown>).fatherNik) || Boolean((applicant as Record<string, unknown>).motherNik)) ? (
                <div className="rounded-2xl border border-card p-4 bg-card">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Data Orang Tua</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Ayah</h5>
                      <div className="space-y-2 text-sm">
                        {(applicant as Record<string, unknown>).fatherName ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Nama</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).fatherName)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).fatherNik ? (
                          <div>
                            <div className="text-xs text-muted-foreground">NIK</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).fatherNik)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).fatherOccupation ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Pekerjaan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).fatherOccupation)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).fatherEducation ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Pendidikan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).fatherEducation)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).fatherIncome ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Penghasilan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).fatherIncome)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Ibu</h5>
                      <div className="space-y-2 text-sm">
                        {(applicant as Record<string, unknown>).motherName ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Nama</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherName)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).motherNik ? (
                          <div>
                            <div className="text-xs text-muted-foreground">NIK</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherNik)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).motherOccupation ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Pekerjaan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherOccupation)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).motherEducation ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Pendidikan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherEducation)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).motherIncome ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Penghasilan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).motherIncome)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {(applicant as Record<string, unknown>).guardianName ? (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Wali</h5>
                      <div className="space-y-2 text-sm">
                        {(applicant as Record<string, unknown>).guardianName ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Nama</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).guardianName)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).guardianNik ? (
                          <div>
                            <div className="text-xs text-muted-foreground">NIK</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).guardianNik)}</div>
                          </div>
                        ) : null}
                        {(applicant as Record<string, unknown>).guardianOccupation ? (
                          <div>
                            <div className="text-xs text-muted-foreground">Pekerjaan</div>
                            <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).guardianOccupation)}</div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Kontak Lengkap */}
              {(Boolean((applicant as Record<string, unknown>).mobile) || Boolean(applicant.phone) || Boolean(applicant.email)) ? (
                <div className="rounded-2xl border border-card p-4 bg-card">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Kontak Lengkap</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {(applicant as Record<string, unknown>).mobile ? (
                      <div>
                        <div className="text-xs text-muted-foreground">HP</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).mobile)}</div>
                      </div>
                    ) : null}
                    {applicant.phone ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Telepon</div>
                        <div className="text-foreground font-medium">{applicant.phone}</div>
                      </div>
                    ) : null}
                    {applicant.email ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Email</div>
                        <div className="text-foreground font-medium">{applicant.email}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Data Rincian */}
              {(Boolean((applicant as Record<string, unknown>).weight) || Boolean((applicant as Record<string, unknown>).height) || Boolean((applicant as Record<string, unknown>).livesWith) || Boolean((applicant as Record<string, unknown>).transportationMode) || Boolean((applicant as Record<string, unknown>).anakKe) || Boolean((applicant as Record<string, unknown>).jumlahSaudara) || Boolean((applicant as Record<string, unknown>).distanceToSchool)) ? (
                <div className="rounded-2xl border border-card p-4 bg-card">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Data Rincian</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {(applicant as Record<string, unknown>).weight ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Berat Badan</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).weight)} kg</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).height ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Tinggi Badan</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).height)} cm</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).livesWith ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Tinggal Bersama</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).livesWith)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).transportationMode ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Moda Transportasi</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).transportationMode)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).anakKe ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Anak ke-</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).anakKe)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).jumlahSaudara ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Jumlah Saudara</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).jumlahSaudara)}</div>
                      </div>
                    ) : null}
                    {(applicant as Record<string, unknown>).distanceToSchool ? (
                      <div>
                        <div className="text-xs text-muted-foreground">Jarak ke Sekolah</div>
                        <div className="text-foreground font-medium">{String((applicant as Record<string, unknown>).distanceToSchool)} km</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Prestasi */}
              {(applicant as Record<string, unknown>).achievements ? (
                <div className="rounded-2xl border border-card p-4 bg-card">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Prestasi</h4>
                  <p className="text-sm text-muted-foreground">{String((applicant as Record<string, unknown>).achievements)}</p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Right column: status + separate payments card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Applicant summary card moved to right column above validation notes */}
            <section className="rounded-3xl border border-card bg-card p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-card p-3">
                  <div className="text-xs text-muted-foreground">Program</div>
                  <div className="mt-1 font-semibold text-foreground">{applicant.program?.name ?? applicant.programChoice ?? '-'}</div>
                </div>
                <div className="rounded-xl border border-card p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold ${
                    applicant.status === 'accepted' ? 'bg-success text-success-foreground' : 'bg-accent text-accent-foreground'
                  }`}>{String(applicant.status ?? '').toUpperCase() || '-'}</div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-card bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-6">Catatan validasi</h2>
              <ApplicantStatusForm
                applicantId={applicant.id}
                initialStatus={applicant.status}
                initialHandledBy={applicant.handledBy}
                initialNotes={applicant.notes}
              />

              {/* 'Validasi terakhir' removed — validation history now accessed via 'Siswa Diterima' page. */}
            </section>

            {/* Pembayaran terakhir (dipindahkan ke card tersendiri di kanan) */}
            <section className="rounded-3xl border border-card bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-foreground">Pembayaran terakhir</h3>
                <Link href="/admin/penerimaan-siswa/pembayaran" className="text-sm font-medium text-success hover:text-success-foreground">Lihat semua</Link>
              </div>
              {applicant.payments.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Belum ada pembayaran.</p>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {applicant.payments.map((payment) => (
                    <div key={payment.id} className="rounded-xl border border-card bg-card px-4 py-3">
                      <p className="font-semibold text-foreground">{formatRupiah(payment.amount)}</p>
                      <p className="text-muted-foreground">Status: <span className="text-foreground">{payment.status}</span></p>
                      <p className="text-muted-foreground">Metode: <span className="text-foreground">{payment.method}</span></p>
                      <p className="text-xs text-muted-foreground">{payment.createdAt.toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
        {/* Pembayaran & Validasi (moved under Catatan validasi) */}
        {/* These are now rendered inside the right column below the validation notes for compact layout. */}
      </div>
    </>
  );
}
