import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateInvoiceNumber, getInvoiceStatus, toMoneyNumber } from "@/lib/finance/server";

const generateInvoiceSchema = z.object({
  billingTypeId: z.string().min(1),
  academicYearId: z.string().optional().nullable(),
  rombelId: z.coerce.number().int().positive().optional().nullable(),
  studentIds: z.array(z.string().min(1)).optional(),
  periodMonth: z.coerce.number().int().min(1).max(12).optional().nullable(),
  periodYear: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  dueDate: z.coerce.date(),
  discountAmount: z.coerce.number().min(0).default(0),
  lateFeeAmount: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(1000).optional().nullable(),
});

function serializeInvoice(invoice: Awaited<ReturnType<typeof db.studentInvoice.findMany>>[number]) {
  return {
    ...invoice,
    rombel_id: invoice.rombel_id ? Number(invoice.rombel_id) : null,
    subtotal: invoice.subtotal.toNumber(),
    discount_amount: invoice.discount_amount.toNumber(),
    late_fee_amount: invoice.late_fee_amount.toNumber(),
    total_amount: invoice.total_amount.toNumber(),
    paid_amount: invoice.paid_amount.toNumber(),
  };
}

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "keuangan");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const rombelId = searchParams.get("rombelId");
  const billingTypeId = searchParams.get("billingTypeId");
  const academicYearId = searchParams.get("academicYearId");
  const search = searchParams.get("search")?.trim();

  const invoices = await db.studentInvoice.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(billingTypeId ? { billing_type_id: billingTypeId } : {}),
      ...(academicYearId ? { academic_year_id: academicYearId } : {}),
      ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
      ...(search
        ? {
            OR: [
              { invoice_number: { contains: search, mode: "insensitive" } },
              { student: { fullName: { contains: search, mode: "insensitive" } } },
              { student: { nisn: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      billingType: { select: { id: true, code: true, name: true } },
      academicYear: { select: { id: true, label: true } },
      rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
      payments: { orderBy: { paid_at: "desc" }, take: 3 },
      parentProofs: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: [{ due_date: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ data: invoices.map(serializeInvoice) });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "keuangan");
  if (!access.ok) return access.response;

  const parsed = generateInvoiceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const billingType = await db.financialBillingType.findUnique({ where: { id: data.billingTypeId } });
  if (!billingType || !billingType.is_active) {
    return NextResponse.json({ error: "Jenis tagihan tidak aktif atau tidak ditemukan" }, { status: 404 });
  }

  const studentWhere =
    data.studentIds?.length
      ? { id: { in: data.studentIds }, deleted_at: null }
      : data.rombelId
        ? { rombels: { some: { id: BigInt(data.rombelId) } }, deleted_at: null }
        : { deleted_at: null };

  const students = await db.pesertaDidik.findMany({
    where: studentWhere,
    include: { rombels: { orderBy: { created_at: "desc" }, take: 1 }, parentLinks: true },
    take: 1000,
  });

  if (students.length === 0) {
    return NextResponse.json({ error: "Tidak ada siswa yang cocok untuk generate tagihan" }, { status: 400 });
  }

  const subtotal = toMoneyNumber(billingType.amount);
  const totalAmount = Math.max(0, subtotal - data.discountAmount + data.lateFeeAmount);
  const createdInvoices = [];
  const skipped: string[] = [];

  for (const student of students) {
    const existing = await db.studentInvoice.findFirst({
      where: {
        student_id: student.id,
        billing_type_id: billingType.id,
        academic_year_id: data.academicYearId ?? null,
        period_month: data.periodMonth ?? null,
        period_year: data.periodYear ?? null,
        status: { not: "CANCELLED" },
      },
      select: { id: true },
    });

    if (existing) {
      skipped.push(student.id);
      continue;
    }

    const rombelId = data.rombelId ? BigInt(data.rombelId) : student.rombels[0]?.id ?? null;
    const invoice = await db.studentInvoice.create({
      data: {
        invoice_number: generateInvoiceNumber(),
        student_id: student.id,
        billing_type_id: billingType.id,
        academic_year_id: data.academicYearId ?? null,
        rombel_id: rombelId,
        period_month: data.periodMonth ?? null,
        period_year: data.periodYear ?? null,
        due_date: data.dueDate,
        subtotal,
        discount_amount: data.discountAmount,
        late_fee_amount: data.lateFeeAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        status: getInvoiceStatus(totalAmount, 0),
        notes: data.notes ?? null,
        created_by: access.context.user.id,
      },
    });

    if (data.discountAmount > 0) {
      await db.studentInvoiceDiscount.create({
        data: {
          invoice_id: invoice.id,
          name: "Diskon generate tagihan",
          amount: data.discountAmount,
          reason: data.notes ?? null,
          created_by: access.context.user.id,
        },
      });
    }

    if (data.lateFeeAmount > 0) {
      await db.studentInvoiceLateFee.create({
        data: {
          invoice_id: invoice.id,
          name: "Denda generate tagihan",
          amount: data.lateFeeAmount,
          reason: data.notes ?? null,
          created_by: access.context.user.id,
        },
      });
    }

    if (student.parentLinks.length > 0) {
      await db.parentNotification.createMany({
        data: student.parentLinks.map((link) => ({
          parent_id: link.parent_id,
          student_id: student.id,
          type: "BILLING",
          title: `Tagihan ${billingType.name}`,
          message: `Tagihan ${billingType.name} sebesar Rp${totalAmount.toLocaleString("id-ID")} telah diterbitkan.`,
          href: "/parent/tagihan",
        })),
      });
    }

    createdInvoices.push(invoice);
  }

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "generate_invoices",
    entityType: "StudentInvoice",
    metadata: {
      billingTypeId: billingType.id,
      created: createdInvoices.length,
      skipped: skipped.length,
      rombelId: data.rombelId ?? null,
    },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentInvoice",
    entityId: "bulk-generate",
    action: "create",
    after: { createdInvoices, skipped },
    metadata: { billingTypeId: billingType.id },
  });

  return NextResponse.json({
    data: {
      created: createdInvoices.length,
      skipped: skipped.length,
    },
  }, { status: 201 });
}
