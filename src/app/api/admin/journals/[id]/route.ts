import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const { name, description, scope, issnPrint, issnOnline, reviewType, reviewerCount, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description || null;
  if (scope !== undefined) data.scope = scope || null;
  if (issnPrint !== undefined) data.issnPrint = issnPrint || null;
  if (issnOnline !== undefined) data.issnOnline = issnOnline || null;
  if (reviewType !== undefined) data.reviewType = reviewType;
  if (reviewerCount !== undefined) data.reviewerCount = parseInt(reviewerCount);
  if (isActive !== undefined) data.isActive = isActive;

  const journal = await db.journal.update({ where: { id }, data });
  return NextResponse.json({ id: journal.id });
}
