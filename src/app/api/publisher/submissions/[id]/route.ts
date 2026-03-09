import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, abstract, keywords, coverLetter } = await req.json();

  if (!title || !abstract) {
    return NextResponse.json({ error: "Title and abstract are required" }, { status: 400 });
  }

  // Make sure the submission belongs to this author and is in the right state
  const existing = await db.submission.findUnique({
    where: { id, publisherId: session.user.id },
    select: { id: true, status: true, currentRevision: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (existing.status !== "REVISION_REQUESTED") {
    return NextResponse.json({ error: "Submission is not awaiting revision" }, { status: 400 });
  }

  const updated = await db.submission.update({
    where: { id },
    data: {
      title,
      abstract,
      keywords: keywords ?? "",
      coverLetter: coverLetter || null,
      status: "REVISION_SUBMITTED",
      currentRevision: { increment: 1 },
    },
  });

  await db.statusHistory.create({
    data: {
      submissionId: id,
      toStatus: "REVISION_SUBMITTED",
      note: `Revision ${updated.currentRevision} submitted`,
    },
  });

  return NextResponse.json({ id: updated.id });
}
