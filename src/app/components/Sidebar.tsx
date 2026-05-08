"use client";

import { ROLE_COLORS, type Role } from "@/lib/designTokens";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  role: Role;
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Sidebar({
  role,
  items,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const roleColor = ROLE_COLORS[role];

  return (
    <div className="w-64 bg-[#1a1a2e]/80 backdrop-blur-sm p-6 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
          MedCare
        </h2>
      </div>

      {/* Role Badge */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <span
          className="px-3 py-2 rounded-lg text-sm font-semibold text-white block text-center"
          style={{
            backgroundColor: `${roleColor.primary}40`,
            border: `1px solid ${roleColor.primary}`,
          }}
        >
          {role === "patient" && "👤"}
          {role === "doctor" && "👨‍⚕️"}
          {role === "pharmacist" && "💊"}
          {role === "delivery" && "🚚"}
          {role === "admin" && "👔"}
          {" "}
          {roleColor.name}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`sidebar-nav-item ${
              activeTab === item.id
                ? "sidebar-nav-item-active"
                : "sidebar-nav-item-inactive"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Version Info */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700">
        MedCare v1.0
      </div>
    </div>
  );
}
