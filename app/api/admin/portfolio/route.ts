import { NextRequest, NextResponse } from "next/server";
import { createPortfolioItem, getPortfolioItems, isDbConfigured } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const items = await getPortfolioItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const item = await createPortfolioItem({
    title: String(body.title),
    category: String(body.category ?? ""),
    status: String(body.status ?? "Published"),
    image: String(body.image ?? ""),
    description: String(body.description ?? ""),
    link: String(body.link ?? ""),
  });
  return NextResponse.json({ item }, { status: 201 });
}
