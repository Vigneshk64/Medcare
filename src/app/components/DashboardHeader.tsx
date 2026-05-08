"use client";

import { auth } from "@/lib/firebase";
import RoleColorBadge from "./RoleColorBadge";
import { type Role } from "@/lib/designTokens";

interface DashboardHeaderProps {
  role: Role;
  title: string;
  onSignOut: () => void;
}

export default function DashboardHeader({
  role,
  title,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header className="bg-[#1a1a2e]/60 backdrop-blur-sm px-8 py-4 flex justify-between items-center border-b border-gray-800">
      <h1 className="text-2xl font-semibold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <RoleColorBadge role={role} size="sm" />
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/40 rounded-xl">
          <span className="text-gray-300">{auth.currentUser?.displayName || role}</span>
          <button
            onClick={onSignOut}
            className="px-4 py-2 orange-gradient text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
