import { db } from "@/lib/db";
import { formatDate, getStatusLabel, daysSince } from "@/lib/utils";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationNav } from "@/components/ui/pagination-nav";

const PAGE_SIZE = 25;

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Desk Review", value: "DESK_REVIEW" },
  { label: "Peer Review", value: "PEER_REVIEW" },
  { label: "Revision", value: "REVISION_REQUESTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Rejected", value: "REJECTED" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return <Badge variant="default">{getStatusLabel(status)}</Badge>;
    case "ACCEPTED":
      return (
        <Badge variant="outline" className="border-green-600 text-green-700">
          {getStatusLabel(status)}
        </Badge>
      );
    case "PEER_REVIEW":
    case "DESK_REVIEW":
      return <Badge variant="secondary">{getStatusLabel(status)}</Badge>;
    case "REVISION_REQUESTED":
    case "REJECTED":
    case "DESK_REJECTED":
      return <Badge variant="destructive">{getStatusLabel(status)}</Badge>;
    default:
      return <Badge variant="outline">{getStatusLabel(status)}</Badge>;
  }
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const statusFilter = statusParam ?? "";

  const where = statusFilter ? { status: statusFilter as import('@prisma/client').SubmissionStatus } : {};

  const [total, submissions] = await Promise.all([
    db.submission.count({ where }),
    db.submission.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        publisher: { select: { name: true, email: true } },
        journal: { select: { name: true } },
        reviewInvitations: {
          include: { reviewer: { select: { name: true } }, review: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} manuscript{total !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 border-b overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === statusFilter;
          return (
            <Link
              key={tab.value}
              href={`/admin/submissions?status=${tab.value}&page=1`}
              className={
                isActive
                  ? "px-3 py-2 text-sm font-medium border-b-2 border-foreground text-foreground -mb-px whitespace-nowrap"
                  : "px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[280px]">Manuscript</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Journal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead className="w-[72px]">Days</TableHead>
              <TableHead className="w-[120px]">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="py-3">
                    <Link
                      href={`/admin/submissions/${sub.id}`}
                      className="font-medium text-sm leading-snug hover:underline line-clamp-2 max-w-[260px] block"
                    >
                      {sub.title}
                    </Link>
                    <span className="font-mono text-xs text-muted-foreground mt-0.5 block">
                      {sub.manuscriptId}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <p className="text-sm font-medium leading-none">
                      {sub.publisher.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sub.publisher.email}
                    </p>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground">
                      {sub.journal?.name ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    {getStatusBadge(sub.status)}
                  </TableCell>

                  <TableCell className="py-3">
                    {sub.reviewInvitations.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {sub.reviewInvitations.slice(0, 5).map((inv) => (
                          <span
                            key={inv.id}
                            title={`${inv.reviewer.name} — ${inv.status}`}
                            className={[
                              "h-6 w-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0 select-none",
                              inv.status === "ACCEPTED"
                                ? "bg-green-100 text-green-700"
                                : inv.status === "DECLINED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700",
                            ].join(" ")}
                          >
                            {inv.reviewer.name.charAt(0).toUpperCase()}
                          </span>
                        ))}
                        {sub.reviewInvitations.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{sub.reviewInvitations.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {sub.submittedAt ? `${daysSince(sub.submittedAt)}d` : "—"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(sub.updatedAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationNav page={page} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
