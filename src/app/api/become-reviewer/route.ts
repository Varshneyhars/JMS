import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, institution, expertise, bio, motivation, publications } = body;

  if (!name || !email || !expertise) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  await db.activityLog.create({
    data: {
      action: "REVIEWER_APPLICATION",
      details: JSON.stringify({ name, email, institution, expertise, bio, motivation, publications, status: "PENDING" }),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await db.activityLog.findMany({
    where: { action: "REVIEWER_APPLICATION" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    applications.map((a) => {
      try {
        return { id: a.id, createdAt: a.createdAt, ...JSON.parse(a.details ?? "{}") };
      } catch {
        return { id: a.id, createdAt: a.createdAt, status: "PENDING" };
      }
    })
  );
}
