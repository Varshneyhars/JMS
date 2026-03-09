import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Globe, Shield, Users, Zap } from "lucide-react";

export default async function AboutPage() {
  const [totalPublished, totalReviewers, totalJournals] = await Promise.all([
    db.submission.count({ where: { status: "PUBLISHED" } }),
    db.user.count({ where: { role: "REVIEWER", isActive: true } }),
    db.journal.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">Open Access · Double-Blind Peer Review</Badge>
        <h1 className="text-4xl font-bold tracking-tight">About This Journal</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A rigorously peer-reviewed, open-access publication dedicated to advancing knowledge across scientific, engineering, and interdisciplinary domains.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 text-center">
        {[
          { value: totalPublished, label: "Published Articles" },
          { value: totalReviewers, label: "Active Reviewers" },
          { value: totalJournals, label: "Journal Editions" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl border bg-muted/30 p-6">
            <p className="text-4xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Aim & Scope */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Aim & Scope</h2>
        <p className="text-muted-foreground leading-relaxed">
          This journal publishes original research, review articles, and case studies that make significant contributions to their respective fields. We are committed to rapid dissemination of high-quality, peer-reviewed research that advances scientific knowledge and practical applications.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Our scope spans artificial intelligence, machine learning, computer science, engineering disciplines, natural sciences, interdisciplinary research, and emerging technologies. We welcome submissions from researchers at all career stages and from institutions worldwide.
        </p>
      </section>

      {/* Values */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Our Commitments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Shield, title: "Rigorous Peer Review", desc: "Every manuscript undergoes double-blind review by at least two independent experts in the field." },
            { icon: Globe, title: "Open Access", desc: "All published articles are freely available to readers worldwide, with no subscription fees." },
            { icon: Zap, title: "Rapid Publication", desc: "Authors receive initial editorial decisions within 4–8 weeks of submission." },
            { icon: Users, title: "Author Support", desc: "Our editorial team provides guidance throughout the submission and revision process." },
            { icon: BookOpen, title: "Research Integrity", desc: "We adhere to COPE guidelines and maintain strict standards for publication ethics." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-4 rounded-xl border">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Publication info */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Publication Information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Publisher", "Journal Management System"],
            ["Review Type", "Double-Blind Peer Review"],
            ["Access Model", "Open Access (CC BY 4.0)"],
            ["Publication Frequency", "Continuous / Volume-based"],
            ["Language", "English"],
            ["Submission Format", "Online Portal"],
          ].map(([label, value]) => (
            <div key={label} className="p-4 rounded-lg border bg-muted/30">
              <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
