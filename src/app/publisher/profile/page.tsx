import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { EditAuthorForm } from "./edit-author-form";

export default async function AuthorProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        institution: true,
        bio: true,
        orcid: true,
        createdAt: true,
      },
    }),
    db.submission.groupBy({
      by: ["status"],
      where: { publisherId: userId },
      _count: true,
    }),
  ]);

  if (!user) return null;

  const totalSubmissions = stats.reduce((sum, s) => sum + s._count, 0);
  const published = stats.find((s) => s.status === "PUBLISHED")?._count ?? 0;
  const accepted = stats.find((s) => s.status === "ACCEPTED")?._count ?? 0;
  const inReview = stats
    .filter((s) => ["DESK_REVIEW", "PEER_REVIEW", "REVISION_REQUESTED", "REVISION_SUBMITTED"].includes(s.status))
    .reduce((sum, s) => sum + s._count, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your author information</p>
        </div>
        <EditAuthorForm user={user} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
            <p className="text-xs text-slate-500 mt-1">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-3xl font-bold text-green-600">{published + accepted}</p>
            <p className="text-xs text-slate-500 mt-1">Accepted / Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{inReview}</p>
            <p className="text-xs text-slate-500 mt-1">Under Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-muted-foreground" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <Separator />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Email</dt>
              <dd className="text-muted-foreground">{user.email}</dd>
            </div>
            {user.institution && (
              <>
                <Separator />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Institution</dt>
                  <dd>{user.institution}</dd>
                </div>
              </>
            )}
            {user.orcid && (
              <>
                <Separator />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">ORCID</dt>
                  <dd className="font-mono text-sm">{user.orcid}</dd>
                </div>
              </>
            )}
            {user.bio && (
              <>
                <Separator />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Bio</dt>
                  <dd className="leading-relaxed text-muted-foreground">{user.bio}</dd>
                </div>
              </>
            )}
          </dl>
          {(!user.institution && !user.orcid && !user.bio) && (
            <p className="text-sm text-muted-foreground italic">
              No profile details yet. Click Edit Profile to add your information.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
