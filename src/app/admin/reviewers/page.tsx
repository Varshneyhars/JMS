import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { formatDate } from "@/lib/utils";
import { Award, Star, Users } from "lucide-react";
import { ApproveApplicationForm } from "./approve-application-form";

interface Application {
  id: string;
  name: string;
  email: string;
  institution?: string;
  expertise: string;
  bio?: string;
  motivation?: string;
  publications?: string;
  status: string;
  createdAt: string;
}

async function getApplications(): Promise<Application[]> {
  const logs = await db.activityLog.findMany({
    where: { action: "REVIEWER_APPLICATION" },
    orderBy: { createdAt: "desc" },
  });
  return logs.map((l) => {
    try {
      return { id: l.id, createdAt: l.createdAt.toISOString(), ...JSON.parse(l.details ?? "{}") };
    } catch {
      return { id: l.id, createdAt: l.createdAt.toISOString(), status: "PENDING" };
    }
  });
}

export default async function ReviewersAdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const [applications, reviewers] = await Promise.all([
    getApplications(),
    db.user.findMany({
      where: { role: "REVIEWER" },
      include: {
        assignedReviews: {
          include: { review: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingApps = applications.filter((a) => a.status === "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reviewer Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {reviewers.length} active reviewers · {pendingApps.length} pending applications
        </p>
      </div>

      {/* Pending Applications */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Pending Applications
          <Badge variant="secondary">{pendingApps.length}</Badge>
        </h2>
        {pendingApps.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No pending applications.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <Card key={app.id} className="border-amber-200/60">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-semibold">{app.name}</p>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        {app.institution && <p className="text-sm text-muted-foreground">{app.institution}</p>}
                      </div>
                      {app.expertise && (
                        <KeywordCloud keywords={app.expertise} />
                      )}
                      {app.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.bio}</p>
                      )}
                      {app.motivation && (
                        <div className="text-sm bg-muted/50 rounded-lg p-3 border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Motivation</p>
                          <p className="text-muted-foreground">{app.motivation}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Applied {formatDate(new Date(app.createdAt))}</p>
                    </div>
                    <ApproveApplicationForm applicationId={app.id} applicant={{ name: app.name, email: app.email, institution: app.institution, expertise: app.expertise, bio: app.bio }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Active Reviewers */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          Active Reviewers
        </h2>
        <div className="space-y-3">
          {reviewers.map((reviewer) => {
            const submitted = reviewer.assignedReviews.filter((i) => i.review?.isSubmitted);
            const reviews = submitted.map((i) => i.review!).filter(Boolean);
            const avgScore =
              reviews.length > 0
                ? reviews.reduce((a, r) => a + (r.overallScore ?? 0), 0) / reviews.length
                : null;
            const isOutstanding = submitted.length >= 5 && (avgScore ?? 0) >= 3.5;

            return (
              <Card key={reviewer.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {reviewer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{reviewer.name}</p>
                          {isOutstanding && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              <Award className="h-3 w-3" />
                              Outstanding
                            </span>
                          )}
                          <Badge variant={reviewer.isActive ? "default" : "secondary"} className="text-xs">
                            {reviewer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{reviewer.email}</p>
                        {reviewer.institution && (
                          <p className="text-xs text-muted-foreground">{reviewer.institution}</p>
                        )}
                        {reviewer.expertise && (
                          <div className="mt-2">
                            <KeywordCloud keywords={reviewer.expertise} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{avgScore !== null ? avgScore.toFixed(1) : "—"} avg</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{submitted.length} reviews</p>
                      <p className="text-xs text-muted-foreground">{reviewer.assignedReviews.length} invited</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
