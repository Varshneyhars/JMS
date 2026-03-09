import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, reason, conflictOfInterest } = await req.json();

  // Validate status enum
  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "status must be ACCEPTED or DECLINED" }, { status: 400 });
  }

  const invitation = await db.reviewInvitation.findUnique({
    where: { id, reviewerId: session.user.id },
  });

  if (!invitation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Already responded" }, { status: 400 });
  }

  await db.reviewInvitation.update({
    where: { id },
    data: {
      status,
      respondedAt: new Date(),
      declinedReason: status === "DECLINED" ? reason : null,
      conflictOfInterest: status === "ACCEPTED" && conflictOfInterest != null
        ? String(conflictOfInterest)
        : undefined,
    },
  });

  // If accepted, create an empty review record
  if (status === "ACCEPTED") {
    await db.review.create({
      data: { invitationId: id },
    });
  }

  return NextResponse.json({ success: true });
}
