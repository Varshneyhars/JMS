import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { Award } from "lucide-react";

export default async function EditorialBoardPage() {
  const reviewers = await db.user.findMany({
    where: { role: "REVIEWER", isActive: true },
    include: {
      assignedReviews: {
        include: { review: { select: { isSubmitted: true, overallScore: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const admin = await db.user.findFirst({
    where: { role: "ADMIN", isActive: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Editorial Board</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Our editorial board comprises distinguished researchers and practitioners committed to maintaining the highest standards of peer review.
        </p>
      </div>

      {/* Editor-in-Chief */}
      {admin && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Editor-in-Chief</h2>
          <div className="rounded-xl border bg-muted/30 p-6 flex items-start gap-5">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary">
                {admin.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg font-bold">{admin.name}</p>
                <Badge variant="default" className="text-xs">Editor-in-Chief</Badge>
              </div>
              {admin.institution && <p className="text-sm text-muted-foreground">{admin.institution}</p>}
              {admin.bio && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{admin.bio}</p>}
              {admin.expertise && <div className="mt-3"><KeywordCloud keywords={admin.expertise} /></div>}
            </div>
          </div>
        </section>
      )}

      {/* Reviewers / Associate Editors */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Review Board Members ({reviewers.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reviewers.map((r) => {
            const submitted = r.assignedReviews.filter((i) => i.review?.isSubmitted);
            const avgScore = submitted.length > 0
              ? submitted.reduce((a, i) => a + (i.review?.overallScore ?? 0), 0) / submitted.length
              : null;
            const isOutstanding = submitted.length >= 5 && (avgScore ?? 0) >= 3.5;

            return (
              <div key={r.id} className="rounded-xl border p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">
                      {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{r.name}</p>
                      {isOutstanding && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          <Award className="h-3 w-3" />
                          Outstanding
                        </span>
                      )}
                    </div>
                    {r.institution && <p className="text-xs text-muted-foreground">{r.institution}</p>}
                  </div>
                </div>
                {r.bio && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.bio}</p>}
                {r.expertise && <KeywordCloud keywords={r.expertise} />}
              </div>
            );
          })}
        </div>
        {reviewers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12 border rounded-xl">
            Editorial board information will be available soon.
          </p>
        )}
      </section>
    </div>
  );
}
