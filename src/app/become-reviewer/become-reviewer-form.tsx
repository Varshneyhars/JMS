"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

export function BecomeReviewerForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    institution: "",
    expertise: "",
    bio: "",
    motivation: "",
    publications: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.expertise) return;
    setLoading(true);
    const res = await fetch("/api/become-reviewer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) setSuccess(true);
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Application Submitted</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Thank you! Our editorial team will review your application within 5–7 business days and contact you at {form.email}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canSubmit = form.name && form.email && form.expertise;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer Application</CardTitle>
        <CardDescription>Fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dr. Jane Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@university.edu" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institution / Affiliation</Label>
          <Input id="institution" value={form.institution} onChange={(e) => update("institution", e.target.value)} placeholder="University or research institute" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expertise">Areas of Expertise <span className="text-destructive">*</span></Label>
          <Input id="expertise" value={form.expertise} onChange={(e) => update("expertise", e.target.value)} placeholder="e.g. machine learning, NLP, computer vision" />
          <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Brief description of your academic and professional background..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publications">Recent Publications (optional)</Label>
          <Textarea id="publications" value={form.publications} onChange={(e) => update("publications", e.target.value)} placeholder={"1. Smith J. et al. (2024). Title. Journal...\n2. ..."} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivation">Why do you want to review for us? (optional)</Label>
          <Textarea id="motivation" value={form.motivation} onChange={(e) => update("motivation", e.target.value)} placeholder="Share your motivation and what you hope to contribute..." rows={3} />
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          By submitting this application, you agree to maintain confidentiality of all manuscripts assigned to you and to conduct reviews in accordance with our ethical guidelines.
        </div>

        <Button onClick={handleSubmit} disabled={loading || !canSubmit} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Application"}
        </Button>
      </CardContent>
    </Card>
  );
}
