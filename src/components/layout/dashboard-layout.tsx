import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const roleDashboards: Record<string, string> = {
  ADMIN: "/admin",
  REVIEWER: "/reviewer",
  AUTHOR: "/publisher",
};

export async function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect(roleDashboards[session.user.role] ?? "/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        role={session.user.role}
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
