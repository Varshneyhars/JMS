"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Journal {
  id: string;
  name: string;
  description: string | null;
  scope: string | null;
  issnPrint: string | null;
  issnOnline: string | null;
  reviewType: string;
  reviewerCount: number;
  isActive: boolean;
}

export function EditJournalForm({ journal }: { journal: Journal }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState({
    name: journal.name,
    description: journal.description ?? "",
    scope: journal.scope ?? "",
    issnPrint: journal.issnPrint ?? "",
    issnOnline: journal.issnOnline ?? "",
    reviewType: journal.reviewType,
    reviewerCount: journal.reviewerCount.toString(),
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/admin/journals/${journal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, reviewerCount: parseInt(form.reviewerCount) }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleToggle() {
    setToggling(true);
    await fetch(`/api/admin/journals/${journal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !journal.isActive }),
    });
    setToggling(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggling}
        className="h-7 px-2 text-xs"
      >
        {toggling ? "…" : journal.isActive ? "Deactivate" : "Activate"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 px-2">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Journal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Journal Name</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Scope & Aims</Label>
              <Textarea value={form.scope} onChange={(e) => update("scope", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ISSN Print</Label>
                <Input value={form.issnPrint} onChange={(e) => update("issnPrint", e.target.value)} placeholder="0000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label>ISSN Online</Label>
                <Input value={form.issnOnline} onChange={(e) => update("issnOnline", e.target.value)} placeholder="0000-0000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Review Type</Label>
                <Select value={form.reviewType} onValueChange={(v) => update("reviewType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOUBLE_BLIND">Double Blind</SelectItem>
                    <SelectItem value="SINGLE_BLIND">Single Blind</SelectItem>
                    <SelectItem value="OPEN">Open Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reviewers Required</Label>
                <Input type="number" min="1" max="10" value={form.reviewerCount} onChange={(e) => update("reviewerCount", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
