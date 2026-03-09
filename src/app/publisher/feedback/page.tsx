import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function PublisherFeedbackPage() {
  const session = await auth();
  const userId = session!.user.id;

  const submissions = await db.submission.findMany({
    where: {
      publisherId: userId,
      reviewInvitations: {
        some: { review: { isSubmitted: true } },
      },
    },
    include: {
      journal: { select: { name: true } },
      reviewInvitations: {
        where: { status: "ACCEPTED", review: { isSubmitted: true } },
        include: { review: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reviewer Feedback</h1>
        <p className="text-slate-500 mt-1">All reviewer comments on your submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No feedback available yet</p>
          <p className="text-slate-400 text-sm mt-1">Reviewer comments will appear here once reviews are completed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{sub.title}</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">
                      {sub.journal?.name && `${sub.journal.name} · `}
                      {sub.reviewInvitations.length} review{sub.reviewInvitations.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/publisher/submissions/${sub.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0"
                  >
                    View submission →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {sub.reviewInvitations.map((inv, i) => (
                  <div key={inv.id} className={i > 0 ? "pt-5 border-t border-slate-100" : ""}>
                    <p className="text-sm font-semibold text-slate-600 mb-3">Reviewer {i + 1}</p>
                    {inv.review && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2 text-xs text-center">
                          {[
                            { label: "Originality", value: inv.review.scoreOriginality },
                            { label: "Methodology", value: inv.review.scoreMethodology },
                            { label: "Clarity", value: inv.review.scoreClarity },
                            { label: "Significance", value: inv.review.scoreSignificance },
                          ].map(({ label, value }) => (
                            <div key={label} className="rounded-lg bg-slate-50 p-2">
                              <p className="text-slate-400">{label}</p>
                              <p className="text-lg font-bold text-slate-700">{value ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                        {inv.review.decision && (
                          <p className="text-sm">
                            <span className="text-slate-500">Recommendation: </span>
                            <span className="font-medium text-slate-700">{inv.review.decision.replace(/_/g, " ")}</span>
                          </p>
                        )}
                        {inv.review.publicComments && (
                          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
                            {inv.review.publicComments}
                          </div>
                        )}
                        {inv.review.submittedAt && (
                          <p className="text-xs text-slate-400">Submitted {formatDate(inv.review.submittedAt)}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
