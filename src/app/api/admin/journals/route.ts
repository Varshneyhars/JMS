import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, scope, issnPrint, issnOnline, reviewType, reviewerCount } = await req.json();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const journal = await db.journal.create({
    data: {
      name,
      description: description || null,
      scope: scope || null,
      issnPrint: issnPrint || null,
      issnOnline: issnOnline || null,
      reviewType: reviewType ?? "DOUBLE_BLIND",
      reviewerCount: reviewerCount ?? 2,
    },
  });

  return NextResponse.json({ id: journal.id });
}
