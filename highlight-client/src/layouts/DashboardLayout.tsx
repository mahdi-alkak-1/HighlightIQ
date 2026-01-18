import { ReactNode } from "react";
import Sidebar from "@/components/navigation/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="relative h-screen overflow-hidden bg-brand-bg text-white">
      <div className="fixed left-0 top-0 h-screen w-60">
        <Sidebar />
      </div>
      <main className="ml-60 h-screen overflow-y-auto px-8 py-6 scrollbar-slim">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
