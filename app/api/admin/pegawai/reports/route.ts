import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const now = new Date();
  const from = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = toParam ? new Date(toParam) : now;
  const reminderLimit = new Date();
  reminderLimit.setDate(reminderLimit.getDate() + 60);

  const [staffCount, attendances, pendingLeaves, expiringContracts, expiringDocuments] = await Promise.all([
    db.staff.count({ where: { deleted_at: null, isActive: true } }),
    db.staffAttendance.findMany({
      where: { date: { gte: from, lte: to } },
      include: { staff: { select: { id: true, name: true, nip: true } } },
      orderBy: [{ date: "desc" }, { staff: { name: "asc" } }],
      take: 1000,
    }),
    db.staffLeaveRequest.count({ where: { status: "PENDING" } }),
    db.staffContract.findMany({
      where: { status: { in: ["ACTIVE", "EXPIRING"] }, OR: [{ end_date: { lte: reminderLimit } }, { reminder_date: { lte: reminderLimit } }] },
      include: { staff: { select: { name: true, nip: true } } },
      orderBy: { end_date: "asc" },
      take: 50,
    }),
    db.staffDocument.findMany({
      where: { expires_at: { lte: reminderLimit } },
      include: { staff: { select: { name: true, nip: true } } },
      orderBy: { expires_at: "asc" },
      take: 50,
    }),
  ]);

  const byStatus = attendances.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    data: {
      metrics: {
        staffCount,
        attendanceCount: attendances.length,
        presentCount: byStatus.PRESENT ?? 0,
        lateCount: byStatus.LATE ?? 0,
        sickCount: byStatus.SICK ?? 0,
        permissionCount: byStatus.PERMISSION ?? 0,
        absentCount: byStatus.ABSENT ?? 0,
        leaveCount: byStatus.LEAVE ?? 0,
        pendingLeaves,
        expiringContractCount: expiringContracts.length,
        expiringDocumentCount: expiringDocuments.length,
      },
      attendances,
      expiringContracts,
      expiringDocuments,
    },
  });
}

