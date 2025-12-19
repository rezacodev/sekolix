export function formatRupiah(value?: number | null) {
  const val = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
}

export const formatCurrency = formatRupiah;
