import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { TemplateForm } from "../_components/OfficeForms";

export default async function LetterTemplatePage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const templates = await db.letterTemplate.findMany({ include: { _count: { select: { generatedLetters: true } } }, orderBy: { name: "asc" } });
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Template Surat</h1></div><TemplateForm /><div className="grid gap-3 md:grid-cols-3">{templates.map((item) => <div key={item.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.code} - {item.audience} - {item._count.generatedLetters} generate</p><p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.body}</p></div>)}</div></div>;
}

