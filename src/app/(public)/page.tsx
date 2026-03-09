import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeywordCloud } from "@/components/ui/keyword-cloud";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Shield,
  Globe,
  Zap,
  Users,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Redirect authenticated users to their dashboard
  if (session?.user) {
    const roleMap: Record<string, string> = {
      ADMIN: "/admin",
      REVIEWER: "/reviewer",
      AUTHOR: "/publisher",
    };
    redirect(roleMap[session.user.role] ?? "/login");
  }

  const [recentPublished, totalPublished, totalReviewers] = await Promise.all([
    db.submission.findMany({
      where: { status: "PUBLISHED" },
      take: 6,
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, keywords: true, authorName: true, journal: { select: { name: true } }, publishedAt: true },
    }),
    db.submission.count({ where: { status: "PUBLISHED" } }),
    db.user.count({ where: { role: "REVIEWER", isActive: true } }),
  ]);

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/40 to-background pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="mb-2">Open Access · Double-Blind Peer Review · Free to Publish</Badge>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Advance Science Through<br />
            <span className="text-primary">Rigorous Peer Review</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A fully open-access journal with fast editorial decisions, double-blind peer review, and no article processing charges.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/login">
                Submit Your Manuscript
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/author-guidelines">Author Guidelines</Link>
            </Button>
          </div>
          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalPublished}</p>
              <p>Articles Published</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalReviewers}</p>
              <p>Expert Reviewers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">4–8 wks</p>
              <p>Review Time</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">Free</p>
              <p>No APC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Why Publish With Us?</h2>
          <p className="text-muted-foreground mt-2">Built for researchers, by researchers.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: "Double-Blind Review", desc: "Author and reviewer identities are kept confidential, ensuring fair and unbiased evaluation of every submission." },
            { icon: Globe, title: "Fully Open Access", desc: "All articles are freely available worldwide under CC BY 4.0. No paywalls, no subscription fees for readers." },
            { icon: Zap, title: "Fast Decisions", desc: "Initial editorial decisions within 4–8 weeks. Efficient workflows to get your research published quickly." },
            { icon: FileText, title: "No APC", desc: "We charge no Article Processing Charges. Submitting and publishing with us is completely free of charge." },
            { icon: CheckCircle2, title: "DOI & Indexing", desc: "Every article receives a permanent DOI and is indexed in Google Scholar, Crossref, DOAJ, and more." },
            { icon: Users, title: "Expert Reviewers", desc: "Manuscripts are evaluated by domain experts selected from our international reviewer network." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border p-6 hover:border-primary/30 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Publications */}
      {recentPublished.length > 0 && (
        <section className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Recent Publications</h2>
              <p className="text-muted-foreground text-sm mt-1">Latest articles published in our journal</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentPublished.map((sub) => (
              <div key={sub.id} className="rounded-xl border p-5 space-y-3 hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-semibold text-sm leading-snug line-clamp-2">{sub.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub.authorName}</p>
                </div>
                {sub.keywords && <KeywordCloud keywords={sub.keywords} />}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{sub.journal?.name ?? "Journal"}</span>
                  {sub.publishedAt && <span>{formatDate(sub.publishedAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA — For Reviewers */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="rounded-2xl border bg-muted/30 p-10 text-center space-y-4">
          <h2 className="text-2xl font-bold">Are You a Researcher?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join our reviewer network and contribute your expertise to advancing scientific quality. Outstanding reviewers receive recognition certificates.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/become-reviewer">Become a Reviewer</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reviewer-guidelines">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
