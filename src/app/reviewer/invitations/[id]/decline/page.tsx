"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function DeclineInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDecline() {
    setLoading(true);
    await fetch(`/api/reviewer/invitations/${params.id}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DECLINED", reason }),
    });
    setLoading(false);
    router.push("/reviewer");
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-1">Decline Invitation</h2>
        <p className="text-muted-foreground text-sm mb-6">Providing a reason helps editors find a better match.</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for declining <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Conflict of interest, outside my expertise, unavailable during this period…"
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleDecline} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Declining…</> : "Decline Invitation"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
