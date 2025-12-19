import SiswaDiterimaActions from "./siswa-diterima/SiswaDiterimaActions";

export default async function PenerimaanIndex() {
  return (
    <div className="p-6">
      {/* Client component for accepted students */}
      <SiswaDiterimaActions />
    </div>
  );
}
