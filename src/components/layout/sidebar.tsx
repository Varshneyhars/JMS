"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  CheckSquare,
  PlusCircle,
  Bell,
  UserCheck,
  User,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/submissions", label: "Submissions", icon: FileText },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reviewers", label: "Reviewers", icon: UserCheck },
    { href: "/admin/journals", label: "Journals", icon: BookOpen },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  REVIEWER: [
    { href: "/reviewer", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/reviewer/invitations", label: "Invitations", icon: Bell },
    { href: "/reviewer/active", label: "Active Reviews", icon: ClipboardList },
    { href: "/reviewer/completed", label: "Completed", icon: CheckSquare },
    { href: "/reviewer/profile", label: "My Profile", icon: User },
  ],
  AUTHOR: [
    { href: "/publisher", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/publisher/submit", label: "New Submission", icon: PlusCircle },
    { href: "/publisher/submissions", label: "My Manuscripts", icon: FileText },
    { href: "/publisher/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/publisher/profile", label: "My Profile", icon: User },
  ],
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  REVIEWER: "Peer Reviewer",
  AUTHOR: "Author",
};

interface SidebarProps {
  role: string;
  userName: string;
  userEmail: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] ?? [];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-screen w-60 flex-shrink-0 flex-col bg-zinc-950">
        {/* Brand */}
        <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white/10">
            <BookOpen className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold tracking-tight text-white">
              JMS
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              {roleLabels[role] ?? role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors duration-100",
                        isActive
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-white/70"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="mb-1 flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="bg-zinc-700 text-[11px] font-semibold text-zinc-200">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight text-white">
                {userName}
              </p>
              <p className="truncate text-xs leading-tight text-zinc-500">
                {userEmail}
              </p>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 transition-colors duration-100 hover:bg-white/5 hover:text-zinc-300"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sign out
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Sign out of JMS
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
