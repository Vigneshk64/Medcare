"use client";

import { ReactNode } from "react";
import { type Role } from "@/lib/designTokens";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import AuthRedirect from "@/components/AuthRedirect";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardLayoutProps {
  role: Role;
  children: ReactNode;
  title: string;
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSignOut: () => void;
}

export default function DashboardLayout({
  role,
  children,
  title,
  sidebarItems,
  activeTab,
  onTabChange,
  onSignOut,
}: DashboardLayoutProps) {
  return (
    <AuthRedirect requiredRole={role}>
      <div className="min-h-screen bg-[#0a0a0f] text-white flex">
        {/* Sidebar */}
        <Sidebar
          role={role}
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DashboardHeader role={role} title={title} onSignOut={onSignOut} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthRedirect>
  );
}
