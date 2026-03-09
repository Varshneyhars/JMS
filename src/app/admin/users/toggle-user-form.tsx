"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  isActive: boolean;
}

export function ToggleUserForm({ userId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}/toggle`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Badge
      variant={isActive ? "outline" : "secondary"}
      onClick={loading ? undefined : toggle}
      className={cn(
        "cursor-pointer select-none gap-1.5 transition-opacity",
        loading && "opacity-50 cursor-not-allowed",
        isActive
          ? "border-green-300 text-green-700 hover:bg-green-50"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isActive ? "bg-green-500" : "bg-slate-400"
          )}
        />
      )}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
