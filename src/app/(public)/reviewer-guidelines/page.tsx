import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, Clock, Star, ArrowRight } from "lucide-react";

const responsibilities = [
  "Evaluate the manuscript's originality, methodology, clarity, and significance",
  "Provide constructive, specific, and unbiased feedback to help authors improve their work",
  "Maintain strict confidentiality of all manuscript contents",
  "Declare any conflicts of interest before accepting the review assignment",
  "Complete the review within the agreed timeframe (typically 4–6 weeks)",
  "Do not use unpublished data or ideas from the manuscript without the author's consent",
  "Alert the editor if you suspect plagiarism, ethical violations, or duplicate submission",
  "Recommend an editorial decision: Accept, Minor Revision, Major Revision, or Reject",
];

const criteria = [
  { label: "Originality", desc: "Is the work novel? Does it make a meaningful contribution beyond existing literature?" },
  { label: "Methodology", desc: "Are the methods sound, reproducible, and appropriate for the research questions?" },
  { label: "Clarity", desc: "Is the manuscript well-written, logically organized, and clearly presented?" },
  { label: "Significance", desc: "Does the work have relevance and impact for the field or society?" },
];

export default function ReviewerGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Reviewer Guidelines</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Peer reviewers are the cornerstone of scientific quality. Thank you for contributing your expertise.
        </p>
        <Button asChild className="mt-2">
          <Link href="/become-reviewer">
            <Star className="h-4 w-4 mr-2" />
            Join Our Reviewer Network
          </Link>
        </Button>
      </div>

      {/* Review process */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Double-Blind", desc: "Author and reviewer identities are kept confidential from each other throughout the review." },
            { icon: Clock, title: "4–8 Weeks", desc: "We request reviews to be completed within 4–6 weeks of invitation acceptance." },
            { icon: Star, title: "Recognition", desc: "Outstanding reviewers receive certificates and are highlighted on our editorial board page." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Evaluation Criteria */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Evaluation Criteria</h2>
        <p className="text-sm text-muted-foreground">Reviewers assess manuscripts on four key dimensions, each rated on a 1–5 scale:</p>
        <div className="space-y-3">
          {criteria.map(({ label, desc }) => (
            <div key={label} className="flex gap-4 p-4 rounded-xl border">
              <div className="flex items-center gap-1 shrink-0">
                {[1,2,3,4,5].map((n) => (
                  <div key={n} className={`h-2 w-2 rounded-full ${n <= 4 ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Responsibilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Reviewer Responsibilities</h2>
        <ul className="space-y-2.5">
          {responsibilities.map((r) => (
            <li key={r} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Tips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Writing a Good Review</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>A high-quality review is <strong className="text-foreground">specific, constructive, and respectful</strong>. Rather than simply stating that something is wrong, explain why and suggest how it could be improved.</p>
          <p>Structure your review with: (1) a brief summary of the work, (2) major concerns, (3) minor comments, and (4) your recommendation. Separate general impressions from specific, actionable feedback.</p>
          <p>Remember that the public comments will be shared with the authors — keep your confidential notes for the editor only.</p>
        </div>
      </section>

      <div className="rounded-xl border bg-primary/5 border-primary/20 p-6 text-center">
        <p className="font-semibold mb-2">Interested in joining our reviewer network?</p>
        <p className="text-sm text-muted-foreground mb-4">Apply to become a reviewer and contribute to advancing scientific knowledge.</p>
        <Button asChild>
          <Link href="/become-reviewer">
            Apply Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
