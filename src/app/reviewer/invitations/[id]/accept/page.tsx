"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasConflict, setHasConflict] = useState<boolean | null>(null);
  const [conflictDetails, setConflictDetails] = useState("");

  async function handleAccept() {
    setLoading(true);
    await fetch(`/api/reviewer/invitations/${params.id}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ACCEPTED",
        conflictOfInterest: hasConflict ? conflictDetails : "",
      }),
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/reviewer"), 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-6">
        {done ? (
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Invitation Accepted</h2>
            <p className="text-muted-foreground mt-2 text-sm">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Accept Review Invitation</h2>
              <p className="text-muted-foreground text-sm">
                By accepting, you agree to submit your review by the stated deadline.
              </p>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Conflict of Interest Declaration</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Do you have any conflict of interest with this manuscript or its authors?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setHasConflict(false)}
                  className={[
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    hasConflict === false
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  No conflict
                </button>
                <button
                  type="button"
                  onClick={() => setHasConflict(true)}
                  className={[
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    hasConflict === true
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  I have a conflict
                </button>
              </div>

              {hasConflict === true && (
                <div className="space-y-1.5">
                  <Label htmlFor="conflict-details">Please describe the conflict</Label>
                  <Textarea
                    id="conflict-details"
                    value={conflictDetails}
                    onChange={(e) => setConflictDetails(e.target.value)}
                    placeholder="e.g. Co-authored a paper with the author within last 2 years…"
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    The editor will review your declaration before proceeding.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={loading || hasConflict === null}
                className="flex-1"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Accepting…</>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
