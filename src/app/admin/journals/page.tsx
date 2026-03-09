import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CreateJournalForm } from "./create-journal-form";
import { EditJournalForm } from "./edit-journal-form";

export default async function AdminJournalsPage() {
  const journals = await db.journal.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Journals</h1>
          <p className="text-slate-500 mt-1">{journals.length} journals configured</p>
        </div>
        <CreateJournalForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {journals.map((journal) => (
          <Card key={journal.id} className={!journal.isActive ? "opacity-60" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 leading-snug">{journal.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${journal.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {journal.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {journal.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{journal.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>{journal._count.submissions} submissions</span>
                <span>{journal.reviewType.replace(/_/g, " ")}</span>
              </div>
              {(journal.issnPrint || journal.issnOnline) && (
                <div className="mb-3 text-xs text-slate-400">
                  {journal.issnPrint && <span>Print: {journal.issnPrint} </span>}
                  {journal.issnOnline && <span>Online: {journal.issnOnline}</span>}
                </div>
              )}
              <EditJournalForm journal={journal} />
            </CardContent>
          </Card>
        ))}
        {journals.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No journals yet. Create your first journal.
          </div>
        )}
      </div>
    </div>
  );
}
