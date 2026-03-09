import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/editorial-board", label: "Editorial Board" },
  { href: "/author-guidelines", label: "For Authors" },
  { href: "/reviewer-guidelines", label: "For Reviewers" },
  { href: "/policies", label: "Policies" },
  { href: "/indexing", label: "Indexing" },
  { href: "/contact", label: "Contact" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base shrink-0">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            JMS
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/become-reviewer">Become a Reviewer</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Submit Paper</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold mb-3">
                <BookOpen className="h-4 w-4" />
                JMS
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An open-access journal committed to advancing knowledge through rigorous peer review.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Journal</p>
              <ul className="space-y-2">
                {[["About", "/about"], ["Editorial Board", "/editorial-board"], ["Indexing", "/indexing"]].map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-xs text-muted-foreground hover:text-foreground">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Authors</p>
              <ul className="space-y-2">
                {[["Submit Paper", "/login"], ["Author Guidelines", "/author-guidelines"], ["Policies", "/policies"]].map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-xs text-muted-foreground hover:text-foreground">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Reviewers</p>
              <ul className="space-y-2">
                {[["Reviewer Guidelines", "/reviewer-guidelines"], ["Become a Reviewer", "/become-reviewer"], ["Contact", "/contact"]].map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-xs text-muted-foreground hover:text-foreground">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Journal Management System. Open Access.</span>
            <div className="flex gap-4">
              <Link href="/policies" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/policies" className="hover:text-foreground">Publication Ethics</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
