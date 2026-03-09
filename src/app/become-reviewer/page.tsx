import { BecomeReviewerForm } from "./become-reviewer-form";
import { BookOpen, CheckCircle2, Clock, Users } from "lucide-react";

export default function BecomeReviewerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-6">
              <Users className="h-3.5 w-3.5" />
              Join Our Reviewer Network
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Become a Peer Reviewer
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Help shape the quality of academic publishing by contributing your expertise to our double-blind peer review process.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: BookOpen,
                  title: "Double-Blind Review",
                  desc: "Author and reviewer identities are kept confidential, ensuring objective, unbiased evaluation.",
                },
                {
                  icon: Clock,
                  title: "Flexible Timeline",
                  desc: "Reviews are typically completed within 4–8 weeks. You decide whether to accept each invitation.",
                },
                {
                  icon: CheckCircle2,
                  title: "Recognition Program",
                  desc: "Outstanding reviewers are recognized with awards and certificates for their contributions.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 rounded-lg border bg-muted/40 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">What happens next?</p>
              Your application will be reviewed by our editorial team within 5–7 business days. If approved, you will receive an email with your reviewer account credentials.
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <BecomeReviewerForm />
          </div>
        </div>
      </div>
    </div>
  );
}
