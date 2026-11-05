import { NextResponse } from "next/server";
import { requireParentContext, serializeParentStudent, parentUnauthorized } from "@/lib/parent/server";

export async function GET() {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  return NextResponse.json({
    parent: {
      id: context.profile.id,
      name: context.profile.name,
      email: context.profile.email,
      phone: context.profile.phone,
    },
    children: context.profile.students.map(serializeParentStudent),
  });
}
