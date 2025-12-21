"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils/string";
import { formatRupiah } from "@/lib/utils/currency";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui";

interface Year {
	id: string;
	name: string;
	start: string; // ISO date yyyy-mm-dd
	end: string; // ISO date
	isActive: boolean;
	registrationFee: number;
}

interface TahunAjaranRow {
	id: string;
	label: string;
	startDate?: string | null;
	endDate?: string | null;
	isActive?: boolean | null;
	registrationFee?: number | null;
}

export function YearsSettingsClient({ initialYears, showRegistrationFee = true, hideTitle = false }: { initialYears: Year[]; showRegistrationFee?: boolean; hideTitle?: boolean }) {
	const [years, setYears] = useState<Year[]>(initialYears);
	const [isLoading, setIsLoading] = useState(false);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState("");

	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Year | null>(null);
	const [name, setName] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [registrationFee, setRegistrationFee] = useState<number>(0);

	const mapRow = useCallback((y: TahunAjaranRow): Year => ({
		id: y.id,
		name: y.label,
		start: y.startDate ? new Date(y.startDate).toISOString().split("T")[0] : "",
		end: y.endDate ? new Date(y.endDate).toISOString().split("T")[0] : "",
		isActive: !!y.isActive,
		registrationFee: typeof y.registrationFee === "number" ? y.registrationFee : Number(y.registrationFee) || 0,
	}), []);

	const refreshYears = useCallback(async (p = pageIndex, ps = pageSize, s = search) => {
		setIsLoading(true);
		const url = new URL("/api/admin/penerimaan-siswa/settings/years", window.location.origin);
		url.searchParams.set("page", String(p));
		url.searchParams.set("pageSize", String(ps));
		if (s) url.searchParams.set("search", s);
		try {
			const res = await fetch(url.toString());
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) {
					setYears(data.map((d: TahunAjaranRow) => mapRow(d)));
					setTotalCount(undefined);
				} else {
					setYears((data.items || []).map((d: TahunAjaranRow) => mapRow(d)));
					setTotalCount(typeof data.totalCount === "number" ? data.totalCount : undefined);
					setPageIndex(typeof data.page === "number" ? data.page : p);
					setPageSize(typeof data.pageSize === "number" ? data.pageSize : ps);
				}
			}
		} finally {
			setIsLoading(false);
		}
	}, [mapRow, pageIndex, pageSize, search]);

	const openAdd = useCallback(() => {
		setEditing(null);
		setName("");
		setStart("");
		setEnd("");
		setRegistrationFee(0);
		setOpen(true);
	}, []);

	const openEdit = useCallback((y: Year) => {
		setEditing(y);
		setName(y.name);
		setStart(y.start);
		setEnd(y.end);
		setRegistrationFee(y.registrationFee ?? 0);
		setOpen(true);
	}, []);

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();
			if (!name.trim()) return toast.error("Nama tahun ajaran wajib diisi.");
			setIsLoading(true);
			try {
				const method = editing ? "PATCH" : "POST";
				const body: Record<string, unknown> = { name, start: start || null, end: end || null, registrationFee };
				if (editing) body.yearId = editing.id;
				const res = await fetch("/api/admin/penerimaan-siswa/settings/years", {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});
				if (res.ok) {
					toast.success(editing ? "Tahun ajaran diperbarui" : "Tahun ajaran berhasil ditambahkan");
					setOpen(false);
					await refreshYears();
				} else {
					const data = await res.json();
					toast.error(data.message || "Gagal menyimpan tahun ajaran");
				}
			} catch (err) {
				console.error(err);
				toast.error("Terjadi kesalahan saat menyimpan tahun ajaran");
			} finally {
				setIsLoading(false);
			}
		},
		[editing, name, start, end, registrationFee, refreshYears]
	);

	const handleToggleYear = useCallback(
		async (yearId: string, currentStatus: boolean) => {
			setTogglingId(yearId);
			try {
				const res = await fetch("/api/admin/penerimaan-siswa/settings/years", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ yearId, action: currentStatus ? "deactivate" : "activate" }),
				});
				if (res.ok) {
					const data = await res.json();
					toast.success(data.message);
					await refreshYears();
				} else {
					const data = await res.json();
					toast.error(data.message || "Gagal mengubah status tahun ajaran");
				}
			} catch (err) {
				console.error(err);
				toast.error("Terjadi kesalahan saat mengubah status tahun ajaran");
			} finally {
				setTogglingId(null);
			}
		},
		[refreshYears]
	);

	const columns = useMemo(() => {
		const cols: ColumnDef<Year>[] = [
			{ accessorKey: "name", header: "Nama" },
			{
				accessorKey: "start",
				header: "Mulai",
				cell: ({ row }: { row: { original: Year } }) => <span>{row.original.start ? formatDate(row.original.start) : "—"}</span>,
			},
			{
				accessorKey: "end",
				header: "Selesai",
				cell: ({ row }: { row: { original: Year } }) => <span>{row.original.end ? formatDate(row.original.end) : "—"}</span>,
			},
		];

		if (showRegistrationFee) {
			cols.push({
				accessorKey: "registrationFee",
				header: "Biaya Pendaftaran",
				cell: ({ row }: { row: { original: Year } }) => (
					<span>{row.original.registrationFee === 0 ? "Gratis" : formatRupiah(row.original.registrationFee || 0)}</span>
				),
			});
		}

		cols.push({
			accessorKey: "isActive",
			header: "Status",
			cell: ({ row }: { row: { original: Year } }) => (
				<span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.original.isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
					{row.original.isActive ? "Aktif" : "Tidak aktif"}
				</span>
			),
		});

		cols.push({
			id: "actions",
			header: "Aksi",
			cell: ({ row }: { row: { original: Year } }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm">•••</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onSelect={() => openEdit(row.original)}>Edit</DropdownMenuItem>
						<DropdownMenuItem disabled={togglingId === row.original.id} onSelect={() => handleToggleYear(row.original.id, row.original.isActive)}>
							{row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		});

		return cols;
	}, [openEdit, handleToggleYear, togglingId, showRegistrationFee]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				{!hideTitle && (
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Tahun Ajaran</h2>
						<p className="text-muted-foreground">Kelola tahun ajaran yang tersedia untuk pendaftaran.</p>
					</div>
				)}
				<div className="flex items-center gap-2">
					<Button onClick={openAdd}>Tambah Tahun</Button>
				</div>
			</div>

			<div>
				<DataTable
					columns={columns}
					data={years}
					serverSide
					totalCount={totalCount}
					pageIndex={pageIndex}
					pageSize={pageSize}
					onPageChange={(p) => { setPageIndex(p); void refreshYears(p, pageSize, search); }}
					onPageSizeChange={(ps) => { setPageSize(ps); void refreshYears(0, ps, search); }}
					onSearchChange={(s) => { setSearch(s); setPageIndex(0); void refreshYears(0, pageSize, s); }}
				/>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<span />
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editing ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</DialogTitle>
						<DialogDescription>{editing ? "Perbarui detail tahun ajaran." : "Tambahkan tahun ajaran baru."}</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<label className="block text-sm font-semibold text-foreground">
							Nama
							<Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" required />
						</label>
						<label className="block text-sm font-semibold text-foreground">
							Mulai (tanggal)
							<Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-2" />
						</label>
						<label className="block text-sm font-semibold text-foreground">
							Selesai (tanggal)
							<Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2" />
						</label>
						<div className="grid gap-2 sm:grid-cols-2">
							<label className="block text-sm font-semibold text-foreground">
								Biaya Pendaftaran
								<Input type="number" value={registrationFee} onChange={(e) => setRegistrationFee(Number(e.target.value || 0))} className="mt-2" disabled={registrationFee === 0 && registrationFee !== undefined && registrationFee !== null && registrationFee === 0 && false} />
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={registrationFee === 0}
									onChange={(e) => setRegistrationFee(e.target.checked ? 0 : registrationFee ?? 0)}
								/>
								<span className="text-sm">Gratis (tidak ada biaya pendaftaran)</span>
							</label>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
