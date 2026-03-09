"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";

interface Props {
  title: string;
  authorName: string;
  journalName: string | null;
  publishedYear: number;
  manuscriptId: string;
}

function buildBibtex(p: Props): string {
  const key = p.authorName.split(" ")[0].toLowerCase() + p.publishedYear;
  return `@article{${key},
  title   = {${p.title}},
  author  = {${p.authorName}},
  journal = {${p.journalName ?? "Unknown Journal"}},
  year    = {${p.publishedYear}},
  note    = {Manuscript ID: ${p.manuscriptId}}
}`;
}

function buildApa(p: Props): string {
  const parts = p.authorName.trim().split(" ");
  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map((w) => w[0] + ".").join(" ");
  return `${lastName}, ${initials} (${p.publishedYear}). ${p.title}. ${p.journalName ?? "Unknown Journal"}.`;
}

export function CitationExport(props: Props) {
  const [copied, setCopied] = useState<"bibtex" | "apa" | null>(null);

  async function copy(type: "bibtex" | "apa") {
    const text = type === "bibtex" ? buildBibtex(props) : buildApa(props);
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  function download(type: "bibtex" | "apa") {
    const text = type === "bibtex" ? buildBibtex(props) : buildApa(props);
    const ext = type === "bibtex" ? "bib" : "txt";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citation.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">BibTeX</p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copy("bibtex")}>
            {copied === "bibtex" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => download("bibtex")}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">{buildBibtex(props)}</pre>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">APA</p>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copy("apa")}>
            {copied === "apa" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => download("apa")}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-xs bg-muted rounded-md p-3 font-mono leading-relaxed">{buildApa(props)}</p>
    </div>
  );
}
