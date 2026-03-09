import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function daysSince(date: Date | string | null | undefined): number {
  if (!date) return 0;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    DESK_REVIEW: "bg-yellow-100 text-yellow-700",
    DESK_REJECTED: "bg-red-100 text-red-700",
    PEER_REVIEW: "bg-purple-100 text-purple-700",
    REVISION_REQUESTED: "bg-orange-100 text-orange-700",
    REVISION_SUBMITTED: "bg-indigo-100 text-indigo-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    IN_COPYEDITING: "bg-teal-100 text-teal-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    WITHDRAWN: "bg-gray-100 text-gray-500",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    DESK_REVIEW: "Under Desk Review",
    DESK_REJECTED: "Desk Rejected",
    PEER_REVIEW: "Under Peer Review",
    REVISION_REQUESTED: "Revision Requested",
    REVISION_SUBMITTED: "Revision Submitted",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    IN_COPYEDITING: "In Copyediting",
    PUBLISHED: "Published",
    WITHDRAWN: "Withdrawn",
  };
  return map[status] ?? status;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}
