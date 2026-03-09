import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminReportsPage() {
  const [
    submissionsByStatus,
    reviewerStats,
    totalUsers,
  ] = await Promise.all([
    db.submission.groupBy({
      by: ["status"],
      _count: true,
      orderBy: { _count: { status: "desc" } },
    }),
    db.user.findMany({
      where: { role: "REVIEWER" },
      select: {
        name: true,
        assignedReviews: {
          select: { status: true, review: { select: { isSubmitted: true } } },
        },
      },
      take: 10,
    }),
    db.user.groupBy({ by: ["role"], _count: true }),
  ]);

  const totalSubmissions = submissionsByStatus.reduce((acc, s) => acc + s._count, 0);
  const accepted = submissionsByStatus.find((s) => s.status === "ACCEPTED")?._count ?? 0;
  const rejected =
    (submissionsByStatus.find((s) => s.status === "REJECTED")?._count ?? 0) +
    (submissionsByStatus.find((s) => s.status === "DESK_REJECTED")?._count ?? 0);
  const published = submissionsByStatus.find((s) => s.status === "PUBLISHED")?._count ?? 0;
  const acceptanceRate =
    totalSubmissions > 0 ? ((accepted / totalSubmissions) * 100).toFixed(1) : "0";

  const metrics = [
    {
      label: "Total Submissions",
      value: totalSubmissions,
      valueClass: "text-blue-600",
      description: "All time",
    },
    {
      label: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      valueClass: "text-emerald-600",
      description: "Accepted vs total",
    },
    {
      label: "Published",
      value: published,
      valueClass: "text-green-600",
      description: "Live articles",
    },
    {
      label: "Rejected",
      value: rejected,
      valueClass: "text-red-600",
      description: "Desk + full reject",
    },
  ];

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-500",
    REVIEWER: "bg-purple-500",
    AUTHOR: "bg-blue-500",
    EDITOR: "bg-amber-500",
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    REVIEWER: "Reviewer",
    AUTHOR: "Author",
    EDITOR: "Editor",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports &amp; Analytics</h1>
        <p className="text-muted-foreground mt-1">
          System-wide statistics and performance metrics
        </p>
      </div>

      {/* Key metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 pb-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.label}
              </p>
              <p className={`text-3xl font-bold mt-2 tabular-nums ${m.valueClass}`}>
                {m.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle row: status distribution + users by role */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown of all submissions by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {totalSubmissions === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No submission data yet
              </p>
            ) : (
              <div className="space-y-4">
                {submissionsByStatus.map(({ status, _count }) => {
                  const pct =
                    totalSubmissions > 0 ? (_count / totalSubmissions) * 100 : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground">
                          {status.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {pct.toFixed(1)}%
                          </span>
                          <span className="text-sm font-semibold tabular-nums w-6 text-right">
                            {_count}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Registered accounts grouped by system role</CardDescription>
          </CardHeader>
          <CardContent>
            {totalUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
            ) : (
              <div className="space-y-5">
                {totalUsers.map(({ role, _count }) => {
                  const dotColor = roleColors[role] ?? "bg-slate-400";
                  const label = roleLabels[role] ?? role;
                  const pct =
                    totalUsers.reduce((a, u) => a + u._count, 0) > 0
                      ? (_count / totalUsers.reduce((a, u) => a + u._count, 0)) * 100
                      : 0;
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className="text-lg font-bold tabular-nums">{_count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${dotColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviewer Performance — full width */}
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Performance</CardTitle>
          <CardDescription>
            Invitation acceptance and review completion for the top 10 reviewers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-center">Total Invited</TableHead>
                <TableHead className="text-center">Accepted</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Response Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewerStats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No reviewer data available
                  </TableCell>
                </TableRow>
              ) : (
                reviewerStats.map((rev) => {
                  const total = rev.assignedReviews.length;
                  const acc = rev.assignedReviews.filter(
                    (r) => r.status === "ACCEPTED"
                  ).length;
                  const completed = rev.assignedReviews.filter(
                    (r) => r.review?.isSubmitted
                  ).length;
                  const rate = total > 0 ? Math.round((acc / total) * 100) : 0;

                  let rateVariant: "default" | "secondary" | "destructive" | "outline" =
                    "secondary";
                  let rateClass = "";
                  if (rate >= 70) {
                    rateVariant = "outline";
                    rateClass = "border-green-300 text-green-700 bg-green-50";
                  } else if (rate >= 40) {
                    rateVariant = "outline";
                    rateClass = "border-amber-300 text-amber-700 bg-amber-50";
                  } else {
                    rateVariant = "outline";
                    rateClass = "border-red-300 text-red-700 bg-red-50";
                  }

                  return (
                    <TableRow key={rev.name}>
                      <TableCell className="font-medium">{rev.name}</TableCell>
                      <TableCell className="text-center tabular-nums">{total}</TableCell>
                      <TableCell className="text-center tabular-nums">{acc}</TableCell>
                      <TableCell className="text-center tabular-nums">{completed}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={rateVariant} className={rateClass}>
                          {rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
