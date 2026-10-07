import { NextRequest, NextResponse } from "next/server";
import { createProject, getProjects, isDbConfigured } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.name) {
    return NextResponse.json({ error: "Project name is required." }, { status: 400 });
  }
  const project = await createProject({
    name: String(body.name),
    status: String(body.status ?? "In Development"),
    progress: Number.isFinite(Number(body.progress)) ? Number(body.progress) : 0,
    engine: String(body.engine ?? ""),
    genre: String(body.genre ?? ""),
    platform: String(body.platform ?? ""),
    description: String(body.description ?? ""),
    color: String(body.color ?? "purple"),
    image: String(body.image ?? ""),
    link: String(body.link ?? ""),
  });
  return NextResponse.json({ project }, { status: 201 });
}
