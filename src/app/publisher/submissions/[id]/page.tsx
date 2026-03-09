import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, getStatusLabel, daysSince } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  BookOpen,
  User,
  Tag,
  CalendarDays,
  Quote,
  Mail,
} from "lucide-react";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { WithdrawButton } from "./withdraw-button";
import { CitationExport } from "@/components/ui/citation-export";

const STATUS_STEPS = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "DESK_REVIEW", label: "Desk Review" },
  { key: "PEER_REVIEW", label: "Peer Review" },
  { key: "REVISION_REQUESTED", label: "Revision" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PUBLISHED", label: "Published" },
];

const TERMINAL_STATUSES = ["DESK_REJECTED", "REJECTED", "WITHDRAWN"];

function getStepIndex(status: string): number {
  // REVISION_SUBMITTED maps to the same position as REVISION_REQUESTED
  if (status === "REVISION_SUBMITTED") return STATUS_STEPS.findIndex((s) => s.key === "REVISION_REQUESTED");
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

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

function getDecisionLabel(decision: string): string {
  return decision.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PublisherSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Increment view count
  await db.submission.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);

  const submission = await db.submission.findUnique({
    where: { id, publisherId: session!.user.id },
    include: {
      journal: true,
      reviewInvitations: {
        include: {
          review: {
            select: {
              isSubmitted: true,
              decision: true,
              publicComments: true,
              scoreOriginality: true,
              scoreMethodology: true,
              scoreClarity: true,
              scoreSignificance: true,
              overallScore: true,
            },
          },
        },
        where: { status: "ACCEPTED" },
      },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!submission) notFound();

  const isTerminal = TERMINAL_STATUSES.includes(submission.status);
  const canWithdraw = ["SUBMITTED", "DESK_REVIEW", "PEER_REVIEW", "REVISION_REQUESTED"].includes(submission.status);
  const currentStep = getStepIndex(submission.status);
  const completedReviews = submission.reviewInvitations.filter((i) => i.review?.isSubmitted);
  const pendingReviews = submission.reviewInvitations.filter((i) => !i.review?.isSubmitted);

  return (
    <div className="space-y-6 max-w-5xl">
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
        <span className="text-foreground font-medium truncate max-w-[240px]">{submission.title}</span>
      </nav>

      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {getStatusBadge(submission.status)}
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {submission.manuscriptId}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight leading-snug">
          {submission.title}
        </h1>
        {/* Info bar */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {submission.journal?.name && (
            <>
              <span className="font-medium text-foreground">{submission.journal.name}</span>
              <span>·</span>
            </>
          )}
          <span>Submitted {formatDate(submission.submittedAt)}</span>
          <span>·</span>
          <span>{daysSince(submission.submittedAt)} days in review</span>
          {submission.reviewInvitations.length > 0 && (
            <>
              <span>·</span>
              <span>{completedReviews.length}/{submission.reviewInvitations.length} reviews complete</span>
            </>
          )}
        </div>
      </div>

      {/* Workflow Stepper */}
      {!isTerminal ? (
        <Card>
          <CardContent className="px-6 py-5">
            <div className="relative flex items-start justify-between">
              {/* Track line - behind everything */}
              <div className="absolute top-4 left-4 right-4 h-px bg-border" />
              {/* Progress line */}
              {currentStep > 0 && (
                <div
                  className="absolute top-4 left-4 h-px bg-primary transition-all duration-500"
                  style={{
                    width: `calc(${(currentStep / (STATUS_STEPS.length - 1)) * 100}% - 8px)`,
                  }}
                />
              )}

              {STATUS_STEPS.map((step, i) => {
                const isPast = i < currentStep;
                const isCurrent = i === currentStep;
                const isFuture = i > currentStep;
                return (
                  <div key={step.key} className="relative flex flex-col items-center gap-2.5 z-10">
                    <div
                      className={[
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                        isPast
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                          : "bg-background border-2 border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      {isPast ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={[
                        "text-xs font-medium whitespace-nowrap",
                        isCurrent
                          ? "text-primary"
                          : isFuture
                          ? "text-muted-foreground"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={[
            "flex items-center gap-3 rounded-xl border p-4",
            submission.status === "WITHDRAWN"
              ? "bg-muted/50 border-border"
              : "bg-destructive/5 border-destructive/20",
          ].join(" ")}
        >
          <XCircle
            className={[
              "h-5 w-5 shrink-0",
              submission.status === "WITHDRAWN" ? "text-muted-foreground" : "text-destructive",
            ].join(" ")}
          />
          <div>
            <p className={`font-medium text-sm ${submission.status === "WITHDRAWN" ? "text-muted-foreground" : "text-destructive"}`}>
              Manuscript {getStatusLabel(submission.status).toLowerCase()}
            </p>
            {submission.statusHistory.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(submission.statusHistory[submission.statusHistory.length - 1]?.changedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Revision alert */}
      {submission.status === "REVISION_REQUESTED" && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-800">Revision Required</p>
            <p className="text-sm text-orange-700 mt-0.5">
              The editors have requested revisions to your manuscript.
              {submission.revisionDueDate && (
                <> Please submit your revised manuscript by{" "}
                  <span className="font-semibold">{formatDate(submission.revisionDueDate)}</span>.
                </>
              )}
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0 bg-orange-700 hover:bg-orange-800 text-white">
            <Link href={`/publisher/submissions/${submission.id}/revise`}>
              Submit Revision
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Manuscript details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Manuscript Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Abstract
                </p>
                <p className="text-sm text-foreground leading-relaxed">{submission.abstract}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Keywords
                    </p>
                  </div>
                  <KeywordCloud keywords={submission.keywords ?? ""} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Author
                    </p>
                  </div>
                  <p className="text-sm font-medium">{submission.authorName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{submission.authorEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Feedback */}
          {completedReviews.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Reviewer Feedback
                </CardTitle>
                <CardDescription>
                  {completedReviews.length} review{completedReviews.length > 1 ? "s" : ""} received
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {completedReviews.map((inv, i) => (
                  <div key={inv.id}>
                    {i > 0 && <Separator className="mb-6" />}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Reviewer {i + 1}</p>
                        {inv.review?.decision && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {getDecisionLabel(inv.review.decision)}
                          </Badge>
                        )}
                      </div>

                      {inv.review && (
                        <>
                          {/* Score grid */}
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: "Originality", value: inv.review.scoreOriginality },
                              { label: "Methodology", value: inv.review.scoreMethodology },
                              { label: "Clarity", value: inv.review.scoreClarity },
                              { label: "Significance", value: inv.review.scoreSignificance },
                            ].map(({ label, value }) => (
                              <div
                                key={label}
                                className="rounded-lg border bg-muted/30 p-3 text-center"
                              >
                                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                <p className="text-lg font-bold leading-none">
                                  {value ?? "—"}
                                  {value !== null && value !== undefined && (
                                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                      /5
                                    </span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Comments */}
                          {inv.review.publicComments && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Comments
                              </p>
                              <blockquote className="border-l-2 border-border pl-4 text-sm text-foreground leading-relaxed">
                                {inv.review.publicComments}
                              </blockquote>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pending reviews note */}
          {pendingReviews.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {pendingReviews.length} review{pendingReviews.length > 1 ? "s are" : " is"} currently in progress
              </span>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick facts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">Journal</span>
                <span className="font-medium text-right">{submission.journal?.name ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{formatDate(submission.submittedAt)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDate(submission.updatedAt)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days in System</span>
                <span className="font-medium">{daysSince(submission.submittedAt)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">
                  {completedReviews.length}/{submission.reviewInvitations.length} complete
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Withdraw */}
          {canWithdraw && (
            <WithdrawButton submissionId={submission.id} />
          )}

          {/* Editor Comments */}
          {submission.statusHistory.some((h) => h.note) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Editor Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submission.statusHistory
                  .filter((h) => h.note)
                  .map((h) => (
                    <div key={h.id} className="rounded-lg bg-muted/40 border p-3">
                      <p className="text-xs text-muted-foreground mb-1.5">{getStatusLabel(h.toStatus)} · {formatDate(h.changedAt)}</p>
                      <p className="text-sm leading-relaxed">{h.note}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Citation Export */}
          {submission.status === "PUBLISHED" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Quote className="h-4 w-4 text-muted-foreground" />
                  Cite This Article
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CitationExport
                  title={submission.title}
                  authorName={submission.authorName}
                  journalName={submission.journal?.name ?? null}
                  publishedYear={new Date(submission.updatedAt).getFullYear()}
                  manuscriptId={submission.manuscriptId}
                />
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Awaiting first status update.
                </p>
              ) : (
                <ol className="relative pl-5 space-y-4">
                  <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-border" />
                  {submission.statusHistory.map((h, idx) => {
                    const isLatest = idx === submission.statusHistory.length - 1;
                    return (
                      <li key={h.id} className="relative">
                        <div
                          className={[
                            "absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full border-2",
                            isLatest
                              ? "bg-primary border-primary"
                              : "bg-background border-border",
                          ].join(" ")}
                        />
                        <p className={`text-sm font-medium leading-tight ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                          {getStatusLabel(h.toStatus)}
                        </p>
                        {h.note && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {h.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(h.changedAt)}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
