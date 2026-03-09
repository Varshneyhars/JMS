import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, institution: true, bio: true, orcid: true, expertise: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, institution, bio, orcid } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const user = await db.user.update({
    where: { id: session.user.id },
    data: { name: name.trim(), institution: institution || null, bio: bio || null, orcid: orcid || null },
  });
  return NextResponse.json({ id: user.id });
}
