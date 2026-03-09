import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  truncate,
} from "@/lib/utils";
import { StatusUpdateForm } from "./status-update-form";
import { AssignReviewerForm } from "./assign-reviewer-form";
import { DeskNotesForm } from "./desk-notes-form";
import {
  FileText,
  User,
  Clock,
  Lock,
  ChevronRight,
  BookOpen,
  Building2,
  Mail,
  Users,
  Eye,
} from "lucide-react";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import Link from "next/link";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Increment view count
  await db.submission.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => null);

  const submission = await db.submission.findUnique({
    where: { id },
    include: {
      publisher: true,
      journal: true,
      reviewInvitations: {
        include: {
          reviewer: { select: { id: true, name: true, email: true, expertise: true } },
          review: true,
        },
        orderBy: { invitedAt: "desc" },
      },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!submission) notFound();

  const availableReviewers = await db.user.findMany({
    where: {
      role: "REVIEWER",
      isActive: true,
      id: { notIn: submission.reviewInvitations.map((i) => i.reviewerId) },
    },
    select: { id: true, name: true, email: true, expertise: true },
  });

  const journals = await db.journal.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const invitationStatusStyle = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-200";
      case "DECLINED":
        return "bg-red-100 text-red-700 border-red-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const keywords = submission.keywords
    ? submission.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link
          href="/admin/submissions"
          className="hover:text-foreground transition-colors"
        >
          Submissions
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-xs">
          {truncate(submission.title, 48)}
        </span>
      </nav>

      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusColor(
              submission.status
            )}`}
          >
            {getStatusLabel(submission.status)}
          </span>
          <code className="text-xs font-mono text-muted-foreground tracking-wide">
            {submission.manuscriptId}
          </code>
        </div>
        <h1 className="text-2xl font-semibold text-foreground leading-snug">
          {submission.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {submission.publisher.name}
          </span>
          {submission.journal && (
            <>
              <span className="mx-1.5">·</span>
              {submission.journal.name}
            </>
          )}
          <span className="mx-1.5">·</span>
          Submitted {formatDate(submission.submittedAt)}
        </p>
      </div>

      <Separator />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract & Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Abstract &amp; Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Abstract */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Abstract
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {submission.abstract}
                </p>
              </div>

              {/* Keywords */}
              {submission.keywords && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Keywords
                  </p>
                  <KeywordCloud keywords={submission.keywords} />
                </div>
              )}

              <Separator />

              {/* Author info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Author
                  </p>
                  <p className="font-medium text-foreground">
                    {submission.authorName}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3" />
                    {submission.authorEmail}
                  </p>
                </div>

                {submission.institution && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Institution
                    </p>
                    <p className="text-foreground">{submission.institution}</p>
                  </div>
                )}

                {submission.coAuthors && (
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Co-Authors
                    </p>
                    <p className="text-foreground">{submission.coAuthors}</p>
                  </div>
                )}
              </div>

              {/* Cover letter */}
              {submission.coverLetter && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Cover Letter
                    </p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {submission.coverLetter}
                    </p>
                  </div>
                </>
              )}

              {/* Admin notes */}
              <DeskNotesForm submissionId={submission.id} initialNotes={submission.deskNotes ?? ""} />
            </CardContent>
          </Card>

          {/* Review Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-muted-foreground" />
                Peer Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.reviewInvitations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviewers assigned yet.
                </p>
              ) : (
                submission.reviewInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-lg border border-slate-200 overflow-hidden"
                  >
                    {/* Reviewer header */}
                    <div className="flex items-start justify-between gap-3 px-4 py-3 bg-slate-50">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {inv.reviewer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.reviewer.email}
                        </p>
                        {inv.reviewer.expertise && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {inv.reviewer.expertise}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${invitationStatusStyle(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    {/* Review content */}
                    {inv.review ? (
                      <div className="px-4 py-4 space-y-4">
                        {/* Score grid */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            {
                              label: "Originality",
                              value: inv.review.scoreOriginality,
                            },
                            {
                              label: "Methodology",
                              value: inv.review.scoreMethodology,
                            },
                            { label: "Clarity", value: inv.review.scoreClarity },
                            {
                              label: "Significance",
                              value: inv.review.scoreSignificance,
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="rounded-md border border-slate-100 bg-slate-50 p-2.5 text-center"
                            >
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                {label}
                              </p>
                              <p className="mt-1 text-base font-bold text-foreground">
                                {value ?? "—"}
                                <span className="text-xs font-normal text-muted-foreground">
                                  /5
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Decision */}
                        {inv.review.decision && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Decision
                            </span>
                            <Badge
                              className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(
                                inv.review.decision
                              )}`}
                              variant="outline"
                            >
                              {inv.review.decision.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        )}

                        {/* Public comments */}
                        {inv.review.publicComments && (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                              Comments to Author
                            </p>
                            <blockquote className="border-l-4 border-slate-300 pl-3 text-sm text-foreground leading-relaxed">
                              {inv.review.publicComments}
                            </blockquote>
                          </div>
                        )}

                        {/* Private / confidential */}
                        {inv.review.privateComments && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 flex gap-3">
                            <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-1">
                                Confidential Notes
                              </p>
                              <p className="text-sm text-amber-900">
                                {inv.review.privateComments}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground italic">
                        Awaiting review…
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No status changes recorded.
                </p>
              ) : (
                <ol className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />

                  {submission.statusHistory.map((h) => (
                    <li key={h.id} className="relative mb-5 last:mb-0">
                      {/* Dot */}
                      <span className="absolute -left-[19px] top-[3px] flex h-3 w-3 items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                      </span>

                      <p className="text-sm font-semibold text-foreground leading-none">
                        {h.fromStatus
                          ? `${getStatusLabel(h.fromStatus)} → ${getStatusLabel(h.toStatus)}`
                          : getStatusLabel(h.toStatus)}
                      </p>
                      {h.note && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {h.note}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatDateTime(h.changedAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ─────────────────────────── */}
        <div className="space-y-4">
          {/* Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground shrink-0">Publisher</dt>
                  <dd className="font-medium text-foreground text-right">
                    {submission.publisher.name}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground shrink-0">Journal</dt>
                  <dd className="font-medium text-foreground text-right">
                    {submission.journal?.name ?? "—"}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground shrink-0">Submitted</dt>
                  <dd className="text-foreground">
                    {formatDate(submission.submittedAt)}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground shrink-0">Last Updated</dt>
                  <dd className="text-foreground">
                    {formatDate(submission.updatedAt)}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-2">
                  <dt className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <Eye className="h-3.5 w-3.5" />
                    Views
                  </dt>
                  <dd className="font-medium text-foreground">{submission.viewCount}</dd>
                </div>
                {submission.revisionDueDate && (
                  <>
                    <Separator />
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">
                        Revision Due
                      </dt>
                      <dd className="font-semibold text-orange-600">
                        {formatDate(submission.revisionDueDate)}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusUpdateForm
                submissionId={submission.id}
                currentStatus={submission.status}
                journals={journals}
                currentJournalId={submission.journalId ?? undefined}
              />
            </CardContent>
          </Card>

          {/* Assign Reviewer */}
          {availableReviewers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assign Reviewer</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignReviewerForm
                  submissionId={submission.id}
                  reviewers={availableReviewers}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
