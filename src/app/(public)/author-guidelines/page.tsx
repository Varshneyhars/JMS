import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, FileText, ArrowRight } from "lucide-react";

const steps = [
  { step: "01", title: "Prepare Your Manuscript", desc: "Ensure your manuscript follows our formatting guidelines. Use our Word template for correct structure, fonts, and citation style." },
  { step: "02", title: "Check Eligibility", desc: "Verify your manuscript falls within the journal's scope. Original work only — no prior publication or simultaneous submission elsewhere." },
  { step: "03", title: "Create an Account", desc: "Register as an Author on our submission portal. Use an institutional email address for faster processing." },
  { step: "04", title: "Submit Online", desc: "Upload your manuscript, cover letter, and any supplementary materials through the secure online portal." },
  { step: "05", title: "Desk Review", desc: "The editorial team will conduct an initial quality check within 5–7 business days. Manuscripts that don't meet scope or quality thresholds may be desk-rejected." },
  { step: "06", title: "Peer Review", desc: "Suitable manuscripts are assigned to at least two independent peer reviewers for double-blind evaluation (4–8 weeks)." },
  { step: "07", title: "Decision & Revision", desc: "You will receive the editor's decision along with reviewer comments. Revision requests typically allow 3–4 weeks for response." },
  { step: "08", title: "Publication", desc: "Accepted manuscripts are processed, typeset, and published open-access. Authors retain copyright under CC BY 4.0." },
];

const requirements = [
  "Manuscript must be original and not under review elsewhere",
  "All co-authors must have approved the submission",
  "Ethics committee approval required for studies involving human or animal subjects",
  "Authors must disclose all conflicts of interest",
  "Data fabrication, falsification, or plagiarism will result in immediate rejection",
  "AI-generated content must be disclosed in the methods section",
  "All figures must be original or properly licensed",
];

export default function AuthorGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Author Guidelines</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know to submit your manuscript successfully.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/login">
              <FileText className="h-4 w-4 mr-2" />
              Submit Manuscript
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Submission Process */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Submission Process</h2>
        <div className="space-y-4">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-5 p-5 rounded-xl border hover:border-primary/30 transition-colors">
              <div className="text-3xl font-black text-muted-foreground/20 w-10 shrink-0 leading-none">{step}</div>
              <div>
                <p className="font-semibold mb-1">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Manuscript Format */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Manuscript Format</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["File Format", "Microsoft Word (.docx) or LaTeX"],
            ["Font", "Times New Roman, 12pt, double-spaced"],
            ["Abstract Length", "150–300 words"],
            ["Keywords", "5–8 keywords, comma-separated"],
            ["References Style", "APA 7th Edition"],
            ["Maximum Length", "8,000 words (excl. references)"],
            ["Figures", "300 DPI minimum, TIFF or EPS"],
            ["Page Margins", "1 inch (2.54 cm) on all sides"],
          ].map(([label, value]) => (
            <div key={label} className="p-4 rounded-lg border bg-muted/30">
              <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Requirements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Author Responsibilities</h2>
        <ul className="space-y-2.5">
          {requirements.map((req) => (
            <li key={req} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{req}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Article Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Article Types Accepted</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["Original Research", "Review Article", "Case Study", "Short Communication", "Technical Note", "Letter to Editor"].map((type) => (
            <div key={type} className="p-3 rounded-lg border text-sm font-medium text-center">{type}</div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border bg-primary/5 border-primary/20 p-6 text-center">
        <p className="font-semibold mb-2">Ready to submit?</p>
        <p className="text-sm text-muted-foreground mb-4">Create an Author account and begin your submission today.</p>
        <Button asChild>
          <Link href="/login">
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
