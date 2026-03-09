"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Journal {
  id: string;
  name: string;
  scope: string | null;
  reviewType: string;
}

interface Props {
  journals: Journal[];
}

const STEPS = [
  { label: "Manuscript", description: "Title, abstract & keywords" },
  { label: "Authors", description: "Corresponding & co-authors" },
  { label: "Journal", description: "Target journal & cover letter" },
  { label: "Submit", description: "Review and confirm" },
];

export function SubmitForm({ journals }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
    authorName: "",
    authorEmail: "",
    institution: "",
    coAuthors: "",
    journalId: "",
    coverLetter: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(asDraft = false) {
    setLoading(true);
    const res = await fetch("/api/publisher/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: asDraft ? "DRAFT" : "SUBMITTED" }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/publisher/submissions"), 2000);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Manuscript Submitted</h2>
        <p className="text-muted-foreground mt-2 text-sm">Redirecting to your submissions…</p>
      </div>
    );
  }

  const canProceed =
    (step === 0 && form.title && form.abstract && form.keywords) ||
    (step === 1 && form.authorName && form.authorEmail) ||
    step >= 2;

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="relative">
        <div className="flex items-start justify-between">
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <div className="relative flex items-center w-full">
                  {i > 0 && (
                    <div className={cn(
                      "absolute right-1/2 h-px w-full top-4 -translate-y-1/2",
                      isCompleted || isCurrent ? "bg-foreground" : "bg-border"
                    )} />
                  )}
                  <div className={cn(
                    "relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border-2 transition-all",
                    isCompleted ? "bg-foreground border-foreground text-background" :
                    isCurrent ? "bg-background border-foreground text-foreground" :
                    "bg-background border-border text-muted-foreground"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={cn("text-xs font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manuscript Information</CardTitle>
            <CardDescription>Provide the core details of your manuscript.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Full manuscript title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract <span className="text-destructive">*</span></Label>
              <Textarea
                id="abstract"
                value={form.abstract}
                onChange={(e) => update("abstract", e.target.value)}
                placeholder="Provide a concise summary (150–300 words)…"
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords <span className="text-destructive">*</span></Label>
              <Input
                id="keywords"
                value={form.keywords}
                onChange={(e) => update("keywords", e.target.value)}
                placeholder="e.g. machine learning, neural networks, NLP (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">Separate keywords with commas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Author Information</CardTitle>
            <CardDescription>Details of the corresponding author and any co-authors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="authorName">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="authorName"
                  value={form.authorName}
                  onChange={(e) => update("authorName", e.target.value)}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={form.authorEmail}
                  onChange={(e) => update("authorEmail", e.target.value)}
                  placeholder="jane@university.edu"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution / Affiliation</Label>
              <Input
                id="institution"
                value={form.institution}
                onChange={(e) => update("institution", e.target.value)}
                placeholder="University or research institute"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coAuthors">Co-Authors</Label>
              <Textarea
                id="coAuthors"
                value={form.coAuthors}
                onChange={(e) => update("coAuthors", e.target.value)}
                placeholder={"John Doe, john@mit.edu, MIT\nAlice Wang, alice@oxford.ac.uk, Oxford"}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">One co-author per line: Name, Email, Institution</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Journal & Cover Letter</CardTitle>
            <CardDescription>Select a target journal and write your cover letter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Target Journal <span className="text-destructive">*</span></Label>
              <Select value={form.journalId} onValueChange={(v) => update("journalId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a journal…" />
                </SelectTrigger>
                <SelectContent>
                  {journals.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.journalId && (() => {
              const j = journals.find((j) => j.id === form.journalId);
              return j ? (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
                  <p className="font-medium">{j.reviewType.replace(/_/g, " ")} Review</p>
                  {j.scope && <p className="text-muted-foreground text-xs">{j.scope}</p>}
                </div>
              ) : null;
            })()}
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={form.coverLetter}
                onChange={(e) => update("coverLetter", e.target.value)}
                placeholder="Dear Editor, I am pleased to submit our manuscript…"
                rows={9}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Confirm the details before submitting your manuscript.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              {[
                { label: "Title", value: form.title },
                { label: "Keywords", value: form.keywords },
                { label: "Corresponding Author", value: `${form.authorName} · ${form.authorEmail}` },
                { label: "Institution", value: form.institution || "—" },
                { label: "Journal", value: journals.find((j) => j.id === form.journalId)?.name ?? "None selected" },
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-4 gap-3">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide col-span-1 pt-0.5">{label}</dt>
                  <dd className="col-span-3 text-foreground">{value}</dd>
                </div>
              ))}
              <Separator />
              <div className="grid grid-cols-4 gap-3">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide col-span-1 pt-0.5">Abstract</dt>
                <dd className="col-span-3 text-foreground line-clamp-4 text-xs leading-relaxed">{form.abstract}</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By submitting, you confirm this manuscript represents original work, all authors have approved the submission, and it is not under review elsewhere.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          )}
          <Button variant="ghost" onClick={() => handleSubmit(true)} disabled={loading}>
            Save Draft
          </Button>
        </div>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed}>
            Continue →
          </Button>
        ) : (
          <Button onClick={() => handleSubmit(false)} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Manuscript"}
          </Button>
        )}
      </div>
    </div>
  );
}
