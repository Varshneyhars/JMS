import { Card, CardContent } from "@/components/ui/card";
import { Mail, Clock, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Have a question about submissions, peer review, or our editorial process? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            icon: Mail,
            title: "Editorial Office",
            lines: ["editor@jms.com", "For all editorial inquiries and submission queries"],
          },
          {
            icon: MessageSquare,
            title: "Author Support",
            lines: ["authors@jms.com", "Manuscript submission, formatting, and status updates"],
          },
          {
            icon: Clock,
            title: "Response Time",
            lines: ["Typically within 2 business days", "Mon–Fri, 9:00 AM – 5:00 PM UTC"],
          },
          {
            icon: MapPin,
            title: "Location",
            lines: ["Journal Management System", "Open Access Publishing Division"],
          },
        ].map(({ icon: Icon, title, lines }) => (
          <Card key={title}>
            <CardContent className="pt-5 pb-5 flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{title}</p>
                {lines.map((l) => (
                  <p key={l} className="text-sm text-muted-foreground">{l}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topic-specific contacts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Contact by Topic</h2>
        <div className="divide-y rounded-xl border overflow-hidden">
          {[
            ["Manuscript Submission", "authors@jms.com"],
            ["Peer Review Inquiries", "review@jms.com"],
            ["Editorial Decisions", "editor@jms.com"],
            ["Reviewer Applications", "reviewers@jms.com"],
            ["Copyright & Licensing", "rights@jms.com"],
            ["Technical Issues", "support@jms.com"],
          ].map(([topic, email]) => (
            <div key={topic} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/30 transition-colors">
              <span className="font-medium">{topic}</span>
              <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Before contacting us</p>
        <p>Please check our <a href="/author-guidelines" className="text-primary hover:underline">Author Guidelines</a> and <a href="/policies" className="text-primary hover:underline">Journal Policies</a> — most common questions are answered there.</p>
      </div>
    </div>
  );
}
