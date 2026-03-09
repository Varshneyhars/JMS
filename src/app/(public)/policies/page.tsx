import { Separator } from "@/components/ui/separator";

const sections = [
  {
    id: "publication-ethics",
    title: "Publication Ethics",
    content: `We follow the guidelines of the Committee on Publication Ethics (COPE). All parties — authors, editors, and reviewers — are expected to uphold the highest ethical standards.

Authors must ensure their work is original, has not been published elsewhere, and is not under simultaneous review. Fabrication, falsification, and plagiarism constitute research misconduct and will result in immediate rejection and reporting.

Editors make decisions based solely on academic merit, without regard to authors' nationality, ethnicity, religion, gender, or institutional affiliation.

Reviewers must maintain confidentiality, declare conflicts of interest, and conduct evaluations objectively and in good faith.`,
  },
  {
    id: "peer-review",
    title: "Peer Review Policy",
    content: `All manuscripts undergo double-blind peer review: authors do not know who reviewed their work, and reviewers do not know the identity of the authors. This ensures unbiased evaluation.

Each manuscript is assigned to a minimum of two independent reviewers. In case of conflicting recommendations, a third reviewer may be consulted.

The typical review timeline is 4–8 weeks from submission. Editors aim to provide initial decisions within this window. Authors of manuscripts requiring revision are given 3–4 weeks to respond.

Reviewer identities are never disclosed without explicit consent.`,
  },
  {
    id: "open-access",
    title: "Open Access Policy",
    content: `This journal is fully open access. All published articles are freely available online immediately upon publication, at no cost to readers.

Published articles are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). This permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.

There are no Article Processing Charges (APCs) for submission or publication. Authors retain full copyright of their work.`,
  },
  {
    id: "plagiarism",
    title: "Plagiarism Policy",
    content: `All manuscripts are screened for plagiarism prior to peer review. Manuscripts with a similarity index exceeding 20% (excluding references and quoted material) will be rejected without review.

Self-plagiarism — reusing substantial portions of one's own prior published work without citation — is also prohibited. Authors should clearly disclose any overlap with previous publications.

If plagiarism is discovered post-publication, the article will be retracted and a notice published.`,
  },
  {
    id: "copyright",
    title: "Copyright Policy",
    content: `Authors retain copyright of their work. By submitting, authors grant this journal a non-exclusive license to publish and distribute the article in print and electronic formats.

All articles are published under CC BY 4.0. Readers are free to share and adapt the material for any purpose, provided proper attribution is given.

Third-party material included in articles (figures, tables, images) must be either original, in the public domain, or accompanied by written permission from the copyright holder.`,
  },
  {
    id: "withdrawal",
    title: "Article Withdrawal Policy",
    content: `Authors may withdraw their manuscript at any stage before publication by contacting the editorial office. Withdrawal requests must be submitted in writing and signed by all authors.

Post-acceptance withdrawals are subject to review by the editorial board. In cases of research misconduct, the editors reserve the right to retract published articles.

Retraction notices are permanent and publicly visible, clearly stating the reason for retraction.`,
  },
  {
    id: "privacy",
    title: "Privacy Statement",
    content: `Names and email addresses entered in this journal site will be used exclusively for the stated purposes of this journal and will not be made available for any other purpose or to any other party.

We collect personal information solely to support editorial and publishing processes. Data is stored securely and is never sold to third parties.

Authors and reviewers may request deletion of their data at any time by contacting the editorial office, subject to legal and archival requirements.`,
  },
  {
    id: "ai-policy",
    title: "AI & Large Language Model Policy",
    content: `Authors who use AI or large language model tools (e.g., ChatGPT, Copilot) in the preparation of their manuscript must disclose this in the Methods or Acknowledgements section.

AI tools cannot be listed as authors. Authorship requires accountability for the work, which AI tools cannot assume.

Reviewers should not use AI tools to process or evaluate manuscripts, as this would compromise confidentiality.`,
  },
];

export default function PoliciesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
      <div className="space-y-3 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Journal Policies</h1>
        <p className="text-muted-foreground text-lg">
          Our policies reflect our commitment to ethical, transparent, and rigorous scientific publishing.
        </p>
        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 pt-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1 rounded-full border hover:bg-muted transition-colors text-muted-foreground"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <div key={section.id}>
            {i > 0 && <Separator className="mb-12" />}
            <section id={section.id} className="scroll-mt-20 space-y-4">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="space-y-3">
                {section.content.trim().split("\n\n").map((para, j) => (
                  <p key={j} className="text-sm text-muted-foreground leading-relaxed">{para.trim()}</p>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
