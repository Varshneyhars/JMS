"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  institution: string | null;
  bio: string | null;
  orcid: string | null;
}

export function EditAuthorForm({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    institution: user.institution ?? "",
    bio: user.bio ?? "",
    orcid: user.orcid ?? "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/publisher/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Institution / Affiliation</Label>
            <Input value={form.institution} onChange={(e) => update("institution", e.target.value)} placeholder="University or organization" />
          </div>
          <div className="space-y-1.5">
            <Label>ORCID</Label>
            <Input value={form.orcid} onChange={(e) => update("orcid", e.target.value)} placeholder="0000-0000-0000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} placeholder="Brief professional bio…" className="resize-none" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
