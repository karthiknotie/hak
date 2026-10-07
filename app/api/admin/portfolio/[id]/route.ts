import { NextRequest, NextResponse } from "next/server";
import { deletePortfolioItem, updatePortfolioItem } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const input: Record<string, unknown> = {};
  for (const key of ["title", "category", "status", "image", "description", "link"]) {
    if (body[key] !== undefined) input[key] = String(body[key]);
  }
  const item = await updatePortfolioItem(numId, input);
  if (!item) {
    return NextResponse.json({ error: "Portfolio item not found." }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  await deletePortfolioItem(numId);
  return NextResponse.json({ ok: true });
}
