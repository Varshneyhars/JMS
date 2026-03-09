import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout requiredRole="REVIEWER">{children}</DashboardLayout>;
}
