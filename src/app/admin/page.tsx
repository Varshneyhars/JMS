import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getStatusLabel } from "@/lib/utils";
import {
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Percent,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();

  const [
    totalUsers,
    totalSubmissions,
    totalJournals,
    submissionsByStatus,
    recentSubmissions,
    pendingReviews,
  ] = await Promise.all([
    db.user.count({ where: { isActive: true } }),
    db.submission.count(),
    db.journal.count({ where: { isActive: true } }),
    db.submission.groupBy({ by: ["status"], _count: true }),
    db.submission.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        publisher: { select: { name: true } },
        journal: { select: { name: true } },
      },
    }),
    db.reviewInvitation.count({ where: { status: "PENDING" } }),
  ]);

  const getStatusCount = (status: string) =>
    submissionsByStatus.find((s) => s.status === status)?._count ?? 0;

  const deskReview = getStatusCount("DESK_REVIEW");
  const peerReview = getStatusCount("PEER_REVIEW");
  const accepted = getStatusCount("ACCEPTED");
  const published = getStatusCount("PUBLISHED");
  const rejected = getStatusCount("REJECTED") + getStatusCount("DESK_REJECTED");
  const decided = accepted + published + rejected;
  const acceptanceRate = decided > 0 ? Math.round(((accepted + published) / decided) * 100) : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const name = session?.user?.name ?? "Admin";

  function getStatusBadgeVariant(
    status: string
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case "PUBLISHED":
        return "default";
      case "ACCEPTED":
        return "secondary";
      case "REJECTED":
      case "DESK_REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  }

  function getStatusBadgeClass(status: string): string {
    if (status === "ACCEPTED") return "text-green-700 bg-green-50 border-green-200";
    return "";
  }

  const pipelineStages: {
    label: string;
    count: number;
    borderColor: string;
  }[] = [
    { label: "Desk Review", count: deskReview, borderColor: "border-l-yellow-400" },
    { label: "Peer Review", count: peerReview, borderColor: "border-l-purple-400" },
    { label: "Accepted", count: accepted, borderColor: "border-l-green-400" },
    { label: "Published", count: published, borderColor: "border-l-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, {name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Total Submissions */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {totalSubmissions}
                </p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground/50 mt-1" />
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {totalUsers}
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground/50 mt-1" />
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              <span>Registered</span>
            </div>
          </CardContent>
        </Card>

        {/* Journals */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Journals</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {totalJournals}
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground/50 mt-1" />
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3" />
              <span>Active</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {pendingReviews}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-muted-foreground/50 mt-1" />
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Awaiting action</span>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                <p className="text-3xl font-semibold text-foreground mt-1">
                  {acceptanceRate !== null ? `${acceptanceRate}%` : "—"}
                </p>
              </div>
              <Percent className="h-5 w-5 text-muted-foreground/50 mt-1" />
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{decided} decisions made</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {pipelineStages.map((stage) => (
          <Card
            key={stage.label}
            className={`bg-white border shadow-sm border-l-4 ${stage.borderColor}`}
          >
            <CardContent className="py-5">
              <p className="text-2xl font-semibold text-foreground">{stage.count}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stage.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Submissions */}
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Submissions
              </CardTitle>
              <CardDescription className="mt-0.5">
                Latest activity across all journals
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/admin/submissions"
                className="flex items-center gap-1 text-sm"
              >
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                recentSubmissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium max-w-[280px]">
                      <Link
                        href={`/admin/submissions/${sub.id}`}
                        className="text-foreground hover:underline line-clamp-1 block"
                      >
                        {sub.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.publisher.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(sub.status)}
                        className={getStatusBadgeClass(sub.status)}
                      >
                        {getStatusLabel(sub.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(sub.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
