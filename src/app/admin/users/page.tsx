import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreateUserForm } from "./create-user-form";
import { ToggleUserForm } from "./toggle-user-form";
import { PaginationNav } from "@/components/ui/pagination-nav";

const PAGE_SIZE = 30;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return <Badge variant="default">{role}</Badge>;
    case "REVIEWER":
      return <Badge variant="secondary">{role}</Badge>;
    case "AUTHOR":
      return <Badge variant="outline">Author</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const [total, users, allUsers] = await Promise.all([
    db.user.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        institution: true,
        expertise: true,
        createdAt: true,
        _count: { select: { submissions: true, assignedReviews: true } },
      },
    }),
    db.user.findMany({
      select: { role: true },
    }),
  ]);

  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const roleOrder = ["ADMIN", "REVIEWER", "AUTHOR"] as const;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team &amp; Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} registered user{total !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateUserForm />
      </div>

      {/* Role count pills */}
      <div className="flex items-center gap-2">
        {roleOrder.map((role) => {
          const count = roleCounts[role] ?? 0;
          return (
            <span
              key={role}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {role.charAt(0) + role.slice(1).toLowerCase()}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground">
                {count}
              </span>
            </span>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[240px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="w-[120px]">Joined</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className={!user.isActive ? "opacity-60" : undefined}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 select-none">
                        <span className="text-xs font-semibold text-zinc-600">
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    {getRoleBadge(user.role)}
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground">
                      {user.institution ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {user._count.submissions} submission{user._count.submissions !== 1 ? "s" : ""}
                      {" · "}
                      {user._count.assignedReviews} review{user._count.assignedReviews !== 1 ? "s" : ""}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <ToggleUserForm userId={user.id} isActive={user.isActive} />
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
