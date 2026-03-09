import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ReviseForm } from "./revise-form";

export default async function RevisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const submission = await db.submission.findUnique({
    where: { id, publisherId: session!.user.id },
    select: {
      id: true,
      title: true,
      abstract: true,
      keywords: true,
      coverLetter: true,
      status: true,
      revisionDueDate: true,
      currentRevision: true,
    },
  });

  if (!submission) notFound();

  // Only allow revision when it's actually requested
  if (submission.status !== "REVISION_REQUESTED") {
    redirect(`/publisher/submissions/${id}`);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/publisher" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/publisher/submissions" className="hover:text-foreground transition-colors">
          Submissions
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/publisher/submissions/${id}`}
          className="hover:text-foreground transition-colors truncate max-w-[200px]"
        >
          {submission.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Submit Revision</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">Submit Revision</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Revision {submission.currentRevision + 1} — update your manuscript and respond to reviewer feedback.
        </p>
      </div>

      {/* Due date alert */}
      {submission.revisionDueDate && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            Revision due by <span className="font-semibold">{formatDate(submission.revisionDueDate)}</span>.
            Late submissions may not be considered.
          </p>
        </div>
      )}

      <ReviseForm
        submissionId={submission.id}
        initial={{
          title: submission.title,
          abstract: submission.abstract,
          keywords: submission.keywords ?? "",
          coverLetter: submission.coverLetter ?? "",
        }}
      />
    </div>
  );
}
