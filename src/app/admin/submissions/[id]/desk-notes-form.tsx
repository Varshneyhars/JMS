"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, X, Check, Loader2 } from "lucide-react";

interface Props {
  submissionId: string;
  initialNotes: string | null;
}

export function DeskNotesForm({ submissionId, initialNotes }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/admin/submissions/${submissionId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-amber-900 leading-relaxed flex-1">
          {initialNotes || <span className="italic text-amber-600/70">No internal notes yet. Click to add.</span>}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          className="shrink-0 h-7 px-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="text-sm resize-none bg-white border-amber-200 focus-visible:ring-amber-300"
        placeholder="Internal notes visible only to admins…"
        autoFocus
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading}
          className="h-7 px-3 text-xs bg-amber-700 hover:bg-amber-800"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setEditing(false); setNotes(initialNotes ?? ""); }}
          className="h-7 px-3 text-xs"
        >
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
}
