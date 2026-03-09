import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, getStatusLabel, daysSince } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

function getStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="outline" className="text-muted-foreground">{getStatusLabel(status)}</Badge>;
    case "SUBMITTED":
      return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{getStatusLabel(status)}</Badge>;
    case "DESK_REVIEW":
    case "PEER_REVIEW":
    case "REVISION_SUBMITTED":
      return <Badge variant="secondary">{getStatusLabel(status)}</Badge>;
    case "REVISION_REQUESTED":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">{getStatusLabel(status)}</Badge>;
    case "ACCEPTED":
      return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">{getStatusLabel(status)}</Badge>;
    case "PUBLISHED":
      return <Badge>{getStatusLabel(status)}</Badge>;
    case "REJECTED":
    case "DESK_REJECTED":
      return <Badge variant="destructive">{getStatusLabel(status)}</Badge>;
    default:
      return <Badge variant="outline">{getStatusLabel(status)}</Badge>;
  }
}

export default async function PublisherDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const submissions = await db.submission.findMany({
    where: { publisherId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      journal: { select: { name: true } },
      statusHistory: { orderBy: { changedAt: "desc" }, take: 1 },
      reviewInvitations: {
        where: { status: "ACCEPTED" },
        include: { review: { select: { isSubmitted: true, decision: true } } },
      },
    },
  });

  const needsAttention = submissions.filter((s) => s.status === "REVISION_REQUESTED");
  const active = submissions.filter((s) =>
    ["SUBMITTED", "DESK_REVIEW", "PEER_REVIEW", "REVISION_SUBMITTED"].includes(s.status)
  );
  const decided = submissions.filter((s) =>
    ["ACCEPTED", "REJECTED", "DESK_REJECTED", "PUBLISHED", "WITHDRAWN"].includes(s.status)
  );
  const underReview = submissions.filter((s) =>
    ["SUBMITTED", "DESK_REVIEW", "PEER_REVIEW"].includes(s.status)
  );
  const published = submissions.filter((s) => s.status === "PUBLISHED");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Manuscripts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track the status of your submitted work
          </p>
        </div>
        <Button asChild>
          <Link href="/publisher/submit">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Submission
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No manuscripts yet</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Submit your first manuscript to get started with the review process.
          </p>
          <Button asChild className="mt-6">
            <Link href="/publisher/submit">
              <PlusCircle className="h-4 w-4 mr-2" />
              Submit a Manuscript
            </Link>
          </Button>
        </div>
      )}

      {submissions.length > 0 && (
        <>
          {/* Stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{submissions.length}</span>
              <span className="text-muted-foreground">total</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{underReview.length}</span>
              <span className="text-muted-foreground">under review</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{published.length}</span>
              <span className="text-muted-foreground">published</span>
            </div>
          </div>

          {/* Needs Attention */}
          {needsAttention.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold">Needs Attention</h2>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 overflow-hidden">
                {needsAttention.map((sub, idx) => {
                  const completedReviews = sub.reviewInvitations.filter((i) => i.review?.isSubmitted).length;
                  const totalReviews = sub.reviewInvitations.length;
                  return (
                    <div key={sub.id}>
                      {idx > 0 && <Separator className="bg-orange-100" />}
                      <Link
                        href={`/publisher/submissions/${sub.id}`}
                        className="flex items-center justify-between p-4 hover:bg-orange-100/50 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 mb-1">
                            {getStatusBadge(sub.status)}
                            <span className="text-xs text-muted-foreground">{sub.journal?.name}</span>
                          </div>
                          <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {sub.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {sub.revisionDueDate && (
                              <span className="text-orange-600 font-medium">
                                Due {formatDate(sub.revisionDueDate)}
                              </span>
                            )}
                            <span>{daysSince(sub.submittedAt)}d in review</span>
                            {totalReviews > 0 && (
                              <>
                                <span>·</span>
                                <span>{completedReviews}/{totalReviews} reviews</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active submissions */}
          {active.length > 0 && (
            <SubmissionGroup
              label="Active"
              submissions={active}
            />
          )}

          {/* Decided */}
          {decided.length > 0 && (
            <SubmissionGroup
              label="Decided"
              submissions={decided}
              muted
            />
          )}
        </>
      )}
    </div>
  );
}

type SubmissionItem = {
  id: string;
  title: string;
  status: string;
  submittedAt: Date | null;
  revisionDueDate: Date | null;
  journal: { name: string } | null;
  reviewInvitations: {
    review: { isSubmitted: boolean; decision: string | null } | null;
  }[];
};

function SubmissionGroup({
  label,
  submissions,
  muted = false,
}: {
  label: string;
  submissions: SubmissionItem[];
  muted?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h2>
      <Card className="overflow-hidden p-0">
        {submissions.map((sub, idx) => {
          const completedReviews = sub.reviewInvitations.filter((i) => i.review?.isSubmitted).length;
          const totalReviews = sub.reviewInvitations.length;
          return (
            <div key={sub.id}>
              {idx > 0 && <Separator />}
              <Link
                href={`/publisher/submissions/${sub.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    {getStatusBadge(sub.status)}
                    {sub.journal?.name && (
                      <span className="text-xs text-muted-foreground">{sub.journal.name}</span>
                    )}
                  </div>
                  <p className={`font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors ${muted ? "text-muted-foreground" : ""}`}>
                    {sub.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(sub.submittedAt)}</span>
                    <span>·</span>
                    <span>{daysSince(sub.submittedAt)}d ago</span>
                    {totalReviews > 0 && (
                      <>
                        <span>·</span>
                        <span>{completedReviews}/{totalReviews} reviews</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-4 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
