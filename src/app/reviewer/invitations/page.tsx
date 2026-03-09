import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { formatDate, daysSince } from "@/lib/utils";
import Link from "next/link";
import { Clock, BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default async function ReviewerInvitationsPage() {
  const session = await auth();
  const userId = session!.user.id;

  // Auto-expire any past-due pending invitations
  await db.reviewInvitation.updateMany({
    where: {
      reviewerId: userId,
      status: "PENDING",
      dueDate: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });

  const invitations = await db.reviewInvitation.findMany({
    where: { reviewerId: userId },
    include: {
      submission: {
        select: {
          title: true,
          abstract: true,
          keywords: true,
          journal: { select: { name: true, reviewType: true } },
        },
      },
    },
    orderBy: { invitedAt: "desc" },
  });

  const pending = invitations.filter((i) => i.status === "PENDING");
  const accepted = invitations.filter((i) => i.status === "ACCEPTED");
  const declined = invitations.filter((i) => i.status === "DECLINED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Invitations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {pending.length} pending · {accepted.length} accepted · {declined.length} declined
        </p>
      </div>

      {/* Pending invitations alert */}
      {pending.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            You have <span className="font-semibold">{pending.length} invitation{pending.length > 1 ? "s" : ""}</span> awaiting your response.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {invitations.map((inv) => {
          const isDoubleBlind = inv.submission.journal?.reviewType !== "OPEN";

          return (
            <Card key={inv.id} className={inv.status === "PENDING" ? "border-amber-200/60" : ""}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-2 flex-wrap">
                      <Badge
                        variant={
                          inv.status === "ACCEPTED" ? "default" :
                          inv.status === "DECLINED" ? "destructive" :
                          inv.status === "EXPIRED" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {inv.status === "ACCEPTED" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</>
                        ) : inv.status === "DECLINED" ? (
                          <><XCircle className="h-3 w-3 mr-1" />Declined</>
                        ) : inv.status}
                      </Badge>
                      {inv.submission.journal?.name && (
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {inv.submission.journal.name}
                        </Badge>
                      )}
                      {isDoubleBlind && (
                        <span className="text-xs text-muted-foreground">Double-blind</span>
                      )}
                    </div>

                    <h3 className="font-semibold leading-snug">{inv.submission.title}</h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">{inv.submission.abstract}</p>

                    {inv.submission.keywords && (
                      <KeywordCloud keywords={inv.submission.keywords} />
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Invited {daysSince(inv.invitedAt)} day{daysSince(inv.invitedAt) !== 1 ? "s" : ""} ago
                      </span>
                      {inv.dueDate && (
                        <>
                          <span>·</span>
                          <span>Due: {formatDate(inv.dueDate)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {inv.status === "PENDING" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" asChild>
                        <Link href={`/reviewer/invitations/${inv.id}/accept`}>Accept</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reviewer/invitations/${inv.id}/decline`}>Decline</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {invitations.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No invitations received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
