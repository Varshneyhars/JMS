import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  const log = await db.activityLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = JSON.parse(log.details ?? "{}");
  await db.activityLog.update({
    where: { id },
    data: { details: JSON.stringify({ ...current, status }) },
  });

  return NextResponse.json({ ok: true });
}
