"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export type IntegrationProfileOption = {
  id: string;
  code: string;
  name: string;
};

const SAMPLE_STUDENTS = JSON.stringify(
  [
    {
      nik: "3201010101010001",
      nisn: "0012345678",
      fullName: "Ahmad Sekolix",
      phone: "081234567890",
      gender: "L",
      fatherName: "Budi",
      motherName: "Siti",
      rombelName: "VII A",
    },
  ],
  null,
  2
);

export function SeedIntegrationButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/admin/integrasi-data/profiles", { method: "POST" });
          router.refresh();
        })
      }
      disabled={isPending}
    >
      {isPending ? "Menyiapkan..." : "Sinkronkan Preset"}
    </Button>
  );
}

export function RunValidationButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/admin/integrasi-data/validations/run", { method: "POST" });
          router.refresh();
        })
      }
      disabled={isPending}
    >
      {isPending ? "Memindai..." : "Jalankan Validasi"}
    </Button>
  );
}

export function ImportPreviewForm({ profiles }: { profiles: IntegrationProfileOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [rows, setRows] = useState(SAMPLE_STUDENTS);
  const [message, setMessage] = useState("");

  return (
    <form
      className="space-y-3 rounded-lg border bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
        startTransition(async () => {
          try {
            const response = await fetch("/api/admin/integrasi-data/imports/preview", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                profileId,
                entity: "students",
                fileName: "manual-preview.json",
                rows: JSON.parse(rows),
              }),
            });
            const result = await response.json();
            if (!response.ok) {
              setMessage(result.error ?? "Preview gagal diproses");
              return;
            }
            setMessage(`Preview tersimpan: ${result.data.total_rows} baris, ${result.data.error_rows} error.`);
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Payload JSON tidak valid");
          }
        });
      }}
    >
      <div>
        <label className="text-sm font-medium" htmlFor="profileId">Profil integrasi</label>
        <select
          id="profileId"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={profileId}
          onChange={(event) => setProfileId(event.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rows">Data siswa JSON</label>
        <textarea
          id="rows"
          className="mt-1 min-h-52 w-full rounded-md border px-3 py-2 font-mono text-xs"
          value={rows}
          onChange={(event) => setRows(event.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || !profileId}>{isPending ? "Memproses..." : "Preview Import"}</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
}

export function CommitImportButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/admin/integrasi-data/imports/${id}/commit`, { method: "PATCH" });
          router.refresh();
        })
      }
      disabled={isPending}
    >
      Commit
    </Button>
  );
}

export function RollbackImportButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/admin/integrasi-data/imports/${id}/rollback`, { method: "PATCH" });
          router.refresh();
        })
      }
      disabled={isPending}
    >
      Rollback
    </Button>
  );
}
