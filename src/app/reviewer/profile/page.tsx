import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { formatDate } from "@/lib/utils";
import { Star, FileText, CheckCircle2, Clock, Award } from "lucide-react";
import { EditProfileForm } from "./edit-profile-form";

export default async function ReviewerProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      assignedReviews: {
        include: {
          review: true,
          submission: { select: { title: true, journal: { select: { name: true } } } },
        },
        orderBy: { invitedAt: "desc" },
      },
    },
  });

  if (!user) return null;

  const allInvitations = user.assignedReviews;
  const accepted = allInvitations.filter((i) => i.status === "ACCEPTED");
  const submitted = accepted.filter((i) => i.review?.isSubmitted);
  const pending = allInvitations.filter((i) => i.status === "PENDING");
  const declined = allInvitations.filter((i) => i.status === "DECLINED");

  const submittedReviews = submitted.map((i) => i.review!).filter(Boolean);
  const avgScore =
    submittedReviews.length > 0
      ? submittedReviews.reduce((acc, r) => acc + (r.overallScore ?? 0), 0) / submittedReviews.length
      : null;

  const decisions = submittedReviews.reduce(
    (acc, r) => {
      if (r.decision) acc[r.decision] = (acc[r.decision] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const decisionLabels: Record<string, string> = {
    ACCEPT: "Accept",
    MINOR_REVISION: "Minor Revision",
    MAJOR_REVISION: "Major Revision",
    REJECT: "Reject",
  };

  const isOutstanding = submitted.length >= 5 && (avgScore ?? 0) >= 3.5;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your reviewer profile and statistics</p>
        </div>
        {isOutstanding && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            Outstanding Reviewer
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invited", value: allInvitations.length, icon: FileText },
          { label: "Reviews Submitted", value: submitted.length, icon: CheckCircle2 },
          { label: "Pending", value: pending.length, icon: Clock },
          { label: "Avg Score Given", value: avgScore !== null ? avgScore.toFixed(1) : "—", icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Profile Information</CardTitle>
          <EditProfileForm user={{ name: user.name, bio: user.bio ?? "", expertise: user.expertise ?? "", institution: user.institution ?? "" }} />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Institution</p>
              <p>{user.institution || <span className="text-muted-foreground italic">Not set</span>}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Member Since</p>
              <p>{formatDate(user.createdAt)}</p>
            </div>
          </div>

          {user.bio && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Bio</p>
                <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
              </div>
            </>
          )}

          {user.expertise && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Expertise Areas</p>
                <KeywordCloud keywords={user.expertise} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Decision Breakdown */}
      {submittedReviews.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review Decision Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(decisions).map(([decision, count]) => {
                const pct = Math.round((count / submittedReviews.length) * 100);
                const colors: Record<string, string> = {
                  ACCEPT: "bg-emerald-500",
                  MINOR_REVISION: "bg-blue-500",
                  MAJOR_REVISION: "bg-amber-500",
                  REJECT: "bg-red-500",
                };
                return (
                  <div key={decision} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 shrink-0">{decisionLabels[decision]}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${colors[decision]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Review History</CardTitle>
        </CardHeader>
        <CardContent>
          {allInvitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No review history yet.</p>
          ) : (
            <div className="space-y-3">
              {allInvitations.slice(0, 10).map((inv) => (
                <div key={inv.id} className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.submission.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inv.submission.journal?.name} · Invited {formatDate(inv.invitedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inv.review?.isSubmitted && inv.review.decision && (
                      <Badge variant="outline" className="text-xs">
                        {decisionLabels[inv.review.decision]}
                      </Badge>
                    )}
                    <Badge
                      variant={inv.status === "ACCEPTED" ? "default" : inv.status === "DECLINED" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {inv.status === "ACCEPTED" && inv.review?.isSubmitted ? "Completed" : inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
