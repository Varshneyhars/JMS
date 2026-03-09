"use client";

interface KeywordCloudProps {
  keywords: string;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

const colors = [
  "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
  "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
  "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200",
  "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
  "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
];

export function KeywordCloud({ keywords, onKeywordClick, className }: KeywordCloudProps) {
  const tags = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag, i) => {
        const color = colors[i % colors.length];
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onKeywordClick?.(tag)}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${color} ${onKeywordClick ? "cursor-pointer" : "cursor-default pointer-events-none"}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
