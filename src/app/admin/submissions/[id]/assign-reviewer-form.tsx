"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, X } from "lucide-react";

interface Reviewer {
  id: string;
  name: string;
  email: string;
  expertise: string | null;
}

interface Props {
  submissionId: string;
  reviewers: Reviewer[];
}

export function AssignReviewerForm({ submissionId, reviewers }: Props) {
  const router = useRouter();
  const [reviewerId, setReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerId) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/submissions/${submissionId}/reviewers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerId, dueDate: dueDate || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to assign reviewer");
      return;
    }

    setReviewerId("");
    setDueDate("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Assign Reviewer
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-800">Assign Reviewer</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="reviewer-select">Reviewer</Label>
          <Select value={reviewerId} onValueChange={setReviewerId} required>
            <SelectTrigger id="reviewer-select" className="w-full bg-white">
              <SelectValue placeholder="Select a reviewer…" />
            </SelectTrigger>
            <SelectContent>
              {reviewers.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="font-medium">{r.name}</span>
                  {r.expertise && (
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      · {r.expertise}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due-date">Review Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="bg-white"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={loading || !reviewerId}
            className="flex-1"
          >
            {loading ? "Assigning…" : "Assign"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
