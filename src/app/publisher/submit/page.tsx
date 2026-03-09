import { db } from "@/lib/db";
import { SubmitForm } from "./submit-form";

export default async function SubmitPage() {
  const journals = await db.journal.findMany({
    where: { isActive: true },
    select: { id: true, name: true, scope: true, reviewType: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit Manuscript</h1>
        <p className="text-slate-500 mt-1">Complete all required fields. You can save as draft and return later.</p>
      </div>
      <SubmitForm journals={journals} />
    </div>
  );
}
