"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  submissionId: string;
  initial: {
    title: string;
    abstract: string;
    keywords: string;
    coverLetter: string;
  };
}

export function ReviseForm({ submissionId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/publisher/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push(`/publisher/submissions/${submissionId}`), 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to submit revision. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Revision Submitted</h2>
        <p className="text-muted-foreground mt-2 text-sm">Redirecting back to your submission…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manuscript</CardTitle>
          <CardDescription>Update your title, abstract, and keywords based on reviewer feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract <span className="text-destructive">*</span></Label>
            <Textarea
              id="abstract"
              value={form.abstract}
              onChange={(e) => update("abstract", e.target.value)}
              rows={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              value={form.keywords}
              onChange={(e) => update("keywords", e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response to Reviewers</CardTitle>
          <CardDescription>
            Use the cover letter to address reviewer comments point-by-point. Explain what changes you made and why.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter / Response</Label>
            <Textarea
              id="coverLetter"
              value={form.coverLetter}
              onChange={(e) => update("coverLetter", e.target.value)}
              placeholder="Dear Editor, Thank you for the opportunity to revise our manuscript. We have addressed each reviewer comment as follows…"
              rows={10}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !form.title || !form.abstract}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting…
            </>
          ) : (
            "Submit Revision"
          )}
        </Button>
      </div>
    </form>
  );
}
