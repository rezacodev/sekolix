import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateAssetQrPayload } from "../../../src/lib/inventory/server";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function seedInventoryDemo() {
  console.log("Seeding inventory demo...");

  const user = await prisma.user.upsert({
    where: { email: "sarpras@sekolix.com" },
    update: { name: "Petugas Sarpras", role: "STAFF", isActive: true },
    create: {
      email: "sarpras@sekolix.com",
      name: "Petugas Sarpras",
      password: await bcrypt.hash("sarpras123", 10),
      role: "STAFF",
      isActive: true,
    },
  });

  let staff = await prisma.staff.findFirst({ where: { userId: user.id } });
  if (staff) {
    staff = await prisma.staff.update({
      where: { id: staff.id },
      data: {
        name: "Petugas Sarpras",
        role: "STAFF",
        position: "Petugas Sarpras",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Sarpras",
        isActive: true,
      },
    });
  } else {
    staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name: "Petugas Sarpras",
        role: "STAFF",
        nik: `SAR${user.id.slice(0, 13)}`,
        gender: "MALE",
        position: "Petugas Sarpras",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Sarpras",
        isActive: true,
      },
    });
  }

  const role = await prisma.accessRole.findUnique({ where: { slug: "SARPRAS" } });
  if (role) {
    await prisma.userAccessRole.upsert({
      where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
      update: { is_active: true, expires_at: null },
      create: {
        user_id: user.id,
        role_id: role.id,
        assigned_by: "system",
      },
    });
  }

  const electronics = await prisma.assetCategory.upsert({
    where: { code: "ELEKTRONIK" },
    update: { name: "Elektronik", is_active: true },
    create: { code: "ELEKTRONIK", name: "Elektronik", description: "Perangkat TIK dan elektronik pembelajaran." },
  });
  const furniture = await prisma.assetCategory.upsert({
    where: { code: "MEBEL" },
    update: { name: "Mebel", is_active: true },
    create: { code: "MEBEL", name: "Mebel", description: "Meja, kursi, lemari, dan perabot sekolah." },
  });

  const rooms = await prisma.room.findMany({ where: { deleted_at: null, is_active: true }, take: 3, orderBy: { name: "asc" } });
  const labRoom = rooms[0] ?? null;
  const classRoom = rooms[1] ?? rooms[0] ?? null;

  const labLocation = await prisma.assetLocation.upsert({
    where: { code: "LAB-TIK" },
    update: { name: "Laboratorium TIK", room_id: labRoom?.id ?? null, building: labRoom?.building ?? "Gedung Utama", is_active: true },
    create: {
      code: "LAB-TIK",
      name: "Laboratorium TIK",
      room_id: labRoom?.id ?? null,
      building: labRoom?.building ?? "Gedung Utama",
      floor: labRoom?.floor ?? "1",
      description: "Lokasi perangkat TIK pembelajaran.",
    },
  });
  const warehouseLocation = await prisma.assetLocation.upsert({
    where: { code: "GDG-SARPRAS" },
    update: { name: "Gudang Sarpras", is_active: true },
    create: {
      code: "GDG-SARPRAS",
      name: "Gudang Sarpras",
      building: "Gedung Administrasi",
      floor: "1",
      description: "Penyimpanan aset cadangan dan perawatan.",
    },
  });

  const assetInputs = [
    {
      asset_code: "AST-DEMO-001",
      name: "Proyektor Epson Lab TIK",
      category_id: electronics.id,
      location_id: labLocation.id,
      room_id: labRoom?.id ?? null,
      brand: "Epson",
      model: "EB-X500",
      serial_number: "EPS-DEMO-001",
      purchase_price: 6500000,
      condition: "GOOD",
      status: "ACTIVE",
    },
    {
      asset_code: "AST-DEMO-002",
      name: "Laptop Inventaris Guru",
      category_id: electronics.id,
      location_id: warehouseLocation.id,
      room_id: null,
      brand: "Lenovo",
      model: "ThinkPad Demo",
      serial_number: "LNV-DEMO-002",
      purchase_price: 9500000,
      condition: "FAIR",
      status: "ACTIVE",
    },
    {
      asset_code: "AST-DEMO-003",
      name: "Meja Belajar Kelas",
      category_id: furniture.id,
      location_id: warehouseLocation.id,
      room_id: classRoom?.id ?? null,
      brand: "Lokal",
      model: "Kayu",
      serial_number: "MBL-DEMO-003",
      purchase_price: 750000,
      condition: "DAMAGED",
      status: "MAINTENANCE",
    },
  ];

  for (const input of assetInputs) {
    const asset = await prisma.asset.upsert({
      where: { asset_code: input.asset_code },
      update: {
        ...input,
        responsible_staff_id: staff.id,
        qr_code: generateAssetQrPayload(input.asset_code),
        source: "Demo seed",
      },
      create: {
        ...input,
        responsible_staff_id: staff.id,
        qr_code: generateAssetQrPayload(input.asset_code),
        source: "Demo seed",
        purchase_date: new Date(),
        created_by: user.id,
      },
    });

    const conditionCount = await prisma.assetConditionHistory.count({ where: { asset_id: asset.id } });
    if (conditionCount === 0) {
      await prisma.assetConditionHistory.create({
        data: {
          asset_id: asset.id,
          condition: asset.condition,
          status: asset.status,
          checked_by: staff.id,
          description: "Kondisi awal dari seed demo.",
        },
      });
    }

    const locationCount = await prisma.assetLocationHistory.count({ where: { asset_id: asset.id } });
    if (locationCount === 0) {
      await prisma.assetLocationHistory.create({
        data: {
          asset_id: asset.id,
          to_location_id: asset.location_id,
          to_room_id: asset.room_id,
          moved_by: staff.id,
          reason: "Lokasi awal dari seed demo.",
        },
      });
    }
  }

  const maintenanceAsset = await prisma.asset.findUnique({ where: { asset_code: "AST-DEMO-003" } });
  if (maintenanceAsset) {
    const existingMaintenance = await prisma.assetMaintenance.findFirst({
      where: { asset_id: maintenanceAsset.id, status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    });
    if (!existingMaintenance) {
      await prisma.assetMaintenance.create({
        data: {
          asset_id: maintenanceAsset.id,
          technician_id: staff.id,
          title: "Perbaikan kaki meja",
          description: "Pengecekan dan penguatan sambungan meja.",
          scheduled_at: addDays(2),
          cost: 150000,
          status: "SCHEDULED",
        },
      });
    }
  }

  const loanAsset = await prisma.asset.findUnique({ where: { asset_code: "AST-DEMO-002" } });
  if (loanAsset && loanAsset.status === "ACTIVE") {
    const existingLoan = await prisma.assetLoan.findFirst({
      where: { asset_id: loanAsset.id, status: { in: ["REQUESTED", "APPROVED", "BORROWED"] } },
    });
    if (!existingLoan) {
      await prisma.assetLoan.create({
        data: {
          asset_id: loanAsset.id,
          room_id: classRoom?.id ?? null,
          borrower_name: "Guru Piket",
          borrower_type: "STAFF",
          requester_id: staff.id,
          approved_by: staff.id,
          purpose: "Kebutuhan presentasi kelas.",
          start_at: new Date(),
          due_at: addDays(3),
          status: "BORROWED",
          condition_out: loanAsset.condition,
        },
      });
      await prisma.asset.update({ where: { id: loanAsset.id }, data: { status: "BORROWED" } });
    }
  }

  console.log("Inventory demo seeded");
}

