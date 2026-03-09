"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusLabel } from "@/lib/utils";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT:              ["SUBMITTED"],
  SUBMITTED:          ["DESK_REVIEW", "DESK_REJECTED", "WITHDRAWN"],
  DESK_REVIEW:        ["PEER_REVIEW", "DESK_REJECTED", "REVISION_REQUESTED", "WITHDRAWN"],
  PEER_REVIEW:        ["REVISION_REQUESTED", "ACCEPTED", "REJECTED", "WITHDRAWN"],
  REVISION_SUBMITTED: ["PEER_REVIEW", "REVISION_REQUESTED", "ACCEPTED", "REJECTED"],
  REVISION_REQUESTED: ["WITHDRAWN"],
  ACCEPTED:           ["IN_COPYEDITING", "PUBLISHED"],
  IN_COPYEDITING:     ["PUBLISHED"],
};

interface Props {
  submissionId: string;
  currentStatus: string;
  journals: { id: string; name: string }[];
  currentJournalId?: string;
}

export function StatusUpdateForm({
  submissionId,
  currentStatus,
  journals,
  currentJournalId,
}: Props) {
  const router = useRouter();
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  const [status, setStatus] = useState(allowedNext[0] ?? currentStatus);
  const [journalId, setJournalId] = useState(currentJournalId ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/submissions/${submissionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note, journalId: journalId || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update status");
      return;
    }

    setNote("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="status-select">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status-select" className="w-full">
            <SelectValue placeholder="Select status…" />
          </SelectTrigger>
          <SelectContent>
            {allowedNext.length === 0 ? (
              <SelectItem value={currentStatus} disabled>
                No transitions available
              </SelectItem>
            ) : (
              allowedNext.map((s) => (
                <SelectItem key={s} value={s}>
                  {getStatusLabel(s)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="journal-select">Assign Journal</Label>
        <Select value={journalId} onValueChange={setJournalId}>
          <SelectTrigger id="journal-select" className="w-full">
            <SelectValue placeholder="Select journal…" />
          </SelectTrigger>
          <SelectContent>
            {journals.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status-note">Note (optional)</Label>
        <Textarea
          id="status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this status change…"
          rows={3}
          className="resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={loading || allowedNext.length === 0} className="w-full">
        {loading ? "Updating…" : allowedNext.length === 0 ? "No changes available" : "Update Status"}
      </Button>
    </form>
  );
}
