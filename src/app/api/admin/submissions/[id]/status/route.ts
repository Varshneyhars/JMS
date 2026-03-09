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
  const { status, note, journalId } = await req.json();

  const submission = await db.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate status transition
  const allowedTransitions: Record<string, string[]> = {
    DRAFT:              ["SUBMITTED"],
    SUBMITTED:          ["DESK_REVIEW", "DESK_REJECTED", "WITHDRAWN"],
    DESK_REVIEW:        ["PEER_REVIEW", "DESK_REJECTED", "REVISION_REQUESTED", "WITHDRAWN"],
    PEER_REVIEW:        ["REVISION_REQUESTED", "ACCEPTED", "REJECTED", "WITHDRAWN"],
    REVISION_SUBMITTED: ["PEER_REVIEW", "REVISION_REQUESTED", "ACCEPTED", "REJECTED"],
    REVISION_REQUESTED: ["WITHDRAWN"],
    ACCEPTED:           ["IN_COPYEDITING", "PUBLISHED"],
    IN_COPYEDITING:     ["PUBLISHED"],
  };

  const allowed = allowedTransitions[submission.status];
  if (!allowed || !allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${submission.status} to ${status}` },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { status };
  if (journalId) updates.journalId = journalId;

  // Set timestamps based on new status
  if (status === "SUBMITTED" && !submission.submittedAt) updates.submittedAt = new Date();
  if (status === "DESK_REVIEW" && !submission.deskReviewedAt) updates.deskReviewedAt = new Date();
  if (status === "PEER_REVIEW" && !submission.reviewStartedAt) updates.reviewStartedAt = new Date();
  if (["ACCEPTED", "REJECTED", "DESK_REJECTED"].includes(status)) updates.decisionAt = new Date();
  if (status === "PUBLISHED") updates.publishedAt = new Date();

  await db.$transaction([
    db.submission.update({ where: { id }, data: updates }),
    db.statusHistory.create({
      data: {
        submissionId: id,
        fromStatus: submission.status as never,
        toStatus: status,
        note,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
