import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "./review-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { formatDate, daysSince } from "@/lib/utils";
import { Clock, Shield, Eye } from "lucide-react";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const invitation = await db.reviewInvitation.findUnique({
    where: { id, reviewerId: session!.user.id },
    include: {
      submission: {
        include: { journal: { select: { name: true, reviewType: true } } },
      },
      review: true,
    },
  });

  if (!invitation) notFound();
  if (invitation.status !== "ACCEPTED") redirect("/reviewer");

  const isDoubleBlind = invitation.submission.journal?.reviewType !== "OPEN";
  const daysLeft = invitation.dueDate
    ? Math.ceil((new Date(invitation.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  // Timeline steps
  const timeline = [
    { label: "Invitation sent", date: invitation.invitedAt, done: true },
    { label: "Accepted", date: invitation.respondedAt, done: !!invitation.respondedAt },
    { label: "Review due", date: invitation.dueDate, done: invitation.review?.isSubmitted ?? false },
    { label: "Review submitted", date: invitation.review?.submittedAt, done: invitation.review?.isSubmitted ?? false },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Write Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {invitation.submission.journal?.name}
            {invitation.dueDate && ` · Due ${formatDate(invitation.dueDate)}`}
          </p>
        </div>
        {daysLeft !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isOverdue ? "bg-red-50 border-red-200 text-red-700" :
            daysLeft < 3 ? "bg-orange-50 border-orange-200 text-orange-700" :
            daysLeft < 7 ? "bg-amber-50 border-amber-200 text-amber-700" :
            "bg-muted border-border text-muted-foreground"
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? "Due today" : `${daysLeft} days remaining`}
          </div>
        )}
      </div>

      {/* Review Timeline */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-0">
            {timeline.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                    step.done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <p className="text-xs font-medium mt-1.5 text-center whitespace-nowrap">{step.label}</p>
                  {step.date && (
                    <p className="text-xs text-muted-foreground text-center">{formatDate(step.date)}</p>
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mb-6 ${step.done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blind notice */}
      <div className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isDoubleBlind ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-muted border-border text-muted-foreground"
      }`}>
        {isDoubleBlind ? <Shield className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
        <span>
          <span className="font-semibold">{invitation.submission.journal?.reviewType?.replace(/_/g, " ")} Review</span>
          {isDoubleBlind ? " — Author identity is not disclosed to preserve review objectivity." : " — Author and reviewer identities are visible to all parties."}
        </span>
      </div>

      {/* Manuscript */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Manuscript</CardTitle>
            <Badge variant="outline" className="text-xs">
              {isDoubleBlind ? "Author Anonymized" : "Open Review"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h2 className="text-lg font-semibold leading-snug">{invitation.submission.title}</h2>
            {invitation.submission.keywords && (
              <div className="mt-2">
                <KeywordCloud keywords={invitation.submission.keywords} />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Abstract</p>
            <p className="text-muted-foreground leading-relaxed">{invitation.submission.abstract}</p>
          </div>
          {/* Only show author info for OPEN review type */}
          {!isDoubleBlind && (
            <div className="border-t pt-3 text-xs text-muted-foreground">
              <span className="font-medium">Author:</span> {invitation.submission.authorName} · {invitation.submission.authorEmail}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      <ReviewForm
        invitationId={invitation.id}
        existingReview={invitation.review ?? undefined}
      />
    </div>
  );
}
