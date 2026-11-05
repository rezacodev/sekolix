import { NextResponse } from "next/server";
import { z } from "zod";

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { error: message } : { error: message, details },
    { status: 400 }
  );
}

export function parseBigInt(value: string | null | undefined, field = "id") {
  if (!value || !/^\d+$/.test(value)) {
    return {
      ok: false as const,
      response: badRequest(`${field} tidak valid`),
    };
  }

  return {
    ok: true as const,
    value: BigInt(value),
  };
}

export function parseInteger(
  value: string | null | undefined,
  options: { field?: string; defaultValue?: number; min?: number; max?: number } = {}
) {
  const field = options.field ?? "number";
  if (value === null || value === undefined || value === "") {
    if (options.defaultValue !== undefined) return { ok: true as const, value: options.defaultValue };
    return { ok: false as const, response: badRequest(`${field} wajib diisi`) };
  }

  if (!/^-?\d+$/.test(value)) {
    return { ok: false as const, response: badRequest(`${field} tidak valid`) };
  }

  const parsed = Number(value);
  if (options.min !== undefined && parsed < options.min) {
    return { ok: false as const, response: badRequest(`${field} minimal ${options.min}`) };
  }
  if (options.max !== undefined && parsed > options.max) {
    return { ok: false as const, response: badRequest(`${field} maksimal ${options.max}`) };
  }

  return { ok: true as const, value: parsed };
}

export function parsePagination(searchParams: URLSearchParams, defaults = { page: 0, pageSize: 10, maxPageSize: 100 }) {
  const page = parseInteger(searchParams.get("page"), {
    field: "page",
    defaultValue: defaults.page,
    min: 0,
  });
  if (!page.ok) return page;

  const pageSize = parseInteger(searchParams.get("pageSize"), {
    field: "pageSize",
    defaultValue: defaults.pageSize,
    min: 1,
    max: defaults.maxPageSize,
  });
  if (!pageSize.ok) return pageSize;

  return {
    ok: true as const,
    value: {
      page: page.value,
      pageSize: pageSize.value,
      skip: page.value * pageSize.value,
      take: pageSize.value,
    },
  };
}

export async function parseJsonBody<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false as const, response: badRequest("JSON body tidak valid") };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false as const,
      response: badRequest("Validation failed", parsed.error.issues),
    };
  }

  return { ok: true as const, data: parsed.data as z.infer<T> };
}
