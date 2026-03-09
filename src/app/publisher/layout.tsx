import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function PublisherLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="AUTHOR">{children}</DashboardLayout>;
}
