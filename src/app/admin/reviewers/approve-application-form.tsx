"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, X } from "lucide-react";

interface Props {
  applicationId: string;
  applicant: {
    name: string;
    email: string;
    institution?: string;
    expertise?: string;
    bio?: string;
  };
}

export function ApproveApplicationForm({ applicationId, applicant }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("review123");

  async function handleApprove() {
    setLoading(true);
    // Create user account
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: applicant.name,
        email: applicant.email,
        password,
        role: "REVIEWER",
        institution: applicant.institution ?? "",
        expertise: applicant.expertise ?? "",
        bio: applicant.bio ?? "",
      }),
    });
    // Mark application as approved
    await fetch(`/api/admin/reviewer-applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDecline() {
    setLoading(true);
    await fetch(`/api/admin/reviewer-applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DECLINED" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Approve
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve Reviewer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              This will create a reviewer account for <strong>{applicant.name}</strong> ({applicant.email}).
            </p>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">Reviewer should change this after first login.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleApprove} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline" onClick={handleDecline} disabled={loading}>
        <X className="h-3.5 w-3.5 mr-1" />
        Decline
      </Button>
    </div>
  );
}
