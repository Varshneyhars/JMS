import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getStatusColor, getStatusLabel, daysSince } from "@/lib/utils";
import Link from "next/link";
import { FileText, PlusCircle } from "lucide-react";

export default async function PublisherSubmissionsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const submissions = await db.submission.findMany({
    where: { publisherId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      journal: { select: { name: true } },
      reviewInvitations: {
        where: { status: "ACCEPTED" },
        include: { review: { select: { isSubmitted: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Submissions</h1>
          <p className="text-slate-500 mt-1">{submissions.length} manuscripts</p>
        </div>
        <Link
          href="/publisher/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Submission
        </Link>
      </div>

      <div className="space-y-3">
        {submissions.map((sub) => {
          const totalReviews = sub.reviewInvitations.length;
          const completedReviews = sub.reviewInvitations.filter((i) => i.review?.isSubmitted).length;
          return (
            <Link key={sub.id} href={`/publisher/submissions/${sub.id}`}>
              <Card className="hover:border-blue-200 transition-colors cursor-pointer">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                        {sub.journal && (
                          <span className="text-xs text-slate-400">{sub.journal.name}</span>
                        )}
                        <span className="text-xs font-mono text-slate-300">{sub.manuscriptId.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 leading-snug">{sub.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>Submitted {formatDate(sub.submittedAt)}</span>
                        {sub.submittedAt && (
                          <>
                            <span>·</span>
                            <span>{daysSince(sub.submittedAt)} days in system</span>
                          </>
                        )}
                        {totalReviews > 0 && (
                          <>
                            <span>·</span>
                            <span>{completedReviews}/{totalReviews} reviews</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400 shrink-0">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {submissions.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No submissions yet</p>
            <Link
              href="/publisher/submit"
              className="inline-flex items-center gap-2 mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              <PlusCircle className="h-4 w-4" /> Submit Your First Manuscript
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
