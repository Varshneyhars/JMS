import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reviewerId, dueDate } = await req.json();

  if (!reviewerId) {
    return NextResponse.json({ error: "reviewerId is required" }, { status: 400 });
  }

  // Ensure the user being assigned actually has the REVIEWER role
  const reviewer = await db.user.findUnique({
    where: { id: reviewerId },
    select: { role: true, isActive: true },
  });
  if (!reviewer || reviewer.role !== "REVIEWER" || !reviewer.isActive) {
    return NextResponse.json({ error: "User is not an active reviewer" }, { status: 400 });
  }

  // Check for duplicate invitation
  const existing = await db.reviewInvitation.findUnique({
    where: { submissionId_reviewerId: { submissionId: id, reviewerId } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This reviewer is already assigned to the submission" },
      { status: 409 }
    );
  }

  try {
    await db.reviewInvitation.create({
      data: {
        submissionId: id,
        reviewerId,
        status: "PENDING",
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to assign reviewer" }, { status: 400 });
  }
}
