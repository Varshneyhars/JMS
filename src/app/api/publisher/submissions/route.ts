import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "AUTHOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title, abstract, keywords, authorName, authorEmail,
    institution, coAuthors, journalId, coverLetter, status,
  } = await req.json();

  if (!title || !abstract || !authorName || !authorEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submission = await db.submission.create({
    data: {
      title,
      abstract,
      keywords: keywords ?? "",
      authorName,
      authorEmail,
      institution: institution || null,
      coAuthors: coAuthors || null,
      journalId: journalId || null,
      coverLetter: coverLetter || null,
      publisherId: session.user.id,
      status: status ?? "SUBMITTED",
      submittedAt: status !== "DRAFT" ? new Date() : null,
    },
  });

  if (status !== "DRAFT") {
    await db.statusHistory.create({
      data: {
        submissionId: submission.id,
        toStatus: "SUBMITTED",
        note: "Initial submission",
      },
    });
  }

  return NextResponse.json({ id: submission.id });
}
