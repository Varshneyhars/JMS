"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateJournalForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    scope: "",
    issnPrint: "",
    issnOnline: "",
    reviewType: "DOUBLE_BLIND",
    reviewerCount: "2",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      scope: "",
      issnPrint: "",
      issnOnline: "",
      reviewType: "DOUBLE_BLIND",
      reviewerCount: "2",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, reviewerCount: parseInt(form.reviewerCount) }),
    });
    setLoading(false);
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Journal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create Journal</DialogTitle>
          <DialogDescription>
            Add a new journal to the system. Name is required; all other fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Journal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="journal-name">Journal Name</Label>
            <Input
              id="journal-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Journal of Applied Science"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief overview of the journal…"
              rows={3}
            />
          </div>

          {/* Scope & Aims */}
          <div className="space-y-1.5">
            <Label htmlFor="scope">
              Scope &amp; Aims{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="scope"
              value={form.scope}
              onChange={(e) => update("scope", e.target.value)}
              placeholder="Topics covered, target audience…"
              rows={2}
            />
          </div>

          {/* ISSN grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="issn-print">ISSN Print</Label>
              <Input
                id="issn-print"
                value={form.issnPrint}
                onChange={(e) => update("issnPrint", e.target.value)}
                placeholder="0000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issn-online">ISSN Online</Label>
              <Input
                id="issn-online"
                value={form.issnOnline}
                onChange={(e) => update("issnOnline", e.target.value)}
                placeholder="0000-0000"
              />
            </div>
          </div>

          {/* Review Type + Reviewers Required grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="review-type">Review Type</Label>
              <Select
                value={form.reviewType}
                onValueChange={(val) => update("reviewType", val)}
              >
                <SelectTrigger id="review-type">
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOUBLE_BLIND">Double Blind</SelectItem>
                  <SelectItem value="SINGLE_BLIND">Single Blind</SelectItem>
                  <SelectItem value="OPEN">Open Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reviewer-count">Reviewers Required</Label>
              <Input
                id="reviewer-count"
                type="number"
                min="1"
                max="10"
                value={form.reviewerCount}
                onChange={(e) => update("reviewerCount", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Journal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
