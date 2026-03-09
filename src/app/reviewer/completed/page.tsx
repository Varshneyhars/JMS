import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export default async function CompletedReviewsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const invitations = await db.reviewInvitation.findMany({
    where: { reviewerId: userId, review: { isSubmitted: true } },
    include: {
      submission: { select: { title: true, journal: { select: { name: true } } } },
      review: true,
    },
    orderBy: { respondedAt: "desc" },
  });

  const decisionLabels: Record<string, string> = {
    ACCEPT: "Accept",
    MINOR_REVISION: "Minor Revision",
    MAJOR_REVISION: "Major Revision",
    REJECT: "Reject",
  };

  const decisionColors: Record<string, string> = {
    ACCEPT: "bg-green-100 text-green-700",
    MINOR_REVISION: "bg-blue-100 text-blue-700",
    MAJOR_REVISION: "bg-orange-100 text-orange-700",
    REJECT: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Completed Reviews</h1>
        <p className="text-slate-500 mt-1">{invitations.length} reviews completed</p>
      </div>

      <div className="space-y-4">
        {invitations.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">{inv.submission.journal?.name}</p>
                  <h3 className="font-semibold text-slate-900 mt-0.5">{inv.submission.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    {inv.review?.decision && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${decisionColors[inv.review.decision] ?? "bg-gray-100 text-gray-700"}`}>
                        {decisionLabels[inv.review.decision] ?? inv.review.decision}
                      </span>
                    )}
                    {inv.review?.overallScore != null && (
                      <span className="text-xs text-slate-500">
                        Avg score: {inv.review.overallScore.toFixed(1)}/5
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Submitted {formatDate(inv.review?.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {invitations.length === 0 && (
          <div className="text-center py-12 text-slate-400">No completed reviews yet.</div>
        )}
      </div>
    </div>
  );
}
