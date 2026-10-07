import { NextRequest, NextResponse } from "next/server";
import { deleteProject, updateProject } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const input: Record<string, unknown> = {};
  for (const key of ["name", "status", "engine", "genre", "platform", "description", "color", "image", "link"]) {
    if (body[key] !== undefined) input[key] = String(body[key]);
  }
  if (body.progress !== undefined && Number.isFinite(Number(body.progress))) {
    input.progress = Number(body.progress);
  }
  const project = await updateProject(numId, input);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  await deleteProject(numId);
  return NextResponse.json({ ok: true });
}
