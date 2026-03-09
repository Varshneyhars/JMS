import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, daysSince } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
  BookOpen,
  User,
} from "lucide-react";
import { KeywordCloud } from "@/components/ui/keyword-cloud";

export default async function ReviewerDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [pendingInvitations, activeReviews, completedReviews] =
    await Promise.all([
      db.reviewInvitation.findMany({
        where: { reviewerId: userId, status: "PENDING" },
        include: {
          submission: {
            select: {
              title: true,
              abstract: true,
              keywords: true,
              journal: { select: { name: true } },
            },
          },
        },
        orderBy: { invitedAt: "desc" },
      }),
      db.reviewInvitation.findMany({
        where: {
          reviewerId: userId,
          status: "ACCEPTED",
          review: { isSubmitted: false },
        },
        include: {
          submission: {
            select: {
              id: true,
              title: true,
              keywords: true,
              journal: { select: { name: true } },
            },
          },
          review: true,
        },
        orderBy: { invitedAt: "desc" },
      }),
      db.reviewInvitation.count({
        where: { reviewerId: userId, review: { isSubmitted: true } },
      }),
    ]);

  const isEmpty =
    pendingInvitations.length === 0 && activeReviews.length === 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Review Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {session?.user?.name}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/reviewer/profile">
            <User className="h-3.5 w-3.5 mr-1.5" />
            My Profile
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Invitations
                </p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {pendingInvitations.length}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Reviews</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {activeReviews.length}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <ClipboardList className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {completedReviews}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Submitted reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            All caught up
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            You have no pending invitations or active reviews. New invitations
            will appear here when assigned by an editor.
          </p>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          {/* Notice banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              You have{" "}
              <span className="font-semibold">
                {pendingInvitations.length} pending invitation
                {pendingInvitations.length > 1 ? "s" : ""}
              </span>{" "}
              requiring a response. Please accept or decline at your earliest
              convenience.
            </p>
          </div>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base font-semibold">
                  Pending Invitations
                </CardTitle>
              </div>
              <CardDescription>
                Review these manuscripts and indicate whether you can
                participate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {pendingInvitations.map((inv, idx) => {
                const keywords = inv.submission.keywords
                  ? inv.submission.keywords
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean)
                  : [];
                const daysSinceInvited = daysSince(inv.invitedAt);

                return (
                  <div key={inv.id}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground leading-snug">
                            {inv.submission.title}
                          </h3>
                          {inv.submission.journal?.name && (
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-xs font-medium"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {inv.submission.journal.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Abstract excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {inv.submission.abstract}
                      </p>

                      {/* Keywords */}
                      {keywords.length > 0 && (
                        <KeywordCloud keywords={inv.submission.keywords ?? ""} />
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Invited {daysSinceInvited} day
                            {daysSinceInvited !== 1 ? "s" : ""} ago
                          </span>
                          {inv.dueDate && (
                            <>
                              <span className="text-border">·</span>
                              <span>Due {formatDate(inv.dueDate)}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/reviewer/invitations/${inv.id}/decline`}
                            >
                              Decline
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link
                              href={`/reviewer/invitations/${inv.id}/accept`}
                            >
                              Accept
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Reviews */}
      {activeReviews.length > 0 && (
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-base font-semibold">
                Active Reviews
              </CardTitle>
            </div>
            <CardDescription>
              Continue writing your reviews for assigned manuscripts.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {activeReviews.map((inv) => {
              const daysLeft = inv.dueDate
                ? Math.ceil(
                    (new Date(inv.dueDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              const urgency =
                daysLeft === null
                  ? null
                  : daysLeft < 0
                    ? "overdue"
                    : daysLeft < 3
                      ? "critical"
                      : daysLeft < 7
                        ? "warning"
                        : "ok";

              const deadlineLabel =
                daysLeft === null
                  ? null
                  : daysLeft < 0
                    ? "Overdue"
                    : daysLeft === 0
                      ? "Due today"
                      : `${daysLeft}d left`;

              const hasDraft =
                inv.review &&
                (inv.review.publicComments || inv.review.decision);

              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground leading-snug line-clamp-1">
                        {inv.submission.title}
                      </h3>
                      {hasDraft && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-700 font-medium whitespace-nowrap">
                          Draft saved
                        </span>
                      )}
                    </div>
                    {inv.submission.journal?.name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {inv.submission.journal.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {deadlineLabel && (
                      <span
                        className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                          urgency === "overdue"
                            ? "text-red-600"
                            : urgency === "critical"
                              ? "text-red-500"
                              : urgency === "warning"
                                ? "text-orange-500"
                                : "text-muted-foreground"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {deadlineLabel}
                      </span>
                    )}

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reviewer/reviews/${inv.id}`}>
                        Continue Review
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
