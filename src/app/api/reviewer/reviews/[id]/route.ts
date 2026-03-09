import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params; // invitationId

  const invitation = await db.reviewInvitation.findUnique({
    where: { id, reviewerId: session.user.id, status: "ACCEPTED" },
    include: { review: true },
  });

  if (!invitation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invitation.review?.isSubmitted) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
  }

  const {
    scoreOriginality, scoreMethodology, scoreClarity, scoreSignificance,
    decision, publicComments, privateComments, isSubmitted,
  } = await req.json();

  // Validate scores are 1-5 if provided
  const scoreFields = { scoreOriginality, scoreMethodology, scoreClarity, scoreSignificance };
  for (const [field, val] of Object.entries(scoreFields)) {
    if (val !== null && val !== undefined) {
      const n = Number(val);
      if (isNaN(n) || n < 1 || n > 5) {
        return NextResponse.json({ error: `${field} must be between 1 and 5` }, { status: 400 });
      }
    }
  }

  // Validate decision enum
  const validDecisions = ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"];
  if (decision && !validDecisions.includes(decision)) {
    return NextResponse.json({ error: "Invalid decision value" }, { status: 400 });
  }

  const scores = [scoreOriginality, scoreMethodology, scoreClarity, scoreSignificance].filter(Boolean);
  const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const data = {
    scoreOriginality: scoreOriginality ?? null,
    scoreMethodology: scoreMethodology ?? null,
    scoreClarity: scoreClarity ?? null,
    scoreSignificance: scoreSignificance ?? null,
    overallScore,
    decision: decision || null,
    publicComments: publicComments || null,
    privateComments: privateComments || null,
    isSubmitted: isSubmitted ?? false,
    submittedAt: isSubmitted ? new Date() : null,
  };

  if (invitation.review) {
    await db.review.update({ where: { invitationId: id }, data });
  } else {
    await db.review.create({ data: { invitationId: id, ...data } });
  }

  return NextResponse.json({ success: true });
}
