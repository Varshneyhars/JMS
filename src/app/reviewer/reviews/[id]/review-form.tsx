"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Lock,
  MessageSquare,
  Star,
  CheckCircle2,
  Loader2,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  GitPullRequestArrow,
  GitPullRequest,
} from "lucide-react";

interface Props {
  invitationId: string;
  existingReview?: {
    id: string;
    scoreOriginality: number | null;
    scoreMethodology: number | null;
    scoreClarity: number | null;
    scoreSignificance: number | null;
    decision: string | null;
    publicComments: string | null;
    privateComments: string | null;
    isSubmitted: boolean;
  };
}

type ScoreKey =
  | "scoreOriginality"
  | "scoreMethodology"
  | "scoreClarity"
  | "scoreSignificance";

const SCORE_CRITERIA: {
  key: ScoreKey;
  label: string;
  description: string;
}[] = [
  {
    key: "scoreOriginality",
    label: "Originality & Novelty",
    description: "Does the work present new ideas or findings?",
  },
  {
    key: "scoreMethodology",
    label: "Methodology & Rigor",
    description: "Are the methods sound, reproducible, and well-described?",
  },
  {
    key: "scoreClarity",
    label: "Clarity & Presentation",
    description: "Is the manuscript well-written and clearly structured?",
  },
  {
    key: "scoreSignificance",
    label: "Significance to Field",
    description: "Will this work meaningfully advance the field?",
  },
];

const SCORE_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const DECISION_OPTIONS: {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
}[] = [
  {
    value: "ACCEPT",
    label: "Accept",
    description: "Ready for publication as-is",
    icon: <ThumbsUp className="h-4 w-4" />,
    color: "border-border hover:border-green-300 hover:bg-green-50",
    activeColor:
      "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500",
  },
  {
    value: "MINOR_REVISION",
    label: "Minor Revisions",
    description: "Accept with small corrections",
    icon: <GitPullRequest className="h-4 w-4" />,
    color: "border-border hover:border-blue-300 hover:bg-blue-50",
    activeColor:
      "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500",
  },
  {
    value: "MAJOR_REVISION",
    label: "Major Revisions",
    description: "Significant rework required",
    icon: <GitPullRequestArrow className="h-4 w-4" />,
    color: "border-border hover:border-orange-300 hover:bg-orange-50",
    activeColor:
      "border-orange-500 bg-orange-50 text-orange-800 ring-1 ring-orange-500",
  },
  {
    value: "REJECT",
    label: "Reject",
    description: "Not suitable for this journal",
    icon: <ThumbsDown className="h-4 w-4" />,
    color: "border-border hover:border-red-300 hover:bg-red-50",
    activeColor: "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500",
  },
];

function ScorePill({
  value,
  selected,
  disabled,
  onClick,
}: {
  value: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-9 w-9 rounded-md text-sm font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {value}
    </button>
  );
}

export function ReviewForm({ invitationId, existingReview }: Props) {
  const router = useRouter();
  const isSubmitted = existingReview?.isSubmitted ?? false;

  const [form, setForm] = useState({
    scoreOriginality: existingReview?.scoreOriginality ?? null,
    scoreMethodology: existingReview?.scoreMethodology ?? null,
    scoreClarity: existingReview?.scoreClarity ?? null,
    scoreSignificance: existingReview?.scoreSignificance ?? null,
    decision: existingReview?.decision ?? "",
    publicComments: existingReview?.publicComments ?? "",
    privateComments: existingReview?.privateComments ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  function setScore(key: ScoreKey, value: number) {
    setForm((f) => ({ ...f, [key]: value }));
    setDraftSaved(false);
  }

  function setDecision(value: string) {
    setForm((f) => ({ ...f, decision: value }));
    setDraftSaved(false);
  }

  function setField(key: "publicComments" | "privateComments", value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setDraftSaved(false);
  }

  // Compute average score from filled-in values
  const scores = [
    form.scoreOriginality,
    form.scoreMethodology,
    form.scoreClarity,
    form.scoreSignificance,
  ].filter((s): s is number => s !== null);
  const averageScore =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : null;

  const canSubmit =
    !!form.decision && form.publicComments.trim().length > 0 && !isSubmitted;

  async function saveReview(submit: boolean) {
    setLoading(true);
    setDraftSaved(false);

    await fetch(`/api/reviewer/reviews/${invitationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scoreOriginality: form.scoreOriginality,
        scoreMethodology: form.scoreMethodology,
        scoreClarity: form.scoreClarity,
        scoreSignificance: form.scoreSignificance,
        decision: form.decision || null,
        publicComments: form.publicComments || null,
        privateComments: form.privateComments || null,
        isSubmitted: submit,
      }),
    });

    setLoading(false);

    if (submit) {
      setSuccess(true);
      setTimeout(() => router.push("/reviewer"), 2500);
    } else {
      setDraftSaved(true);
      router.refresh();
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="rounded-full bg-green-100 p-4 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Review Submitted
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Thank you for your contribution to peer review. Your evaluation has
          been recorded and the editor has been notified.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Redirecting to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Already-submitted banner */}
      {isSubmitted && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            This review has been submitted and is now locked. You can read it
            below but cannot make changes.
          </p>
        </div>
      )}

      {/* ── 1. Scoring ──────────────────────────────────────────────────── */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Evaluation Scores
              </CardTitle>
            </div>
            {averageScore !== null && (
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                <span className="text-sm font-semibold text-foreground">
                  {averageScore}
                </span>
                <span className="text-xs text-muted-foreground">/ 5 avg</span>
              </div>
            )}
          </div>
          <CardDescription>
            Rate each dimension from 1 (Poor) to 5 (Excellent).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {SCORE_CRITERIA.map((criterion, idx) => {
            const selected = form[criterion.key];
            return (
              <div key={criterion.key}>
                {idx > 0 && <Separator className="mb-5" />}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {criterion.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {criterion.description}
                    </p>
                    {selected !== null && (
                      <p className="text-xs text-primary font-medium mt-1">
                        {SCORE_LABELS[selected]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <ScorePill
                        key={n}
                        value={n}
                        selected={selected === n}
                        disabled={isSubmitted}
                        onClick={() => setScore(criterion.key, n)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── 2. Recommendation ───────────────────────────────────────────── */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Editorial Recommendation
          </CardTitle>
          <CardDescription>
            Select the most appropriate outcome for this manuscript.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prominent tile selector */}
          <div className="grid grid-cols-2 gap-3">
            {DECISION_OPTIONS.map((opt) => {
              const isActive = form.decision === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => !isSubmitted && setDecision(opt.value)}
                  disabled={isSubmitted}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? opt.activeColor : opt.color,
                    isSubmitted && "pointer-events-none opacity-70"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{opt.icon}</div>
                  <div>
                    <p className="text-sm font-semibold leading-none">
                      {opt.label}
                    </p>
                    <p className="text-xs text-current opacity-70 mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fallback accessible select (hidden visually but present for screen readers) */}
          <div className="sr-only">
            <Select
              value={form.decision}
              onValueChange={(v) => !isSubmitted && setDecision(v)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                {DECISION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!form.decision && (
            <p className="text-xs text-muted-foreground">
              A recommendation is required before submitting.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Comments ─────────────────────────────────────────────────── */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Comments</CardTitle>
          </div>
          <CardDescription>
            Provide constructive, specific feedback to help the authors and
            editor.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Public comments */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Comments to Authors
            </label>
            <p className="text-xs text-muted-foreground">
              Visible to the submitting author. Be constructive, reference
              specific sections or line numbers where applicable.
            </p>
            <Textarea
              value={form.publicComments}
              onChange={(e) => setField("publicComments", e.target.value)}
              placeholder="Provide specific, constructive feedback for the authors. Reference line numbers where applicable. Minimum 200 characters recommended."
              rows={10}
              disabled={isSubmitted}
              className="resize-y"
            />
            <div className="flex items-center justify-between">
              {form.publicComments.trim().length === 0 && !isSubmitted && (
                <p className="text-xs text-muted-foreground">
                  Public comments are required before submitting.
                </p>
              )}
              {form.publicComments.trim().length > 0 && (
                <p
                  className={cn(
                    "text-xs ml-auto",
                    form.publicComments.trim().length < 200
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  )}
                >
                  {form.publicComments.trim().length} chars
                  {form.publicComments.trim().length < 200 && " (min. 200 recommended)"}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Private / confidential comments */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Confidential Comments to Editor
            </label>
            <p className="text-xs text-muted-foreground">
              Not shared with the author. Use this for concerns about
              plagiarism, conflicts of interest, or other editorial matters.
            </p>
            <Textarea
              value={form.privateComments}
              onChange={(e) => setField("privateComments", e.target.value)}
              placeholder="Share any concerns about potential plagiarism, conflicts of interest, or other matters for the editor only."
              rows={5}
              disabled={isSubmitted}
              className="resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Action Buttons ───────────────────────────────────────────────── */}
      {!isSubmitted && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            {draftSaved && (
              <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Draft saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => saveReview(false)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save Draft
            </Button>

            <Button
              onClick={() => saveReview(true)}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Submit Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
