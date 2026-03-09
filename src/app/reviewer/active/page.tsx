import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Clock } from "lucide-react";

export default async function ActiveReviewsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const invitations = await db.reviewInvitation.findMany({
    where: {
      reviewerId: userId,
      status: "ACCEPTED",
      OR: [{ review: null }, { review: { isSubmitted: false } }],
    },
    include: {
      submission: { select: { id: true, title: true, keywords: true, journal: { select: { name: true } } } },
      review: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Active Reviews</h1>
        <p className="text-slate-500 mt-1">{invitations.length} reviews in progress</p>
      </div>

      <div className="space-y-4">
        {invitations.map((inv) => {
          const daysLeft = inv.dueDate
            ? Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;
          const isOverdue = daysLeft !== null && daysLeft < 0;
          const hasProgress = inv.review && (inv.review.publicComments || inv.review.scoreOriginality);

          return (
            <Card key={inv.id} className={isOverdue ? "border-red-200" : ""}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-1">{inv.submission.journal?.name}</p>
                    <h3 className="font-semibold text-slate-900 mb-1">{inv.submission.title}</h3>
                    {inv.submission.keywords && (
                      <p className="text-xs text-slate-400">Keywords: {inv.submission.keywords}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {inv.dueDate && (
                        <span className={`text-xs flex items-center gap-1 font-medium ${isOverdue ? "text-red-600" : daysLeft! < 7 ? "text-orange-500" : "text-slate-500"}`}>
                          <Clock className="h-3 w-3" />
                          {isOverdue ? `Overdue by ${Math.abs(daysLeft!)} days` : `Due ${formatDate(inv.dueDate)} (${daysLeft} days)`}
                        </span>
                      )}
                      {hasProgress && (
                        <span className="text-xs text-blue-500 font-medium">Draft saved</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/reviewer/reviews/${inv.id}`}
                    className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  >
                    {hasProgress ? "Continue Review" : "Start Review"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {invitations.length === 0 && (
          <div className="text-center py-12 text-slate-400">No active reviews. Check your invitations.</div>
        )}
      </div>
    </div>
  );
}
