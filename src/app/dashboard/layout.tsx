import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardFAB } from '@/components/DashboardFAB';
import { DashboardGuard } from '@/components/DashboardGuard';
import { Copilot } from '@/components/Copilot';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <div className="min-h-screen flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">{children}</div>
        <DashboardFAB />
        <Copilot />
      </div>
    </DashboardGuard>
  );
}
