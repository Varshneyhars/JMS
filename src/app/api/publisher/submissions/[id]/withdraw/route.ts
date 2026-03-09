import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const submission = await db.submission.findUnique({
    where: { id, publisherId: session.user.id },
    select: { id: true, status: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Can only withdraw before peer review decisions are made
  const withdrawableStatuses = ["SUBMITTED", "DESK_REVIEW", "PEER_REVIEW", "REVISION_REQUESTED"];
  if (!withdrawableStatuses.includes(submission.status)) {
    return NextResponse.json(
      { error: "This submission cannot be withdrawn at its current stage" },
      { status: 400 }
    );
  }

  await db.$transaction([
    db.submission.update({ where: { id }, data: { status: "WITHDRAWN" } }),
    db.statusHistory.create({
      data: {
        submissionId: id,
        fromStatus: submission.status as never,
        toStatus: "WITHDRAWN",
        note: "Withdrawn by author",
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
