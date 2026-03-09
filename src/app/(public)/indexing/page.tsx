import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const indexingServices = [
  { name: "Google Scholar", category: "Search Engine", status: "indexed", url: "https://scholar.google.com" },
  { name: "Crossref / DOI", category: "Digital Object Identifier", status: "indexed" },
  { name: "DOAJ", category: "Directory of Open Access Journals", status: "indexed" },
  { name: "Scopus", category: "Abstract & Citation Database", status: "pending" },
  { name: "Web of Science", category: "Citation Index", status: "pending" },
  { name: "ORCID", category: "Author Identifier", status: "indexed" },
  { name: "WorldCat", category: "Library Catalog", status: "indexed" },
  { name: "Semantic Scholar", category: "AI-Powered Research Tool", status: "indexed" },
  { name: "Scilit", category: "Scientific Literature Platform", status: "indexed" },
  { name: "OpenAlex", category: "Open Research Catalog", status: "indexed" },
  { name: "CORE", category: "Open Access Research Aggregator", status: "indexed" },
  { name: "Dimensions", category: "Research Analytics", status: "indexed" },
  { name: "Copernicus", category: "ICI Journals Master List", status: "indexed" },
  { name: "ROAD", category: "ISSN Repository of Open Access Resources", status: "indexed" },
  { name: "Scispace", category: "Research Discovery Platform", status: "indexed" },
];

const categories = [...new Set(indexingServices.map((s) => s.category.split(" ")[0]))];

export default function IndexingPage() {
  const indexed = indexingServices.filter((s) => s.status === "indexed");
  const pending = indexingServices.filter((s) => s.status === "pending");

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Indexing & Abstracting</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our journal is indexed in major academic databases and search engines to maximize the discoverability of your research.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-6">
          <p className="text-4xl font-bold text-emerald-700">{indexed.length}</p>
          <p className="text-sm text-emerald-600 mt-1">Confirmed Indexing</p>
        </div>
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-6">
          <p className="text-4xl font-bold text-amber-700">{pending.length}</p>
          <p className="text-sm text-amber-600 mt-1">Under Application</p>
        </div>
      </div>

      {/* Indexed */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Currently Indexed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {indexed.map((s) => (
            <div key={s.name} className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/30 transition-colors">
              <div>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.category}</p>
              </div>
              <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-600">Indexed</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Pending */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Under Application</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pending.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-xl border border-dashed opacity-70">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
                <Badge variant="outline" className="text-xs">Pending</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Note */}
      <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">ISSN Information</p>
        <p>e-ISSN: 0000-0000 (Online) · p-ISSN: 0000-0000 (Print)</p>
        <p className="mt-1">All articles are assigned a DOI through Crossref for permanent, citable identification.</p>
      </div>
    </div>
  );
}
