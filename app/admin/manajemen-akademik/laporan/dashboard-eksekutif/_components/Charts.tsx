"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#2563eb", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

interface ChartProps {
  data: Array<{ name: string; value: number }>;
}

export function GenderDistributionChart({ data }: ChartProps) {
  if (data.every((d) => d.value === 0)) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Belum ada data siswa aktif
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface SiswaPerTahunChartProps {
  data: Array<{ label: string; count: number }>;
}

export function SiswaPerTahunChart({ data }: SiswaPerTahunChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Belum ada data tahun ajaran
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Siswa"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface TopStudentsChartProps {
  data: Array<{ id: string; nama: string; rombel: string; rataRata: number }>;
}

export function TopStudentsChart({ data }: TopStudentsChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Belum ada data nilai
      </p>
    );
  }
  const chartData = data.map((s) => ({
    name: s.nama.length > 20 ? s.nama.slice(0, 18) + "…" : s.nama,
    nilai: s.rataRata,
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
        <Tooltip />
        <Bar dataKey="nilai" fill="#2563eb" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
