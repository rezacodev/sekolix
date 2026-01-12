"use client";

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "1,234", label: "Siswa Aktif" },
  { value: "87", label: "Tenaga Pendidik" },
  { value: "5", label: "Jurusan" },
  { value: "95%", label: "Tingkat Kelulusan" }
];

export function Stats() {
  return (
    <section className="py-16 bg-white -mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card bg-white border border-gray-200 rounded-lg p-8 text-center shadow-md"
            >
              <div className="text-4xl font-bold text-blue-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
